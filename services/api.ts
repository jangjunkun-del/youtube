
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
    // identifier could be ID or Handle
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

  // 채널 검색 (기본 정보 + 통계 포함)
  searchChannels: async (query: string, maxResults: number = 10): Promise<YouTubeChannel[]> => {
    const searchRes = await fetch(`${API_BASE}/proxy?path=search&part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    const searchData = await searchRes.json();
    const channelIds = searchData.items?.map((item: any) => item.id.channelId).filter(Boolean).join(',') || '';
    if (!channelIds) return [];
    return youtubeApi.getChannelsByIds(channelIds);
  },

  // 통합 검색 (채널 또는 비디오, 상세 정보 포함)
  search: async (query: string, type: 'channel' | 'video', order: string = 'relevance', maxResults: number = 20): Promise<any[]> => {
    const searchRes = await fetch(`${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${maxResults}&q=${encodeURIComponent(query)}&regionCode=KR`);
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

  // 성공 영상 검색 (성능 지수 기준 - 파라미터로 받은 days 이내 데이터로 한정)
  getSuccessVideos: async (category: string = '', maxResults: number = 20, days: number = 7): Promise<any[]> => {
    // 지정된 일수(days) 이전 날짜 계산 (ISO 8601 형식)
    const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const query = category ? `${category} 인기 영상` : "인기 급상승";
    
    // publishedAfter 파라미터를 사용하여 해당 기간 영상만 검색
    const res = await fetch(`${API_BASE}/proxy?path=search&part=snippet&type=video&order=viewCount&maxResults=${maxResults}&q=${encodeURIComponent(query)}&regionCode=KR&publishedAfter=${publishedAfter}`);
    const data = await res.json();
    
    const videoIds = data.items?.map((v: any) => v.id.videoId).join(',') || '';
    if (!videoIds) return [];

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
