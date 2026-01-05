
import { YouTubeChannel, YouTubeVideo, SearchResult } from '../types';

const API_BASE = '/api';

export const youtubeApi = {
  searchChannels: async (keyword: string): Promise<YouTubeChannel[]> => {
    const searchRes = await fetch(`${API_BASE}/proxy?path=search&part=snippet&type=channel&maxResults=10&q=${encodeURIComponent(keyword)}`);
    const searchData = await searchRes.json();
    if (!searchData.items) return [];
    const ids = searchData.items.map((item: SearchResult) => item.id.channelId).join(',');
    return youtubeApi.getChannelsByIds(ids);
  },

  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    const res = await fetch(`${API_BASE}/proxy?path=channels&part=snippet,statistics,contentDetails&id=${ids}`);
    const data = await res.json();
    return data.items || [];
  },

  getChannelVideos: async (playlistId: string): Promise<YouTubeVideo[]> => {
    const playlistRes = await fetch(`${API_BASE}/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=10&playlistId=${playlistId}`);
    const playlistData = await playlistRes.json();
    const videoIds = playlistData.items?.map((v: any) => v.contentDetails.videoId).join(',') || '';
    if (!videoIds) return [];
    const videosRes = await fetch(`${API_BASE}/proxy?path=videos&part=snippet,statistics&id=${videoIds}`);
    const videosData = await videosRes.json();
    return videosData.items || [];
  }
};
