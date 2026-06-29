import type { Company, PatentData, TechField } from "@/lib/patent-data";
import { canonicalUrl } from "@/lib/site";

export type GuideTopic = {
  slug: string;
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intent: "information" | "transaction" | "exploration";
  summary: string;
  sections: { id: string; heading: string; body: string }[];
  ctaType: "guide" | "compare" | "lead";
};

export type BlogEntry = {
  title: string;
  href: string;
  excerpt: string;
  category: string;
  intent: string;
  date: string;
  keywords: string[];
};

export const guideTopics: GuideTopic[] = [
  {
    slug: "kipris-search",
    title: "KIPRIS 특허 검색 방법",
    primaryKeyword: "KIPRIS 특허 검색",
    secondaryKeywords: ["특허 검색 방법", "특허청 키프리스", "특허번호 검색"],
    intent: "information",
    summary: "KIPRIS 특허 검색은 키워드만 넣는 것보다 출원인, IPC 분류, 공개·등록 상태를 함께 좁혀야 원하는 결과를 빠르게 찾을 수 있습니다.",
    sections: [
      {
        id: "query",
        heading: "검색식을 먼저 정리하기",
        body: "제품명이나 유행어만 입력하면 관련 없는 문헌이 많이 섞입니다. 배터리 소재처럼 표현이 다양한 분야는 핵심 기술어, 동의어, 출원인명, IPC 분류를 따로 적은 뒤 조합하는 방식이 안정적입니다. 예를 들어 전고체 전지를 찾을 때는 전고체, 고체전해질, 황화물계, 산화물계 같은 표현을 나누고 H01M 10/056 계열 분류를 함께 확인합니다."
      },
      {
        id: "applicant",
        heading: "출원인 이름 정규화",
        body: "기업명은 한글명, 영문명, 법인명 변경, 계열사 이름이 함께 나타날 수 있습니다. 같은 기업을 하나의 묶음으로 보려면 대표 명칭만 보지 말고 과거 사명과 주요 자회사를 함께 확인해야 합니다. 출원인 기준 분석에서는 명칭 누락 하나가 순위와 점유율 해석을 크게 흔들 수 있습니다."
      },
      {
        id: "interpret",
        heading: "검색 결과 해석",
        body: "출원 건수는 관심 영역을 찾는 신호이지 기술 우위의 결론은 아닙니다. 최근 연도 증가율, 등록률, 청구항 범위, 패밀리 국가, 인용 관계를 함께 봐야 합니다. 특히 최근 공개 문헌은 심사 진행 전일 수 있어 등록률 비교에서 과소평가될 수 있습니다."
      },
      {
        id: "workflow",
        heading: "실무 확인 순서",
        body: "처음에는 넓은 키워드로 후보군을 만들고, 두 번째 단계에서 IPC와 출원인으로 줄인 뒤, 마지막에 대표 문헌의 청구항을 직접 읽는 순서가 좋습니다. 이 과정을 저장해 두면 다음 검색에서 기준을 재사용할 수 있고, 특허맵을 만들 때도 누락과 중복을 줄일 수 있습니다."
      }
    ],
    ctaType: "compare"
  },
  {
    slug: "patent-filing-cost",
    title: "특허 출원 비용 가이드",
    primaryKeyword: "특허 출원 비용",
    secondaryKeywords: ["특허 비용", "특허 등록 비용", "변리사 비용"],
    intent: "transaction",
    summary: "특허 출원 비용은 관납료, 명세서 작성 난도, 도면·실험자료 정리, 중간사건 대응 범위에 따라 달라집니다.",
    sections: [
      {
        id: "cost-items",
        heading: "비용 항목",
        body: "기본 비용은 출원 관납료, 명세서 작성비, 도면 작성비, 선행기술 조사비, 심사청구료, 중간사건 대응비로 나뉩니다. 단순 아이디어보다 조성비, 제조 조건, 실험 결과가 포함된 배터리 소재 발명은 설명 범위가 넓어 작성 시간이 늘어날 수 있습니다."
      },
      {
        id: "difficulty",
        heading: "기술 난도와 청구항 범위",
        body: "비용 차이는 단순히 페이지 수가 아니라 보호하려는 권리 범위에서 생깁니다. 양극재 조성, 전해질 첨가제, BMS 알고리즘처럼 실험 조건이나 동작 로직이 중요한 발명은 선행기술 회피 논리와 실시예 정리가 필요합니다. 넓게 쓰되 거절 가능성을 낮추는 균형이 핵심입니다."
      },
      {
        id: "prep",
        heading: "상담 전 준비물",
        body: "발명의 해결 과제, 기존 기술과 다른 점, 실험 데이터, 공개 여부, 공동 발명자, 예상 출원 국가를 정리하면 견적 편차가 줄어듭니다. 특히 이미 전시회, 논문, 제안서, 홈페이지에 공개한 내용이 있으면 신규성 판단에 영향을 줄 수 있어 반드시 먼저 알려야 합니다."
      },
      {
        id: "after-filing",
        heading: "출원 후 발생할 수 있는 비용",
        body: "출원으로 모든 절차가 끝나는 것은 아닙니다. 심사청구, 거절이유통지 대응, 보정서 제출, 등록료 납부, 해외 출원 검토가 이어질 수 있습니다. 초기 견적을 볼 때는 출원 1회 비용뿐 아니라 등록까지의 예상 범위를 함께 확인하는 것이 안전합니다."
      }
    ],
    ctaType: "lead"
  },
  {
    slug: "patent-filing-process",
    title: "특허 출원 절차 한눈에 보기",
    primaryKeyword: "특허 출원 방법",
    secondaryKeywords: ["특허 등록 절차", "특허 심사청구", "특허 출원 서류"],
    intent: "transaction",
    summary: "특허 출원은 선행기술 조사, 명세서 작성, 출원, 심사청구, 거절이유 대응, 등록료 납부 순서로 진행됩니다.",
    sections: [
      {
        id: "prior-art",
        heading: "선행기술 조사",
        body: "출원 전에는 이미 공개된 특허와 논문을 확인해 신규성과 진보성 리스크를 줄여야 합니다. 배터리 분야는 소재명, 조성 범위, 제조 조건, 셀 평가 방식이 문헌마다 다르게 쓰이므로 키워드 검색과 IPC 검색을 함께 사용해야 합니다."
      },
      {
        id: "spec",
        heading: "명세서 작성",
        body: "명세서는 발명의 설명서이면서 권리 범위를 정하는 문서입니다. 구현 설명만 길게 쓰기보다 어떤 구성 조합이 차별점인지, 청구항에서 어디까지 보호할 것인지가 중요합니다. 실험예가 있다면 비교예와 효과를 함께 정리해야 설득력이 높아집니다."
      },
      {
        id: "office-action",
        heading: "심사 대응",
        body: "거절이유통지를 받으면 보정서와 의견서로 차이점을 설명합니다. 이 단계에서 청구항이 좁아질 수 있으므로, 처음부터 핵심 실시예와 대체 실시예를 함께 준비하는 것이 좋습니다. 대응 논리는 선행문헌의 결합 가능성과 효과 차이를 중심으로 세웁니다."
      },
      {
        id: "registration",
        heading: "등록 후 관리",
        body: "등록 후에는 연차료 납부, 권리 범위 점검, 경쟁사 후속 출원 모니터링이 필요합니다. 특허는 등록 자체보다 사업 제품과 연결될 때 가치가 커지므로, 제품 출시 시점과 해외 진출 계획에 맞춰 포트폴리오를 계속 정리해야 합니다."
      }
    ],
    ctaType: "lead"
  },
  {
    slug: "ipc-code",
    title: "IPC 분류 뜻과 특허맵 활용",
    primaryKeyword: "IPC 분류 뜻",
    secondaryKeywords: ["특허 IPC", "국제특허분류", "특허맵 분류"],
    intent: "information",
    summary: "IPC 분류는 특허를 기술 분야별로 묶는 국제 분류 체계이며, 특허맵에서 검색 누락을 줄이는 기본 축으로 사용할 수 있습니다.",
    sections: [
      {
        id: "why-ipc",
        heading: "왜 IPC가 필요한가",
        body: "키워드는 작성자 표현에 따라 흔들리지만 IPC는 기술 구조를 기준으로 문헌을 묶습니다. 배터리 분야에서는 H01M 계열을 중심으로 소재, 셀 구조, 충방전 제어 문헌을 나눠 볼 수 있어 단순 키워드 검색보다 안정적인 비교가 가능합니다."
      },
      {
        id: "limits",
        heading: "IPC의 한계",
        body: "하나의 특허가 여러 IPC를 가질 수 있고, 너무 넓은 분류는 분석 목적에 맞지 않을 수 있습니다. IPC만으로 기술 내용을 확정하면 안 되며, 청구항과 발명의 상세한 설명을 직접 확인해야 합니다. 최신 융합 기술은 분류 부여가 늦거나 예상과 다르게 배정될 수 있습니다."
      },
      {
        id: "map-use",
        heading: "특허맵에서의 사용",
        body: "IPC를 출원인, 연도, 등록상태와 결합하면 기술분야별 경쟁 구도를 안정적으로 볼 수 있습니다. 예를 들어 H01M 4/00 양극재 문헌과 H01M 10/056 전고체 문헌을 분리하면 소재 기업과 셀 기업의 집중 영역이 달라지는 것을 확인할 수 있습니다."
      },
      {
        id: "practical-check",
        heading: "분류를 검증하는 방법",
        body: "특허맵을 만들 때는 상위 IPC로 넓게 모은 뒤 대표 문헌을 샘플링해 실제 기술 내용이 맞는지 확인합니다. 노이즈가 많으면 키워드 조건을 추가하고, 누락이 보이면 인용 문헌과 패밀리 문헌을 따라가며 검색식을 보완합니다."
      }
    ],
    ctaType: "guide"
  },
  {
    slug: "patent-map",
    title: "특허맵이란 무엇인가",
    primaryKeyword: "특허맵이란",
    secondaryKeywords: ["특허맵 작성", "특허 동향 분석", "특허 포트폴리오 분석"],
    intent: "exploration",
    summary: "특허맵은 출원인, 기술 분야, 연도, 등록 상태를 연결해 기술 경쟁 구도와 빈 영역을 파악하는 분석 도구입니다.",
    sections: [
      {
        id: "axes",
        heading: "기본 축",
        body: "특허맵은 보통 출원인, 기술분야, 출원연도, 등록상태를 축으로 구성합니다. 배터리에서는 양극재, 음극재, 전해질, 분리막, 셀·패키지, BMS, 전고체처럼 사업 의사결정에 맞는 분류를 먼저 세워야 해석이 쉬워집니다."
      },
      {
        id: "good-map",
        heading: "좋은 특허맵의 조건",
        body: "좋은 특허맵은 단순 건수표가 아니라 사용자가 비교, 추적, 의사결정을 할 수 있게 만듭니다. 출처와 기준일이 명확하고, 검색식이 재현 가능하며, 노이즈와 누락 가능성을 설명해야 합니다. 그래야 투자 검토, R&D 주제 선정, 경쟁사 모니터링에 활용할 수 있습니다."
      },
      {
        id: "caution",
        heading: "주의할 점",
        body: "출원 건수만으로 기업의 기술력이나 사업 성과를 단정하면 안 됩니다. 방어 출원, 포트폴리오 정리, 공동 출원, 패밀리 확장, 심사 지연이 모두 수치에 영향을 줍니다. 특허맵은 결론을 대신 내리는 도구가 아니라 추가 검토가 필요한 영역을 찾는 지도에 가깝습니다."
      },
      {
        id: "next-step",
        heading: "다음 분석 단계",
        body: "기초 맵을 만든 뒤에는 대표 특허의 청구항을 읽고, 인용 관계와 패밀리 국가를 확인하며, 최근 2~3년 급증한 세부 주제를 따로 분리합니다. 이 단계까지 가야 단순 트렌드 요약을 넘어 실제 전략 검토에 가까워집니다."
      }
    ],
    ctaType: "compare"
  }
];

