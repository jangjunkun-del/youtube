
import { YouTubeChannel, YouTubeVideo } from '../types.ts';
import { getSupabase } from './supabase.ts';

const PROXY_PATH = '/api/proxy'; 
const CACHE_EXPIRATION_MS = 4 * 60 * 60 * 1000; // 4시간 캐시

const isCacheValid = (updatedAt: string | null) => {
  if (!updatedAt) return false;
  const lastUpdate = new Date(updatedAt).getTime();
  const now = new Date().getTime();
  return now - lastUpdate < CACHE_EXPIRATION_MS;
};

const getUserApiKey = () => localStorage.getItem('user_youtube_api_key');

export const youtubeApi = {
  safeFetch: async (endpoint: string, params: Record<string, any> = {}) => {
    const userKey = getUserApiKey();
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) queryParams.append(key, String(val));
    });

    let url: string;
    if (userKey) {
      queryParams.append('key', userKey);
      url = `https://www.googleapis.com/youtube/v3/${endpoint}?${queryParams.toString()}`;
    } else {
      queryParams.append('path', endpoint);
      url = `${PROXY_PATH}?${queryParams.toString()}`;
    }

    try {
      const res = await fetch(url);
      if (res.status === 403 || res.status === 402) throw new Error('QUOTA_LIMIT_REACHED');
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        const reason = data.error.errors?.[0]?.reason;
        if (reason === 'quotaExceeded' || reason === 'keyInvalid') throw new Error('QUOTA_LIMIT_REACHED');
        return { items: [], nextPageToken: null };
      }
      return data;
    } catch (e: any) {
      if (e.message === 'QUOTA_LIMIT_REACHED') throw e;
      return { items: [], nextPageToken: null };
    }
  },

  getSuccessVideos: async (category: string = '', maxResults: number = 24, days: number = 30, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    const db = await getSupabase();
    try {
      if (db) {
        let query = db.from('success_videos')
          .select('data, created_at')
          .order('created_at', { ascending: false })
          .limit(maxResults);
        
        if (category) query = query.eq('category', category);
        
        const { data: dbData, error } = await query;
        if (!error && dbData && dbData.length > 0 && isCacheValid(dbData[0].created_at)) {
          return { items: dbData.map((d: any) => d.data), nextPageToken: null };
        }
      }
    } catch (e) {
      console.warn("DB Read Error:", e);
    }

    // API 호출 후 DB에 저장
    const result = await youtubeApi.search(category ? `${category} 인기 영상` : "인기 급상승", 'video', 'viewCount', maxResults, days, duration, pageToken);
    
    if (db && result.items.length > 0 && !pageToken) {
      const rows = result.items.map((item: any) => ({
        category: category || 'trending',
        data: item
      }));
      // 기존 카테고리 데이터 삭제 후 새 데이터 삽입 (최신화)
      await db.from('success_videos').delete().eq('category', category || 'trending');
      await db.from('success_videos').insert(rows);
    }

    return result;
  },

  getViewsAnalysis: async (keyword: string, pageSize: number = 24) => {
    const db = await getSupabase();
    try {
      if (db) {
        const { data, error } = await db.from('views_analysis')
          .select('data, updated_at')
          .eq('keyword', keyword)
          .single();
        
        if (!error && data && isCacheValid(data.updated_at)) {
          return data.data;
        }
      }
    } catch (e) {}
    
    const result = await youtubeApi.search(keyword, 'video', 'viewCount', pageSize, 7);

    // API 호출 결과를 DB에 저장 (Upsert)
    if (db && result.items.length > 0) {
      await db.from('views_analysis').upsert({
        keyword: keyword,
        data: result,
        updated_at: new Date().toISOString()
      }, { onConflict: 'keyword' });
    }

    return result;
  },

  getChannelRankings: async (rankType: string, limit: number = 10) => {
    const db = await getSupabase();
    try {
      if (db) {
        const { data, error } = await db.from('channel_rankings')
          .select('data, updated_at')
          .eq('rank_type', rankType)
          .order('updated_at', { ascending: false })
          .limit(limit);
          
        if (!error && data && data.length > 0 && isCacheValid(data[0].updated_at)) {
          return data.map((d: any) => d.data);
        }
      }
    } catch (e) {}

    // 랭킹 데이터는 현재 Mock 데이터이거나 실시간 계산이 필요하므로 
    // 여기서는 DB 저장 로직만 구조적으로 열어둡니다.
    return null;
  },

  search: async (query: string, type: 'channel' | 'video', order: string = 'relevance', maxResults: number = 20, days?: number, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    let cleanQuery = query.trim() || "인기";
    let enhancedQuery = cleanQuery;
    if (type === 'video') {
      if (duration === 'short') enhancedQuery += " #Shorts";
      else if (duration === 'medium' || duration === 'long') enhancedQuery += " -Shorts -쇼츠";
    }

    const params: any = {
      part: 'snippet',
      type: type,
      order: order,
      maxResults: maxResults,
      q: enhancedQuery,
      regionCode: 'KR'
    };
    if (pageToken) params.pageToken = pageToken;
    if (days) {
      params.publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    }

    const searchData = await youtubeApi.safeFetch('search', params);
    const items = searchData.items || [];
    const nextPageToken = searchData.nextPageToken || null;

    if (type === 'video') {
      const videoIds = items.map((v: any) => v.id.videoId).filter(Boolean).join(',') || '';
      if (!videoIds) return { items: [], nextPageToken };
      const videoData = await youtubeApi.safeFetch('videos', { part: 'snippet,statistics,contentDetails', id: videoIds });
      return { items: videoData.items || [], nextPageToken };
    } else {
      const channelIds = items.map((c: any) => c.id.channelId).filter(Boolean).join(',') || '';
      if (!channelIds) return { items: [], nextPageToken };
      const channels = await youtubeApi.getChannelsByIds(channelIds);
      return { items: channels, nextPageToken };
    }
  },

  getChannelDetail: async (identifier: string): Promise<YouTubeChannel | null> => {
    let channelId = identifier;
    if (identifier.startsWith('@') || !identifier.startsWith('UC')) {
      const searchData = await youtubeApi.safeFetch('search', { part: 'snippet', type: 'channel', q: identifier, maxResults: 1 });
      channelId = searchData.items?.[0]?.id?.channelId || identifier;
    }
    const data = await youtubeApi.safeFetch('channels', { part: 'snippet,statistics,contentDetails,brandingSettings', id: channelId });
    return data.items?.[0] || null;
  },

  getVideoDetail: async (videoId: string): Promise<YouTubeVideo | null> => {
    const data = await youtubeApi.safeFetch('videos', { part: 'snippet,statistics,contentDetails', id: videoId });
    return data.items?.[0] || null;
  },

  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    if (!ids) return [];
    const data = await youtubeApi.safeFetch('channels', { part: 'snippet,statistics,contentDetails,brandingSettings', id: ids });
    return data.items || [];
  },

  getChannelVideos: async (playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> => {
    const data = await youtubeApi.safeFetch('playlistItems', { part: 'snippet,contentDetails', maxResults, playlistId });
    const videoIds = data.items?.map((v: any) => v.contentDetails?.videoId).join(',') || '';
    if (!videoIds) return [];
    const videoData = await youtubeApi.safeFetch('videos', { part: 'snippet,statistics,contentDetails', id: videoIds });
    return videoData.items || [];
  }
};
