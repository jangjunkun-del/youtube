
import { YouTubeChannel, YouTubeVideo, SearchResult } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  // 공통 검색 엔진: 타입과 정렬 순서를 지정 가능하게 변경
  search: async (keyword: string, type: 'channel' | 'video' = 'channel', order: string = 'relevance', maxResults: number = 20): Promise<any[]> => {
    // 쿼리가 없을 경우 한국의 인기 채널들을 가져오기 위한 기본 검색어 설정
    const query = keyword || (type === 'channel' ? "한국 채널" : "한국 인기 영상");
    
    // YouTube API의 maxResults 한계는 50입니다.
    const safeMaxResults = Math.min(maxResults, 50);
    
    // 한국어 결과(relevanceLanguage=ko)와 한국 지역(regionCode=KR)을 명시적으로 추가
    // q 파라미터가 검색 결과의 양을 결정하므로 인코딩에 유의
    const searchRes = await fetch(
      `${API_BASE}/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${safeMaxResults}&q=${encodeURIComponent(query)}&regionCode=KR&relevanceLanguage=ko`
    );
    const searchData = await searchRes.json();
    
    if (!searchData.items || !Array.isArray(searchData.items) || searchData.items.length === 0) {
      console.warn('No search results found for query:', query);
      return [];
    }

    // 채널 또는 영상 ID 추출 (id 객체 구조가 다를 수 있으므로 안전하게 필터링)
    if (type === 'channel') {
      const ids = searchData.items
        .map((item: any) => item.id?.channelId)
        .filter((id: string | undefined): id is string => !!id)
        .join(',');
      
      if (!ids) return [];
      return youtubeApi.getChannelsByIds(ids);
    } else {
      const ids = searchData.items
        .map((item: any) => item.id?.videoId)
        .filter((id: string | undefined): id is string => !!id)
        .join(',');
      
      if (!ids) return [];
      return youtubeApi.getVideosByIds(ids);
    }
  },

  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    if (!ids) return [];
    const res = await fetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    const data = await res.json();
    // 데이터가 존재할 경우만 반환
    return data.items || [];
  },

  getVideosByIds: async (ids: string): Promise<YouTubeVideo[]> => {
    if (!ids) return [];
    const res = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics,contentDetails&id=${ids}`);
    const data = await res.json();
    return data.items || [];
  },

  getChannelVideos: async (playlistId: string): Promise<YouTubeVideo[]> => {
    if (!playlistId) return [];
    const playlistRes = await fetch(`${API_BASE}/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=10&playlistId=${playlistId}`);
    const playlistData = await playlistRes.json();
    const videoIds = playlistData.items?.map((v: any) => v.contentDetails?.videoId).filter(Boolean).join(',') || '';
    if (!videoIds) return [];
    return youtubeApi.getVideosByIds(videoIds);
  },

  // 호환성을 위해 유지하되 내부적으로 search 호출
  searchChannels: async (keyword: string, maxResults: number = 20): Promise<YouTubeChannel[]> => {
    return youtubeApi.search(keyword, 'channel', 'relevance', maxResults);
  }
};
