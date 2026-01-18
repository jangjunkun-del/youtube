
import { YouTubeChannel, YouTubeVideo } from '../types.ts';
import { getSupabase } from './supabase.ts';

// 통합된 프록시 경로를 사용합니다.
const API_BASE = ''; 

export const youtubeApi = {
  safeFetch: async (url: string) => {
    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      const errorReason = data.error?.errors?.[0]?.reason;
      if (errorReason === 'quotaExceeded' || (res.status === 403 && errorReason === 'quotaExceeded')) {
        throw new Error('QUOTA_LIMIT_REACHED');
      }
      if (!res.ok) return { items: [], nextPageToken: null };
      return data;
    } catch (e: any) {
      if (e.message === 'QUOTA_LIMIT_REACHED') throw e;
      return { items: [], nextPageToken: null };
    }
  },

  getSuccessVideos: async (category: string = '', maxResults: number = 24, days: number = 30, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    try {
      const db = await getSupabase();
      if (db) {
        let query = db.from('success_videos').select('data').eq('video_type', duration).order('created_at', { ascending: false }).limit(maxResults);
        if (category) query = query.eq('category', category);
        const { data: dbData, error } = await query;
        if (!error && dbData && dbData.length > 0) return { items: dbData.map((d: any) => d.data), nextPageToken: null };
      }
    } catch (e) {}
    const queryStr = category ? `${category} 인기 영상` : "인기 급상승";
    return youtubeApi.search(queryStr, 'video', 'viewCount', maxResults, days, duration, pageToken);
  },

  getRankingsFromDb: async (rankType: string, category: string = '') => {
    try {
      const db = await getSupabase();
      if (!db) return null;
      let query = db.from('channel_rankings').select('data').eq('rank_type', rankType);
      if (category) query = query.eq('category', category);
      const { data, error } = await query.order('updated_at', { ascending: false }).limit(50);
      if (!error && data && data.length > 0) return { items: data.map((d: any) => d.data), nextPageToken: null };
    } catch (e) {}
    return null;
  },

  getViewsAnalysis: async (keyword: string, pageSize: number = 24) => {
    try {
      const db = await getSupabase();
      if (db) {
        const { data, error } = await db.from('views_analysis').select('data').eq('keyword', keyword).single();
        if (!error && data) return data.data;
      }
    } catch (e) {}
    return youtubeApi.search(keyword, 'video', 'viewCount', pageSize, 7);
  },

  search: async (query: string, type: 'channel' | 'video', order: string = 'relevance', maxResults: number = 20, days?: number, duration: 'any' | 'short' | 'medium' | 'long' = 'any', pageToken?: string) => {
    if (!pageToken && !query.includes('@')) {
      const dbRank = await youtubeApi.getRankingsFromDb(order);
      if (dbRank) return dbRank;
    }
    let cleanQuery = query.trim() || "인기";
    let enhancedQuery = cleanQuery;
    if (type === 'video') {
      if (duration === 'short') enhancedQuery += " #Shorts";
      else if (duration === 'medium' || duration === 'long') enhancedQuery += " -Shorts -쇼츠";
    }
    let url = `/proxy?path=search&part=snippet&type=${type}&order=${order}&maxResults=${maxResults}&q=${encodeURIComponent(enhancedQuery)}&regionCode=KR`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    if (days) {
      const publishedAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      url += `&publishedAfter=${encodeURIComponent(publishedAfter)}`;
    }
    const searchData = await youtubeApi.safeFetch(url);
    const items = searchData.items || [];
    const nextPageToken = searchData.nextPageToken || null;
    if (type === 'video') {
      const videoIds = items.map((v: any) => v.id.videoId).filter(Boolean).join(',') || '';
      if (!videoIds) return { items: [], nextPageToken };
      const videoData = await youtubeApi.safeFetch(`/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
      return { items: videoData.items || [], nextPageToken };
    } else {
      const channelIds = items.map((c: any) => c.id.channelId).filter(Boolean).join(',') || '';
      if (!channelIds) return { items: [], nextPageToken };
      const channels = await youtubeApi.getChannelsByIds(channelIds);
      return { items: channels, nextPageToken };
    }
  },

  getVideoDetail: async (videoId: string): Promise<YouTubeVideo | null> => {
    const data = await youtubeApi.safeFetch(`/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoId}`);
    return data.items?.[0] || null;
  },

  getChannelDetail: async (identifier: string): Promise<YouTubeChannel | null> => {
    // 1. DB 캐시 먼저 확인 (API 소모량 절약)
    try {
      const db = await getSupabase();
      if (db) {
        const { data: cached } = await db.from('channels_cache').select('data').or(`id.eq.${identifier},custom_url.eq.${identifier}`).single();
        if (cached) return cached.data;
      }
    } catch (e) {}

    let channelId = identifier;
    // 핸들이나 이름으로 검색하는 경우 (search API 사용 - 100포인트 소모)
    if (identifier.startsWith('@') || !identifier.startsWith('UC')) {
      const searchData = await youtubeApi.safeFetch(`/proxy?path=search&part=snippet&type=channel&q=${encodeURIComponent(identifier)}&maxResults=1`);
      channelId = searchData.items?.[0]?.id?.channelId || identifier;
    }
    
    // 상세 정보 조회 (list API 사용 - 1포인트 소모)
    const data = await youtubeApi.safeFetch(`/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}`);
    const channel = data.items?.[0] || null;

    // 2. 조회된 결과 DB에 캐싱
    if (channel) {
      try {
        const db = await getSupabase();
        if (db) {
          await db.from('channels_cache').upsert({
            id: channel.id,
            custom_url: channel.snippet.customUrl,
            data: channel,
            updated_at: new Date().toISOString()
          });
        }
      } catch (e) {}
    }
    
    return channel;
  },

  getChannelsByIds: async (ids: string): Promise<YouTubeChannel[]> => {
    if (!ids) return [];
    const data = await youtubeApi.safeFetch(`/proxy?path=channels&part=snippet,statistics,contentDetails,brandingSettings&id=${ids}`);
    return data.items || [];
  },

  getChannelVideos: async (playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> => {
    const data = await youtubeApi.safeFetch(`/proxy?path=playlistItems&part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${playlistId}`);
    const videoIds = data.items?.map((v: any) => v.contentDetails?.videoId).join(',') || '';
    if (!videoIds) return [];
    const videoData = await youtubeApi.safeFetch(`/proxy?path=videos&part=snippet,statistics,contentDetails&id=${videoIds}`);
    return videoData.items || [];
  },

  calculatePerformance: (views: number, subscribers: number) => {
    if (subscribers === 0) return 0;
    return (views / subscribers) * 100;
  }
};
