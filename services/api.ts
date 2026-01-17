
import { YouTubeChannel, YouTubeVideo, SearchResult } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  // 공통 검색 엔진: 타입과 정렬 순서를 지정 가능하게 변경
  search: async (keyword: string, type: 'channel' | 'video' = 'channel', order: string = 'relevance', maxResults: number = 20): Promise<any[]> => {
    // YouTube API의 maxResults 한계는 50입니다.
    const safeMaxResults = Math.min(maxResults, 50);
    
    // 키워드가 없을 경우(전체 랭킹), 공백 하나(" ")를 쿼리로 사용하면 
    // 특정 단어에 치우치지 않고 해당 지역(KR)의 인기 있는 전체 채널/영상을 가져올 수 있습니다.
    const query = keyword && keyword.trim() !== "" ? keyword.trim() : " ";
    
    // URLSearchParams를 사용하여 안전하게 쿼리 스트링 생성
    const params = new URLSearchParams({
      path: 'search',
      part: 'snippet',
      type: type,
      order: order,
      maxResults: safeMaxResults.toString(),
      q: query,
      regionCode: 'KR',
      relevanceLanguage: 'ko'
    });

    const searchRes = await fetch(`${API_BASE}/proxy?${params.toString()}`);
    const searchData = await searchRes.json();
    
    if (!searchData.items || !Array.isArray(searchData.items) || searchData.items.length === 0) {
      console.warn('No search results found for query:', query);
      return [];
    }

    // 채널 또는 영상 ID 추출
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

  searchChannels: async (keyword: string, maxResults: number = 20): Promise<YouTubeChannel[]> => {
    return youtubeApi.search(keyword, 'channel', 'relevance', maxResults);
  }
};
