
export interface ChannelSnippet {
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
}

export interface ChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

export interface YouTubeChannel {
  id: string;
  snippet: ChannelSnippet;
  statistics: ChannelStatistics;
  contentDetails?: {
    relatedPlaylists: {
      uploads: string;
    };
  };
}

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: { medium: { url: string } };
    publishedAt: string;
    channelId: string;
    channelTitle: string;
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export interface SearchResult {
  id: { channelId: string };
  snippet: ChannelSnippet;
}

export interface AnalysisMetrics {
  avgViews: number;
  avgLikes: number;
  likeRatio: number;
  uploadFrequency: string; // avg videos per month
}
