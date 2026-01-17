
import { YouTubeChannel, YouTubeVideo } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  // 공통 fetch 래퍼: 에러 핸들링 포함
  safeFetch: async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`YouTube API error: ${res.status}`);
        return { items: [] };
      }
      return await res.json();
    } catch (e) {
      console.error("Fetch failed:", e);
      return { items: [] };
    }
  },

  // 특정 영상 상세 정보 가져오기
  getVideoDetail: async (videoId: string): Promise<YouTubeVideo | null> => {
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoId}`);
    return data.items?.[0] || null;
  },

  // 채널 상세 정보 가져오기 (ID 또는 핸들)
  getChannelDetail: async (identifier: string): Promise<YouTubeChannel | null> => {
    let channelId = identifier;
    if (identifier.startsWith('@') || !identifier.startsWith('UC')) {
      const searchData = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=search&part=snippet&type=channel&q=${encodeURIComponent(identifier)}&maxResults=1`);
      channelId = searchData.items?.[0]?.id?.channelId || identifier;
    }
    
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}`);
    return data.items?.[0] || null;
  },

  // 여러 채널 ID로 채널 정보 가져오기
  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    if (!ids) return [];
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    return data.items || [];
  },

  // 통합 검색 (최적화된 Fallback 로직)
  search: async (
    query: string, 
    type: 'channel' | 'video', 
    order: string = 'relevance', 
    maxResults: number = 20, 
    days?: number,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any'
  ): Promise<any[]> => {
    const fetchWithRetry = async (useDateFilter: boolean, useDurationFilter: boolean): Promise<any[]> => {
      // 검색어가 비어있을 경우 기본값 설정
      let cleanQuery = query.trim() || "인기";
      let enhancedQuery = cleanQuery;
      
      if (type === 'video') {
        if (duration === 'short') enhancedQuery += " #Shorts";
        else if (duration === 'medium' || duration === 'long') enhancedQuery += " -Shorts -쇼츠";
      }

      let url = `${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${maxResults}&q=${encodeURIComponent(enhancedQuery)}&regionCode=KR`;
      
      // 날짜 필터 (가장 먼저 완화할 대상)
      if (days && useDateFilter) {
        const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        url += `&publishedAfter=${encodeURIComponent(publishedAfter)}`;
      }

      // 길이 필터
      if (type === 'video' && duration !== 'any' && useDurationFilter) {
        url += `&videoDuration=${duration}`;
      }

      const searchData = await youtubeApi.safeFetch(url);
      const items = searchData.items || [];

      // 결과가 없을 경우 조건 완화하여 재시도
      if (items.length === 0) {
        if (useDateFilter) return fetchWithRetry(false, useDurationFilter); // 1단계: 날짜 필터 제거
        if (useDurationFilter) return fetchWithRetry(false, false); // 2단계: 길이 필터 제거
      }

      if (type === 'video') {
        const videoIds = items.map((v: any) => v.id.videoId).filter(Boolean).join(',') || '';
        if (!videoIds) return [];
        const videoData = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
        return videoData.items || [];
      } else {
        const channelIds = items.map((c: any) => c.id.channelId).filter(Boolean).join(',') || '';
        if (!channelIds) return [];
        return youtubeApi.getChannelsByIds(channelIds);
      }
    };

    return fetchWithRetry(!!days, duration !== 'any');
  },

  // 최근 영상 리스트 가져오기
  getChannelVideos: async (playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> => {
    const data = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}`);
    const videoIds = data.items?.map((v: any) => v.contentDetails?.videoId).join(',') || '';
    
    if (!videoIds) return [];
    
    const videoData = await youtubeApi.safeFetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
    return videoData.items || [];
  },

  // 성공 영상 검색 (성능 최적화 버전)
  getSuccessVideos: async (
    category: string = '', 
    maxResults: number = 20, 
    days: number = 7,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any'
  ): Promise<any[]> => {
    // search 함수를 활용하여 Fallback 로직 일원화
    const query = category ? `${category} 인기 영상` : "인기 급상승";
    return youtubeApi.search(query, 'video', 'viewCount', maxResults, days, duration);
  },

  // 구독자 대비 조회수 계산
  calculatePerformance: (views: number, subscribers: number) => {
    if (subscribers === 0) return 0;
    return (views / subscribers) * 100;
  }
};
