
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

/**
 * ISO 8601 재생 시간 포맷(PT#H#M#S)을 초 단위로 변환합니다.
 */
const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  return h * 3600 + m * 60 + s;
};

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

  getSuccessVideos: async (category: string = '', maxResults: number = 24, days: number = 30, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    const db = await getSupabase();
    const catKey = `${category || 'all_trending'}_${duration}`;
    
    try {
      if (db && !pageToken) {
        const { data: dbData, error: dbError } = await db.from('success_videos')
          .select('data, updated_at')
          .eq('category', catKey)
          .limit(1);
        
        if (!dbError && dbData && dbData.length > 0 && isCacheValid(dbData[0].updated_at)) {
          return dbData[0].data;
        }
      }
    } catch (e) {}

    const result = await youtubeApi.search(category ? `${category} 인기` : "인기 급상승", 'video', 'viewCount', maxResults, days, duration, pageToken);
    
    if (db && result.items.length > 0 && !pageToken) {
      try {
        await db.from('success_videos').upsert({
          id: catKey,
          category: catKey,
          data: result,
          created_at: new Date().toISOString()
        });
      } catch (e) {}
    }
    return result;
  },

  getViewsAnalysis: async (keyword: string, pageSize: number = 24, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    const db = await getSupabase();
    const cleanKeyword = `${keyword || 'default_trending'}_${duration}`;
    
    try {
      if (db && !pageToken) {
        const { data, error } = await db.from('views_analysis')
          .select('data, updated_at')
          .eq('keyword', cleanKeyword)
          .limit(1);
        
        if (!error && data && data.length > 0 && isCacheValid(data[0].updated_at)) {
          return data[0].data;
        }
      }
    } catch (e) {}
    
    const result = await youtubeApi.search(keyword || "인기", 'video', 'viewCount', pageSize, 7, duration, pageToken);
    if (db && result.items.length > 0 && !pageToken) {
      try {
        await db.from('views_analysis').upsert({
          id: cleanKeyword,
          keyword: cleanKeyword,
          data: result,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }
    return result;
  },

  getChannelRankings: async (rankType: string, limit: number = 20, pageToken?: string) => {
    const db = await getSupabase();
    const type = rankType || 'performance_any';
    
    try {
      if (db && !pageToken) {
        const { data: dbData, error: dbError } = await db.from('channel_rankings')
          .select('data, updated_at')
          .eq('rank_type', type)
          .limit(1);
        
        if (!dbError && dbData && dbData.length > 0 && isCacheValid(dbData[0].updated_at)) {
          return dbData[0].data;
        }
      }
    } catch (e) {}

    const duration: any = type.includes('short') ? 'short' : type.includes('medium') ? 'medium' : 'any';
    const searchQuery = duration === 'short' ? "인기 쇼츠" : "인기 영상 인기 급상승";
    const result = await youtubeApi.search(searchQuery, 'video', 'viewCount', limit, 7, duration, pageToken);
    
    if (db && result.items.length > 0 && !pageToken) {
      try {
        await db.from('channel_rankings').upsert({
          id: type,
          rank_type: type,
          data: result,
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }
    return result;
  },

  search: async (query: string, type: 'channel' | 'video', order: string = 'relevance', maxResults: number = 20, days?: number, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    let cleanQuery = query.trim() || "인기";
    let enhancedQuery = cleanQuery;
    let apiVideoDuration: string | undefined = undefined;

    // 필터링 풀을 확보하기 위해 내부적으로는 항상 최대치(50개)를 요청합니다.
    const searchBatchSize = (duration === 'any' || type === 'channel') ? Math.min(maxResults, 50) : 50;

    if (type === 'video') {
      if (duration === 'short') {
        enhancedQuery += " #Shorts";
        apiVideoDuration = 'short'; // < 4 min
      } else if (duration === 'medium' || duration === 'long') {
        // 롱폼 검색 시 쇼츠 관련 키워드를 마이너스 처리하여 검색 품질을 높입니다.
        enhancedQuery += " -#shorts -shorts -쇼츠";
        // YouTube API의 'medium'은 4분~20분만 포함하므로, 1분~4분 롱폼을 위해 'any'로 요청 후 수동 필터링합니다.
        apiVideoDuration = undefined; 
      }
    }

    const params: any = { 
      part: 'snippet', 
      type: type, 
      order: order, 
      maxResults: searchBatchSize, 
      q: enhancedQuery, 
      regionCode: 'KR' 
    };
    if (pageToken) params.pageToken = pageToken;
    if (apiVideoDuration) params.videoDuration = apiVideoDuration;
    if (days) params.publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const searchData = await youtubeApi.safeFetch('search', params);
    const items = searchData.items || [];
    const nextPageToken = searchData.nextPageToken || null;

    if (type === 'video') {
      const videoIds = items.map((v: any) => v.id.videoId).filter(Boolean).join(',');
      if (!videoIds) return { items: [], nextPageToken };
      const videoData = await youtubeApi.safeFetch('videos', { part: 'snippet,statistics,contentDetails', id: videoIds });
      
      let finalItems = videoData.items || [];

      // UX 기준 쇼츠(60초 이하)와 롱폼(60초 초과)을 엄격하게 분리합니다.
      if (duration === 'short') {
        finalItems = finalItems.filter((v: any) => {
          const sec = parseISO8601Duration(v.contentDetails.duration);
          return sec > 0 && sec <= 60;
        });
      } else if (duration === 'medium' || duration === 'long') {
        finalItems = finalItems.filter((v: any) => {
          const sec = parseISO8601Duration(v.contentDetails.duration);
          const title = (v.snippet.title || '').toLowerCase();
          // 제목에 쇼츠가 명시된 경우도 한 번 더 제외합니다.
          const isShortsTag = title.includes('#shorts') || title.includes('shorts');
          return sec > 60 && !isShortsTag;
        });
      }

      // 사용자가 요청한 개수만큼만 잘라서 반환합니다.
      return { items: finalItems.slice(0, maxResults), nextPageToken };
    } else {
      const channelIds = items.map((c: any) => c.id.channelId).filter(Boolean).join(',');
      if (!channelIds) return { items: [], nextPageToken };
      const channels = await youtubeApi.getChannelsByIds(channelIds);
      return { items: channels.slice(0, maxResults), nextPageToken };
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
    if (!ids) return [];
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
