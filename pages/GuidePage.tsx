
import React from 'react';
import { BookOpen, CheckCircle2, Lightbulb } from 'lucide-react';

const GuidePage: React.FC = () => (
  <div className="max-w-4xl mx-auto py-12 space-y-16">
    <section className="text-center space-y-4">
      <h1 className="text-5xl font-black tracking-tight">유튜브 성장 가이드</h1>
      <p className="text-xl text-slate-500 font-bold">데이터 분석 결과로 도출된 실전 성장 전략</p>
    </section>

    <div className="space-y-12">
      <GuideSection 
        title="1. 썸네일 전략: '궁금증'이 '클릭'을 만든다"
        desc="유튜브분석툴이 분석한 상위 1% 썸네일의 공통점입니다."
        tips={[
          "고대비 컬러 사용 (빨강, 노랑, 파랑 중 하나는 반드시 사용)",
          "텍스트는 10자 이내로, 폰트 크기는 화면의 20% 이상",
          "얼굴을 강조할 때는 감정이 극대화된 표정 선택",
          "오른쪽 하단 1/4 구역에는 텍스트를 배치하지 마세요 (영상 길이 표시 영역)"
        ]}
      />

      <GuideSection 
        title="2. 제목 작성 전략: '나'의 이야기가 아닌 '그'의 이득"
        desc="시청자가 얻을 수 있는 가치를 명확히 전달하세요."
        tips={[
          "숫자를 구체적으로 사용하세요 (예: 3일 만에, 10가지 방법)",
          "부정적인 표현이 때로는 더 큰 클릭을 유도합니다 (예: 절대 하지 마세요)",
          "궁금증을 유발하는 질문형 제목 활용",
          "검색 키워드는 제목의 앞부분 15자 내에 배치"
        ]}
      />

      <GuideSection 
        title="3. 알고리즘 추천을 받는 업로드 타이밍"
        desc="내 채널 시청자들이 가장 활발한 시간을 공략하세요."
        tips={[
          "유튜브 스튜디오 데이터 기반 주요 활동 시간 1~2시간 전 업로드",
          "주기적인 업로드는 시청자와의 약속이자 알고리즘의 신뢰 지표",
          "업로드 직후 1시간 내의 조회수와 시청 지속시간이 가장 중요",
          "댓글 고정을 통해 시청자의 참여를 즉시 유도"
        ]}
      />
    </div>
  </div>
);

const GuideSection = ({ title, desc, tips }: any) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-6">
    <div className="space-y-2">
      <h2 className="text-2xl font-black flex items-center gap-3">
        <Lightbulb className="text-amber-500" />
        {title}
      </h2>
      <p className="text-slate-500 font-bold pl-9">{desc}</p>
    </div>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-9">
      {tips.map((tip: string) => (
        <li key={tip} className="flex items-start gap-2 text-sm font-medium">
          <CheckCircle2 className="text-red-600 shrink-0 mt-0.5" size={16} />
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default GuidePage;
