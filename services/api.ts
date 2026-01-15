
import { YouTubeChannel, YouTubeVideo, SearchResult } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  // 공통 검색 엔진: 타입과 정렬 순서를 지정 가능하게 변경
  search: async (keyword: string, type: 'channel' | 'video' = 'channel', order: string = 'relevance', maxResults: number = 10): Promise<any[]> => {
    const query = keyword || "유튜브"; // 빈 값일 경우 기본 키워드 설정
    const searchRes = await fetch(`${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${maxResults}&q=${encodeURIComponent(query)}&regionCode=KR`);
    const searchData = await searchRes.json();
    
    if (!searchData.items) return [];

    if (type === 'channel') {
      const ids = searchData.items.map((item: any) => item.id.channelId).join(',');
      return youtubeApi.getChannelsByIds(ids);
    } else {
      const ids = searchData.items.map((item: any) => item.id.videoId).join(',');
      return youtubeApi.getVideosByIds(ids);
    }
  },

  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    const res = await fetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    const data = await res.json();
    return data.items || [];
  },

  getVideosByIds: async (ids: string): Promise<YouTubeVideo[]> => {
    const res = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${ids}`);
    const data = await res.json();
    return data.items || [];
  },

  getChannelVideos: async (playlistId: string): Promise<YouTubeVideo[]> => {
    const playlistRes = await fetch(`${API_BASE}/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=10&playlistId=${playlistId}`);
    const playlistData = await playlistRes.json();
    const videoIds = playlistData.items?.map((v: any) => v.contentDetails.videoId).join(',') || '';
    if (!videoIds) return [];
    return youtubeApi.getVideosByIds(videoIds);
  },

  // 호환성을 위해 유지하되 내부적으로 search 호출
  searchChannels: async (keyword: string, maxResults: number = 10): Promise<YouTubeChannel[]> => {
    return youtubeApi.search(keyword, 'channel', 'relevance', maxResults);
  }
};
