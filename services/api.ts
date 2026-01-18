
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
      if (data.error) throw new Error(data.error.errors?.[0]?.reason || 'API_ERROR');
      return data;
    } catch (e: any) {
      if (e.message === 'quotaExceeded' || e.message === 'QUOTA_LIMIT_REACHED') throw new Error('QUOTA_LIMIT_REACHED');
      return { items: [], nextPageToken: null };
    }
  },

  // [성공 영상] 로직 보완
  getSuccessVideos: async (category: string = '', maxResults: number = 24, days: number = 30, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    const db = await getSupabase();
    const catKey = category || 'all_trending';
    
    // 1. 캐시 확인 (첫 페이지 요청일 때만)
    try {
      if (db && !pageToken) {
        const { data: dbData, error: dbError } = await db.from('success_videos')
          .select('data, updated_at')
          .eq('category', catKey)
          .limit(1);
        
        if (!dbError && dbData && dbData.length > 0 && isCacheValid(dbData[0].updated_at)) {
          console.log(`📦 Success Videos Cache Hit: ${catKey}`);
          return dbData[0].data;
        }
      }
    } catch (e) {
      console.warn("DB Cache fetch error:", e);
    }

    // 2. 실시간 데이터 호출
    const result = await youtubeApi.search(category ? `${category} 인기` : "인기 급상승", 'video', 'viewCount', maxResults, days, duration, pageToken);
    
    // 3. DB 저장 (첫 페이지일 때만 Upsert)
    if (db && result.items.length > 0 && !pageToken) {
      try {
        const { error: upsertError } = await db.from('success_videos').upsert({
          category: catKey,
          data: result,
          updated_at: new Date().toISOString()
        }, { onConflict: 'category' });
        
        if (upsertError) console.error("DB Save Error (success_videos):", upsertError);
        else console.log(`💾 Success Videos Saved to DB: ${catKey}`);
      } catch (e) {
        console.error("DB Upsert Exception:", e);
      }
    }
    return result;
  },

  // [조회수 분석] (정상 작동 중인 로직 유지 및 보강)
  getViewsAnalysis: async (keyword: string, pageSize: number = 24) => {
    const db = await getSupabase();
    const cleanKeyword = keyword || 'default_trending';
    
    try {
      if (db) {
        const { data, error } = await db.from('views_analysis')
          .select('data, updated_at')
          .eq('keyword', cleanKeyword)
          .limit(1);
        
        if (!error && data && data.length > 0 && isCacheValid(data[0].updated_at)) {
          return data[0].data;
        }
      }
    } catch (e) {}
    
    const result = await youtubeApi.search(cleanKeyword, 'video', 'viewCount', pageSize, 7);
    if (db && result.items.length > 0) {
      await db.from('views_analysis').upsert({
        keyword: cleanKeyword,
        data: result,
        updated_at: new Date().toISOString()
      }, { onConflict: 'keyword' });
    }
    return result;
  },

  // [성능 랭킹] 로직 보완
  getChannelRankings: async (rankType: string, limit: number = 20) => {
    const db = await getSupabase();
    const type = rankType || 'performance_any';
    
    // 1. 캐시 확인
    try {
      if (db) {
        const { data: dbData, error: dbError } = await db.from('channel_rankings')
          .select('data, updated_at')
          .eq('rank_type', type)
          .limit(1);
        
        if (!dbError && dbData && dbData.length > 0 && isCacheValid(dbData[0].updated_at)) {
          console.log(`📦 Ranking Cache Hit: ${type}`);
          return dbData[0].data;
        }
      }
    } catch (e) {
      console.warn("DB Ranking fetch error:", e);
    }

    // 2. 실시간 데이터 호출 (랭킹 타입에 따른 쿼리 최적화)
    const searchQuery = type.includes('short') ? "인기 쇼츠 #Shorts" : "인기 영상 인기 급상승";
    const result = await youtubeApi.search(searchQuery, 'video', 'viewCount', limit, 7);
    
    // 3. DB 저장
    if (db && result.items.length > 0) {
      try {
        const { error: upsertError } = await db.from('channel_rankings').upsert({
          rank_type: type,
          data: result,
          updated_at: new Date().toISOString()
        }, { onConflict: 'rank_type' });
        
        if (upsertError) console.error("DB Save Error (channel_rankings):", upsertError);
        else console.log(`💾 Performance Rankings Saved: ${type}`);
      } catch (e) {
        console.error("DB Upsert Exception (Rankings):", e);
      }
    }
    return result;
  },

  search: async (query: string, type: 'channel' | 'video', order: string = 'relevance', maxResults: number = 20, days?: number, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    let cleanQuery = query.trim() || "인기";
    let enhancedQuery = cleanQuery;
    if (type === 'video') {
      if (duration === 'short') enhancedQuery += " #Shorts";
      else if (duration === 'medium' || duration === 'long') enhancedQuery += " -Shorts -쇼츠";
    }

    const params: any = { part: 'snippet', type: type, order: order, maxResults: maxResults, q: enhancedQuery, regionCode: 'KR' };
    if (pageToken) params.pageToken = pageToken;
    if (days) params.publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const searchData = await youtubeApi.safeFetch('search', params);
    const items = searchData.items || [];
    const nextPageToken = searchData.nextPageToken || null;

    if (type === 'video') {
      const videoIds = items.map((v: any) => v.id.videoId).filter(Boolean).join(',');
      if (!videoIds) return { items: [], nextPageToken };
      const videoData = await youtubeApi.safeFetch('videos', { part: 'snippet,statistics,contentDetails', id: videoIds });
      return { items: videoData.items || [], nextPageToken };
    } else {
      const channelIds = items.map((c: any) => c.id.channelId).filter(Boolean).join(',');
      if (!channelIds) return { items: [], nextPageToken };
      const channels = await youtubeApi.getChannelsByIds(channelIds);
      return { items: channels, nextPageToken };
    }
  },

  getChannelDetail: async (id: string) => {
    const data = await youtubeApi.safeFetch('channels', { part: 'snippet,statistics,contentDetails,brandingSettings', id });
    return data.items?.[0] || null;
  },

  getVideoDetail: async (id: string) => {
    const data = await youtubeApi.safeFetch('videos', { part: 'snippet,statistics,contentDetails', id });
    return data.items?.[0] || null;
  },

  getChannelsByIds: async (ids: string) => {
    const data = await youtubeApi.safeFetch('channels', { part: 'snippet,statistics,contentDetails,brandingSettings', id: ids });
    return data.items || [];
  },

  getChannelVideos: async (playlistId: string, maxResults: number = 50) => {
    const data = await youtubeApi.safeFetch('playlistItems', { part: 'snippet,contentDetails', maxResults, playlistId });
    const videoIds = data.items?.map((v: any) => v.contentDetails?.videoId).join(',') || '';
    if (!videoIds) return [];
    const videoData = await youtubeApi.safeFetch('videos', { part: 'snippet,statistics,contentDetails', id: videoIds });
    return videoData.items || [];
  }
};
