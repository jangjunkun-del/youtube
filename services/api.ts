
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
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  return h * 3600 + m * 60 + s;
};

/**
 * 제목이나 설명에 쇼츠 관련 태그가 포함되어 있는지 확인합니다.
 */
const isShortsContent = (title: string, durationSec: number): boolean => {
  const t = (title || '').toLowerCase();
  const hasTag = t.includes('#shorts') || t.includes('shorts') || t.includes('쇼츠');
  // 60초 이하이거나 제목에 쇼츠 태그가 있으면 쇼츠로 간주
  return durationSec <= 60 || hasTag;
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
    const catKey = `success_${category || 'all'}_${duration}`;
    
    try {
      if (db && !pageToken) {
        const { data: dbData, error: dbError } = await db.from('success_videos')
          .select('data, updated_at')
          .eq('category', catKey)
          .limit(1);
        
        if (!dbError && dbData && dbData.length > 0 && isCacheValid(dbData[0].updated_at)) {
          if (dbData[0].data && dbData[0].data.items && dbData[0].data.items.length > 0) {
            return dbData[0].data;
          }
        }
      }
    } catch (e) {}

    const result = await youtubeApi.search(category ? `${category} 인기` : "인기 영상", 'video', 'viewCount', maxResults, days, duration, pageToken);
    
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
    const cleanKeyword = `views_${keyword || 'trend'}_${duration}`;
    
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
          if (dbData[0].data && dbData[0].data.items && dbData[0].data.items.length > 0) {
            return dbData[0].data;
          }
        }
      }
    } catch (e) {}

    const duration: any = type.includes('short') ? 'short' : (type.includes('medium') || type.includes('long')) ? 'medium' : 'any';
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

  search: async (query: string, type: 'channel' | 'video', order: string = 'relevance', maxResults: number = 20, days?: number, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string, forceApiDuration?: string) => {
    let cleanQuery = query.trim() || "인기";
    let enhancedQuery = cleanQuery;
    let apiVideoDuration: string | undefined = forceApiDuration;

    // 내부 검색 배치를 최대치(50)로 설정하여 필터링 가용 풀을 확보합니다.
    const searchBatchSize = (type === 'video' && duration !== 'any') ? 50 : Math.min(maxResults, 50);

    if (type === 'video' && !forceApiDuration) {
      if (duration === 'short') {
        apiVideoDuration = 'short'; // API 레벨에서 4분 미만 필터링
      } else if (duration === 'medium' || duration === 'long') {
        // 롱폼 검색 시 쇼츠 키워드 제외 시도
        enhancedQuery = enhancedQuery.replace(/#shorts|shorts|쇼츠/gi, '').trim() + " -shorts";
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

      // 60초 기준 엄격 필터링
      if (duration === 'short') {
        finalItems = finalItems.filter((v: any) => {
          const sec = parseISO8601Duration(v.contentDetails.duration);
          return isShortsContent(v.snippet.title, sec);
        });
      } else if (duration === 'medium' || duration === 'long') {
        finalItems = finalItems.filter((v: any) => {
          const sec = parseISO8601Duration(v.contentDetails.duration);
          // 60초 초과이면서 쇼츠 관련 속성이 전혀 없는 것만 롱폼으로 간주
          return sec > 60 && !isShortsContent(v.snippet.title, sec);
        });

        // 중요: 필터링 결과 롱폼이 하나도 없다면, API의 'medium' 필터(4~20분)를 사용하여 강제 재조회합니다.
        if (finalItems.length === 0 && !forceApiDuration && !pageToken) {
          console.log("No long-form found in 'any' search, retrying with API duration filter...");
          return youtubeApi.search(query, type, order, maxResults, days, duration, pageToken, 'medium');
        }
      }

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
