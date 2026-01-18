
import { YouTubeChannel, YouTubeVideo } from '../types.ts';
import { getSupabase } from './supabase.ts';

const PROXY_PATH = '/api/proxy'; 
// 캐시 유효 기간: 4시간 (4 * 60 * 60 * 1000 ms)
const CACHE_EXPIRATION_MS = 4 * 60 * 60 * 1000;

/**
 * 데이터가 유효한지(4시간 이내인지) 확인합니다.
 */
const isCacheValid = (updatedAt: string | null) => {
  if (!updatedAt) return false;
  const lastUpdate = new Date(updatedAt).getTime();
  const now = new Date().getTime();
  return now - lastUpdate < CACHE_EXPIRATION_MS;
};

/**
 * 로컬스토리지에서 사용자 개인 API 키를 가져옵니다.
 */
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
      const data = await res.json().catch(() => ({}));
      
      const errorReason = data.error?.errors?.[0]?.reason;
      if (errorReason === 'quotaExceeded' || (res.status === 403 && errorReason === 'quotaExceeded')) {
        throw new Error('QUOTA_LIMIT_REACHED');
      }
      
      if (!res.ok) return { items: [], nextPageToken: null };
      return data;
    } catch (e: any) {
      if (e.message === 'QUOTA_LIMIT_REACHED') throw e;
      return { items: [], nextPageToken: null };
    }
  },

  getSuccessVideos: async (category: string = '', maxResults: number = 24, days: number = 30, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    try {
      const db = await getSupabase();
      if (db) {
        let query = db.from('success_videos')
          .select('data, created_at')
          .eq('video_type', duration)
          .order('created_at', { ascending: false })
          .limit(maxResults);
        
        if (category) query = query.eq('category', category);
        
        const { data: dbData, error } = await query;
        // DB에 데이터가 있고, 가장 최신 데이터가 4시간 이내라면 캐시 사용
        if (!error && dbData && dbData.length > 0 && isCacheValid(dbData[0].created_at)) {
          return { items: dbData.map((d: any) => d.data), nextPageToken: null };
        }
      }
    } catch (e) {}
    
    // 캐시가 없거나 만료된 경우 API 호출
    return youtubeApi.search(category ? `${category} 인기 영상` : "인기 급상승", 'video', 'viewCount', maxResults, days, duration, pageToken);
  },

  getViewsAnalysis: async (keyword: string, pageSize: number = 24) => {
    try {
      const db = await getSupabase();
      if (db) {
        const { data, error } = await db.from('views_analysis')
          .select('data, updated_at')
          .eq('keyword', keyword)
          .single();
        
        // 데이터가 존재하고 4시간 이내라면 반환
        if (!error && data && isCacheValid(data.updated_at)) {
          return data.data;
        }
      }
    } catch (e) {}
    
    // 데이터가 없거나 4시간이 지났으면 새로 가져옴
    const result = await youtubeApi.search(keyword, 'video', 'viewCount', pageSize, 7);
    
    try {
      const db = await getSupabase();
      if (db && result.items.length > 0) {
        // 최신 데이터로 업데이트 (Overwrite)
        await db.from('views_analysis').upsert({
          keyword: keyword,
          data: result,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {}
    
    return result;
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
    try {
      const db = await getSupabase();
      if (db) {
        const { data: cached } = await db.from('channels_cache')
          .select('data, updated_at')
          .or(`id.eq."${identifier}",custom_url.eq."${identifier.startsWith('@') ? identifier : '@' + identifier}"`)
          .single();
        
        // 캐시 데이터가 유효하면 즉시 반환
        if (cached && isCacheValid(cached.updated_at)) {
          return cached.data;
        }
      }
    } catch (e) {}

    let channelId = identifier;
    if (identifier.startsWith('@') || !identifier.startsWith('UC')) {
      const searchData = await youtubeApi.safeFetch('search', { part: 'snippet', type: 'channel', q: identifier, maxResults: 1 });
      channelId = searchData.items?.[0]?.id?.channelId || identifier;
    }
    
    const data = await youtubeApi.safeFetch('channels', { part: 'snippet,statistics,contentDetails,brandingSettings', id: channelId });
    const channel = data.items?.[0] || null;

    if (channel) {
      try {
        const db = await getSupabase();
        if (db) {
          await db.from('channels_cache').upsert({
            id: channel.id,
            custom_url: channel.snippet.customUrl,
            data: channel,
            updated_at: new Date().toISOString()
          });
        }
      } catch (e) {}
    }
    return channel;
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
