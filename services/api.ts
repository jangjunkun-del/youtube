
import { YouTubeChannel, YouTubeVideo } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  // 공통 fetch 래퍼: 응답 전체(nextPageToken 포함)를 반환하도록 수정
  safeFetch: async (url: string) => {
    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));

      const errorReason = data.error?.errors?.[0]?.reason;
      if (errorReason === 'quotaExceeded' || (res.status === 403 && errorReason === 'quotaExceeded')) {
        throw new Error('QUOTA_LIMIT_REACHED');
      }

      if (!res.ok) {
        console.warn(`YouTube API error: ${res.status}`, data.error?.message);
        return { items: [], nextPageToken: null };
      }
      
      return data;
    } catch (e: any) {
      if (e.message === 'QUOTA_LIMIT_REACHED') throw e;
      console.error("Fetch failed:", e);
      return { items: [], nextPageToken: null };
    }
  },

  // 특정 영상 상세 정보 가져오기
  getVideoDetail: async (videoId: string): Promise<YouTubeVideo | null> => {
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoId}`);
    return data.items?.[0] || null;
  },

  // 채널 상세 정보 가져오기
  getChannelDetail: async (identifier: string): Promise<YouTubeChannel | null> => {
    let channelId = identifier;
    if (identifier.startsWith('@') || !identifier.startsWith('UC')) {
      const searchData = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=search&part=snippet&type=channel&q=${encodeURIComponent(identifier)}&maxResults=1`);
      channelId = searchData.items?.[0]?.id?.channelId || identifier;
    }
    
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}`);
    return data.items?.[0] || null;
  },

  // 통합 검색 (페이지네이션 지원)
  search: async (
    query: string, 
    type: 'channel' | 'video', 
    order: string = 'relevance', 
    maxResults: number = 20, 
    days?: number,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any',
    pageToken?: string
  ): Promise<{ items: any[], nextPageToken: string | null }> => {
    const fetchWithRetry = async (useDateFilter: boolean, useDurationFilter: boolean): Promise<{ items: any[], nextPageToken: string | null }> => {
      let cleanQuery = query.trim() || "인기";
      let enhancedQuery = cleanQuery;
      
      if (type === 'video') {
        if (duration === 'short') enhancedQuery += " #Shorts";
        else if (duration === 'medium' || duration === 'long') enhancedQuery += " -Shorts -쇼츠";
      }

      let url = `${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${maxResults}&q=${encodeURIComponent(enhancedQuery)}&regionCode=KR`;
      
      if (pageToken) url += `&pageToken=${pageToken}`;
      
      if (days && useDateFilter) {
        const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        url += `&publishedAfter=${encodeURIComponent(publishedAfter)}`;
      }

      if (type === 'video' && duration !== 'any' && useDurationFilter) {
        url += `&videoDuration=${duration}`;
      }

      const searchData = await youtubeApi.safeFetch(url);
      const items = searchData.items || [];
      const nextPageToken = searchData.nextPageToken || null;

      if (items.length === 0 && !pageToken) {
        if (useDateFilter) return fetchWithRetry(false, useDurationFilter);
        if (useDurationFilter) return fetchWithRetry(false, false);
      }

      if (type === 'video') {
        const videoIds = items.map((v: any) => v.id.videoId).filter(Boolean).join(',') || '';
        if (!videoIds) return { items: [], nextPageToken };
        const videoData = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
        return { items: videoData.items || [], nextPageToken };
      } else {
        const channelIds = items.map((c: any) => c.id.channelId).filter(Boolean).join(',') || '';
        if (!channelIds) return { items: [], nextPageToken };
        const channels = await youtubeApi.getChannelsByIds(channelIds);
        return { items: channels, nextPageToken };
      }
    };

    return fetchWithRetry(!!days, duration !== 'any');
  },

  // 여러 채널 ID로 채널 정보 가져오기
  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    if (!ids) return [];
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    return data.items || [];
  },

  // 최근 영상 리스트 가져오기
  getChannelVideos: async (playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> => {
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}`);
    const videoIds = data.items?.map((v: any) => v.contentDetails?.videoId).join(',') || '';
    
    if (!videoIds) return [];
    
    const videoData = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
    return videoData.items || [];
  },

  // 성공 영상 검색 (무한 스크롤 지원)
  getSuccessVideos: async (
    category: string = '', 
    maxResults: number = 20, 
    days: number = 30,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any',
    pageToken?: string
  ): Promise<{ items: any[], nextPageToken: string | null }> => {
    const query = category ? `${category} 인기 영상` : "인기 급상승";
    return youtubeApi.search(query, 'video', 'viewCount', maxResults, days, duration, pageToken);
  },

  calculatePerformance: (views: number, subscribers: number) => {
    if (subscribers === 0) return 0;
    return (views / subscribers) * 100;
  }
};
