
import { YouTubeChannel, YouTubeVideo, SearchResult } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  searchChannels: async (keyword: string, maxResults: number = 10): Promise<YouTubeChannel[]> => {
    // YouTube Search API의 'q' 파라미터는 내부적으로 채널 제목, 설명, 태그를 통합 검색합니다.
    const searchRes = await fetch(`${API_BASE}/proxy?path=search&part=snippet&type=channel&maxResults=${maxResults}&q=${encodeURIComponent(keyword)}`);
    const searchData = await searchRes.json();
    if (!searchData.items) return [];
    const ids = searchData.items.map((item: SearchResult) => item.id.channelId).join(',');
    
    // 가져온 ID들을 바탕으로 상세 데이터를 호출할 때 태그 정보(brandingSettings)를 포함시킵니다.
    return youtubeApi.getChannelsByIds(ids);
  },

  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    // 'brandingSettings' 파트 추가: 채널 운영자가 직접 설정한 검색 키워드(태그) 정보를 확보합니다.
    const res = await fetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    const data = await res.json();
    return data.items || [];
  },

  getChannelVideos: async (playlistId: string): Promise<YouTubeVideo[]> => {
    const playlistRes = await fetch(`${API_BASE}/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=10&playlistId=${playlistId}`);
    const playlistData = await playlistRes.json();
    const videoIds = playlistData.items?.map((v: any) => v.contentDetails.videoId).join(',') || '';
    if (!videoIds) return [];
    const videosRes = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
    const videosData = await videosRes.json();
    return videosData.items || [];
  }
};
