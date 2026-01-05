
import React, { useState } from 'react';
import { youtubeApi } from '../services/api';
import { YouTubeChannel } from '../types';
import { Search, Plus, X, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Compare: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [searchResults, setSearchResults] = useState<YouTubeChannel[]>([]);

  const search = async () => {
    if (!keyword) return;
    setIsLoading(true);
    try {
      const results = await youtubeApi.searchChannels(keyword);
      setSearchResults(results);
    } finally {
      setIsLoading(false);
    }
  };

  const addChannel = (channel: YouTubeChannel) => {
    if (channels.length >= 5) {
      alert('최대 5개 채널까지만 비교 가능합니다.');
      return;
    }
    if (channels.find(c => c.id === channel.id)) return;
    setChannels([...channels, channel]);
    setSearchResults([]);
    setKeyword('');
  };

  const removeChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id));
  };

  const format = (num: string) => parseInt(num).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">채널 비교 분석</h1>
        <p className="text-slate-500">여러 채널의 지표를 나란히 두고 비교해보세요. (최대 5개)</p>
      </header>

      {/* Selector Area */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
        <div className="relative flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="비교할 채널을 검색해 추가하세요..."
            className="flex-1 pl-4 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-red-500"
          />
          <button 
            onClick={search}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-colors flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            검색
          </button>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border rounded-2xl shadow-2xl z-20 max-h-64 overflow-y-auto">
              {searchResults.map(res => (
                <div 
                  key={res.id} 
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 border-b last:border-0 text-left"
                >
                  <img src={res.snippet.thumbnails.default.url} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 group/search">
                      <Link 
                        to={`/channel/${res.id}`}
                        className="font-bold text-sm hover:text-red-600 transition-colors"
                      >
                        {res.snippet.title}
                      </Link>
                      <a 
                        href={`https://www.youtube.com/channel/${res.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="유튜브 열기"
                      >
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    <p className="text-xs text-slate-400">구독자 {parseInt(res.statistics.subscriberCount).toLocaleString()}명</p>
                  </div>
                  <button 
                    onClick={() => addChannel(res)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {channels.map(c => (
            <div key={c.id} className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-100 font-semibold text-sm">
              <img src={c.snippet.thumbnails.default.url} className="w-6 h-6 rounded-full" />
              <span className="truncate max-w-[100px]">{c.snippet.title}</span>
              <button onClick={() => removeChannel(c.id)} className="hover:text-red-900"><X size={14} /></button>
            </div>
          ))}
          {channels.length === 0 && <p className="text-slate-400 text-sm italic">채널을 추가하면 하단에 비교 데이터가 생성됩니다.</p>}
        </div>
      </div>

      {/* Table Area */}
      {channels.length > 0 && (
        <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b">
                  <th className="px-6 py-6 border-r w-48">지표 / 채널</th>
                  {channels.map(c => (
                    <th key={c.id} className="px-6 py-6 min-w-[200px] text-center border-r last:border-0">
                      <div className="flex flex-col items-center gap-2">
                        <Link to={`/channel/${c.id}`}>
                          <img src={c.snippet.thumbnails.default.url} className="w-16 h-16 rounded-2xl shadow-sm border hover:scale-105 transition-transform" />
                        </Link>
                        <div className="flex items-center justify-center gap-1.5 group/header">
                          <Link 
                            to={`/channel/${c.id}`}
                            className="hover:text-red-600 transition-colors text-slate-900 text-sm font-bold truncate max-w-[150px]"
                          >
                            {c.snippet.title}
                          </Link>
                          <a 
                            href={`https://www.youtube.com/channel/${c.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/header:opacity-100"
                            title="유튜브 열기"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                <CompareRow label="총 구독자 수" values={channels.map(c => format(c.statistics.subscriberCount))} highlightIdx={getHighestIdx(channels.map(c => parseInt(c.statistics.subscriberCount)))} />
                <CompareRow label="총 조회수" values={channels.map(c => format(c.statistics.viewCount))} highlightIdx={getHighestIdx(channels.map(c => parseInt(c.statistics.viewCount)))} />
                <CompareRow label="업로드 영상 수" values={channels.map(c => format(c.statistics.videoCount))} highlightIdx={getHighestIdx(channels.map(c => parseInt(c.statistics.videoCount)))} />
                <CompareRow label="계정 생성일" values={channels.map(c => new Date(c.snippet.publishedAt).toLocaleDateString())} />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const getHighestIdx = (nums: number[]) => {
  const max = Math.max(...nums);
  return nums.indexOf(max);
};

const CompareRow = ({ label, values, highlightIdx }: { label: string, values: string[], highlightIdx?: number }) => (
  <tr>
    <td className="px-6 py-5 bg-slate-50/50 font-bold text-slate-600 border-r">{label}</td>
    {values.map((v, i) => (
      <td key={i} className={`px-6 py-5 text-center border-r last:border-0 ${highlightIdx === i ? 'text-red-600 font-extrabold bg-red-50/30' : 'text-slate-700'}`}>
        {v}
      </td>
    ))}
  </tr>
);

export default Compare;
