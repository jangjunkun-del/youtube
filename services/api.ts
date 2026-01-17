
import { YouTubeChannel, YouTubeVideo, SearchResult } from '../types.ts';

const API_BASE = '/api';

export const youtubeApi = {
  /**
   * YouTube API 검색 로직
   * @param keyword 검색어 (비어있을 경우 전체 랭킹으로 간주)
   * @param type 'channel' 또는 'video'
   * @param order 정렬 기준 ('viewCount', 'relevance', 'date' 등)
   * @param maxResults 결과 개수 (최대 50)
   */
  search: async (keyword: string, type: 'channel' | 'video' = 'channel', order: string = 'relevance', maxResults: number = 20): Promise<any[]> => {
    const safeMaxResults = Math.min(maxResults, 50);
    
    // 키워드가 없을 경우(전체 랭킹), 국내 채널들을 광범위하게 수집하기 위해 '한국' 키워드를 기본으로 사용합니다.
    // regionCode: 'KR'과 결합되어 국내 대형 채널들을 효과적으로 찾아냅니다.
    let query = keyword && keyword.trim() !== "" ? keyword.trim() : "한국";
    
    // 카테고리 메타데이터 검색 효율을 높이기 위해 키워드 보정 (예: '게임' -> '게임 채널')
    if (keyword && !keyword.includes('채널') && type === 'channel') {
      // 너무 길어지면 오히려 검색이 안될 수 있으므로 핵심 단어만 유지
    }

    const params = new URLSearchParams({
      path: 'search',
      part: 'snippet',
      type: type,
      order: order,
      maxResults: safeMaxResults.toString(),
      q: query,
      // 국내 채널 구분을 위해 KR 지역 코드와 한국어 설정을 엄격히 적용
      regionCode: 'KR',
      relevanceLanguage: 'ko'
    });

    try {
      const searchRes = await fetch(`${API_BASE}/proxy?${params.toString()}`);
      const searchData = await searchRes.json();
      
      if (!searchData.items || !Array.isArray(searchData.items) || searchData.items.length === 0) {
        // 만약 '한국' 키워드로도 결과가 없다면 더 범용적인 키워드로 재시도 (방어 로직)
        if (query === "한국") {
          params.set('q', 'youtube');
          const retryRes = await fetch(`${API_BASE}/proxy?${params.toString()}`);
          const retryData = await retryRes.json();
          if (!retryData.items) return [];
          return youtubeApi.processSearchResults(retryData.items, type);
        }
        return [];
      }

      return youtubeApi.processSearchResults(searchData.items, type);
    } catch (error) {
      console.error('API Search Error:', error);
      return [];
    }
  },

  // 검색 결과 리스트에서 ID를 추출하여 상세 정보를 가져오는 공통 프로세스
  processSearchResults: async (items: any[], type: 'channel' | 'video'): Promise<any[]> => {
    if (type === 'channel') {
      const ids = items
        .map((item: any) => item.id?.channelId)
        .filter((id: string | undefined): id is string => !!id)
        .join(',');
      
      if (!ids) return [];
      return youtubeApi.getChannelsByIds(ids);
    } else {
      const ids = items
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