export function findGuideTopic(slug: string) {
  return guideTopics.find(topic => topic.slug === slug);
}

export function fieldPath(field: TechField) {
  return `/tech/${field.id}`;
}

export function rankingPath(field: TechField) {
  return `/ranking/${field.id}`;
}

export function companyPath(company: Company) {
  return `/company/${company.id}`;
}

export { canonicalUrl };

export function topCompaniesForField(data: PatentData, fieldId: string) {
  return [...data.companies]
    .map(company => ({ company, count: company.fields[fieldId] ?? 0, reg: company.reg[fieldId] ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

export function getBlogEntries(data: PatentData): BlogEntry[] {
  const guideEntries = guideTopics.map(topic => ({
    title: topic.title,
    href: `/guide/${topic.slug}`,
    excerpt: topic.summary,
    category: topic.intent === "transaction" ? "출원 가이드" : "특허 검색",
    intent: topic.primaryKeyword,
    date: "2026-06-28",
    keywords: [topic.primaryKeyword, ...topic.secondaryKeywords]
  }));

  const techEntries = data.techFields.flatMap(field => [
    {
      title: `${field.name} 특허 동향`,
      href: fieldPath(field),
      excerpt: `${field.name} 분야의 출원 추이, 주요 출원인, IPC ${field.ipc}, 해석 시 주의점을 함께 정리합니다.`,
      category: "기술 동향",
      intent: `${field.name} 특허 동향`,
      date: "2026-06-28",
      keywords: [field.name, field.ipc, `${field.name} 특허`]
    },
    {
      title: `${field.name} 특허 순위`,
      href: rankingPath(field),
      excerpt: `${field.name} 분야의 주요 출원인을 출원 건수와 등록률 중심으로 비교합니다.`,
      category: "출원인 순위",
      intent: `${field.name} 특허 순위`,
      date: "2026-06-28",
      keywords: [field.name, "특허 순위", "출원인 랭킹"]
    }
  ]);

  const companyEntries = data.companies.map(company => ({
    title: `${company.name} 특허 데이터`,
    href: companyPath(company),
    excerpt: `${company.name}의 기술분야별 출원 분포와 평균 등록률을 확인합니다.`,
    category: "기업 데이터",
    intent: `${company.name} 특허`,
    date: "2026-06-28",
    keywords: [company.name, "기업 특허", "특허 포트폴리오"]
  }));

  return [...guideEntries, ...techEntries, ...companyEntries];
}
