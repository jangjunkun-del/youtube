
import { YouTubeChannel, YouTubeVideo, SearchResult } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  // 공통 검색 엔진: 타입과 정렬 순서를 지정 가능하게 변경
  search: async (keyword: string, type: 'channel' | 'video' = 'channel', order: string = 'relevance', maxResults: number = 20): Promise<any[]> => {
    const query = keyword || "유튜브"; // 빈 값일 경우 기본 키워드 설정
    
    // YouTube API의 maxResults 한계는 50입니다. 100 요청 시 에러가 발생하므로 캡핑합니다.
    const safeMaxResults = Math.min(maxResults, 50);
    
    // 한국어 결과(relevanceLanguage=ko)와 한국 지역(regionCode=KR)을 명시적으로 추가
    const searchRes = await fetch(
      `${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${safeMaxResults}&q=${encodeURIComponent(query)}&regionCode=KR&relevanceLanguage=ko`
    );
    const searchData = await searchRes.json();
    
    if (!searchData.items || searchData.items.length === 0) return [];

    // 채널 또는 영상 ID 추출 (id 객체 구조가 다를 수 있으므로 안전하게 필터링)
    if (type === 'channel') {
      const ids = searchData.items
        .filter((item: any) => item.id && item.id.channelId)
        .map((item: any) => item.id.channelId)
        .join(',');
      
      if (!ids) return [];
      return youtubeApi.getChannelsByIds(ids);
    } else {
      const ids = searchData.items
        .filter((item: any) => item.id && item.id.videoId)
        .map((item: any) => item.id.videoId)
        .join(',');
      
      if (!ids) return [];
      return youtubeApi.getVideosByIds(ids);
    }
  },

  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    if (!ids) return [];
    const res = await fetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    const data = await res.json();
    // API 응답 순서가 요청 ID 순서와 다를 수 있으므로 정렬은 컴포넌트에서 수행
    return data.items || [];
  },

  getVideosByIds: async (ids: string): Promise<YouTubeVideo[]> => {
    if (!ids) return [];
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
  searchChannels: async (keyword: string, maxResults: number = 20): Promise<YouTubeChannel[]> => {
    return youtubeApi.search(keyword, 'channel', 'relevance', maxResults);
  }
};
