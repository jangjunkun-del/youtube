
import { YouTubeChannel, YouTubeVideo } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  // 특정 영상 상세 정보 가져오기
  getVideoDetail: async (videoId: string): Promise<YouTubeVideo | null> => {
    const res = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoId}`);
    const data = await res.json();
    return data.items?.[0] || null;
  },

  // 채널 상세 정보 가져오기 (ID 또는 핸들)
  getChannelDetail: async (identifier: string): Promise<YouTubeChannel | null> => {
    let channelId = identifier;
    if (identifier.startsWith('@') || !identifier.startsWith('UC')) {
      const searchRes = await fetch(`${API_BASE}/proxy?path=search&part=snippet&type=channel&q=${encodeURIComponent(identifier)}&maxResults=1`);
      const searchData = await searchRes.json();
      channelId = searchData.items?.[0]?.id?.channelId || identifier;
    }
    
    const res = await fetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}`);
    const data = await res.json();
    return data.items?.[0] || null;
  },

  // 여러 채널 ID로 채널 정보 가져오기
  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    if (!ids) return [];
    const res = await fetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    const data = await res.json();
    return data.items || [];
  },

  // 통합 검색 (최근 기간 및 영상 길이 필터 최적화 + Fallback 로직)
  search: async (
    query: string, 
    type: 'channel' | 'video', 
    order: string = 'relevance', 
    maxResults: number = 20, 
    days?: number,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any'
  ): Promise<any[]> => {
    const fetchWithFilter = async (targetDuration: string, isRetry: boolean = false) => {
      let enhancedQuery = query;
      // 검색어 보정: 롱폼일 경우 Shorts 제외, 쇼츠일 경우 Shorts 강조
      if (type === 'video') {
        if (duration === 'short') enhancedQuery += " #Shorts";
        else if (duration === 'medium' || duration === 'long') enhancedQuery += " -Shorts -쇼츠";
      }

      let url = `${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${maxResults}&q=${encodeURIComponent(enhancedQuery)}&regionCode=KR`;
      
      if (days) {
        const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        url += `&publishedAfter=${encodeURIComponent(publishedAfter)}`;
      }

      // 1차 시도에서는 엄격한 videoDuration 적용, 재시도(Fallback) 시에는 해제하여 검색어 보정에만 의존
      if (type === 'video' && targetDuration !== 'any' && !isRetry) {
        url += `&videoDuration=${targetDuration}`;
      }

      const searchRes = await fetch(url);
      const searchData = await searchRes.json();
      
      if (type === 'video') {
        const items = searchData.items || [];
        // 결과가 0건이고 아직 재시도 전이라면, duration 필터를 풀고 검색어 필터만으로 재시도
        if (items.length === 0 && targetDuration !== 'any' && !isRetry) {
          return fetchWithFilter('any', true);
        }

        const videoIds = items.map((v: any) => v.id.videoId).filter(Boolean).join(',') || '';
        if (!videoIds) return [];
        const videoRes = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
        const videoData = await videoRes.json();
        return videoData.items || [];
      } else {
        const channelIds = searchData.items?.map((c: any) => c.id.channelId).filter(Boolean).join(',') || '';
        if (!channelIds) return [];
        return youtubeApi.getChannelsByIds(channelIds);
      }
    };

    return fetchWithFilter(duration);
  },

  // 최근 영상 및 성과 분석
  getChannelVideos: async (playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> => {
    const res = await fetch(`${API_BASE}/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}`);
    const data = await res.json();
    const videoIds = data.items?.map((v: any) => v.contentDetails?.videoId).join(',') || '';
    
    if (!videoIds) return [];
    
    const videoRes = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
    const videoData = await videoRes.json();
    return videoData.items || [];
  },

  // 성공 영상 검색 (Smart Fallback 적용)
  getSuccessVideos: async (
    category: string = '', 
    maxResults: number = 20, 
    days: number = 7,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any'
  ): Promise<any[]> => {
    const fetchSuccessWithFilter = async (targetDuration: string, isRetry: boolean = false) => {
      const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      let query = category ? `${category} 인기 영상` : "인기 급상승";
      
      if (targetDuration === 'short') query += " #Shorts";
      else if (targetDuration === 'medium' || targetDuration === 'long') query += " -Shorts -쇼츠";
      
      let url = `${API_BASE}/proxy?path=search&part=snippet&type=video&order=viewCount&maxResults=${maxResults}&q=${encodeURIComponent(query)}&regionCode=KR&publishedAfter=${encodeURIComponent(publishedAfter)}`;
      
      if (targetDuration !== 'any' && !isRetry) {
        url += `&videoDuration=${targetDuration}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      const items = data.items || [];

      // 결과 0건 시 Fallback 로직
      if (items.length === 0 && targetDuration !== 'any' && !isRetry) {
        return fetchSuccessWithFilter('any', true);
      }
      
      const videoIds = items.map((v: any) => v.id.videoId).join(',') || '';
      if (!videoIds) return [];

      const videoRes = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
      const videoData = await videoRes.json();
      return videoData.items || [];
    };

    return fetchSuccessWithFilter(duration);
  },

  // 구독자 대비 조회수(상대 성과) 계산 로직
  calculatePerformance: (views: number, subscribers: number) => {
    if (subscribers === 0) return 0;
    return (views / subscribers) * 100;
  }
};
