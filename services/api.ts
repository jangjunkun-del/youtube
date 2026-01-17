
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

  // 통합 검색 (최근 기간 및 영상 길이 필터 최적화)
  search: async (
    query: string, 
    type: 'channel' | 'video', 
    order: string = 'relevance', 
    maxResults: number = 20, 
    days?: number,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any'
  ): Promise<any[]> => {
    // 필터 성능을 높이기 위해 쿼리 보정 (쇼츠일 경우 Shorts 키워드 추가)
    let enhancedQuery = query;
    if (type === 'video') {
      if (duration === 'short') enhancedQuery += " #Shorts";
      else if (duration === 'medium' || duration === 'long') enhancedQuery += " -Shorts";
    }

    let url = `${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${maxResults}&q=${encodeURIComponent(enhancedQuery)}&regionCode=KR`;
    
    if (days) {
      const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      url += `&publishedAfter=${publishedAfter}`;
    }

    // 유튜브 API 특성상 videoDuration은 type=video와 함께 사용해야 함
    if (type === 'video' && duration !== 'any') {
      url += `&videoDuration=${duration}`;
    }

    const searchRes = await fetch(url);
    const searchData = await searchRes.json();
    
    if (type === 'video') {
      const videoIds = searchData.items?.map((v: any) => v.id.videoId).filter(Boolean).join(',') || '';
      if (!videoIds) return [];
      const videoRes = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
      const videoData = await videoRes.json();
      return videoData.items || [];
    } else {
      const channelIds = searchData.items?.map((c: any) => c.id.channelId).filter(Boolean).join(',') || '';
      if (!channelIds) return [];
      return youtubeApi.getChannelsByIds(channelIds);
    }
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

  // 성공 영상 검색 (영상 길이 필터 최적화)
  getSuccessVideos: async (
    category: string = '', 
    maxResults: number = 20, 
    days: number = 7,
    duration: 'any' | 'short' | 'medium' | 'long' = 'any'
  ): Promise<any[]> => {
    const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    // 쿼리 보정: 필터링 결과가 0건이 나오는 것을 방지하기 위해 검색어 최적화
    let query = category ? `${category} 인기 영상` : "인기 급상승";
    if (duration === 'short') query += " #Shorts";
    else if (duration === 'medium' || duration === 'long') query += " -Shorts";
    
    let url = `${API_BASE}/proxy?path=search&part=snippet&type=video&order=viewCount&maxResults=${maxResults}&q=${encodeURIComponent(query)}&regionCode=KR&publishedAfter=${publishedAfter}`;
    
    if (duration !== 'any') {
      url += `&videoDuration=${duration}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    
    const videoIds = data.items?.map((v: any) => v.id.videoId).join(',') || '';
    if (!videoIds) {
      // 만약 duration 필터 때문에 결과가 0건이면, 필터를 살짝 완화해서 다시 시도하거나 
      // 현재는 빈 배열을 반환하여 사용자에게 알림 (안전한 처리를 위해)
      return [];
    }

    const videoRes = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
    const videoData = await videoRes.json();
    return videoData.items || [];
  },

  // 구독자 대비 조회수(상대 성과) 계산 로직
  calculatePerformance: (views: number, subscribers: number) => {
    if (subscribers === 0) return 0;
    return (views / subscribers) * 100;
  }
};
