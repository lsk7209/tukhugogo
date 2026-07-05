import type { Company, PatentData, TechField } from "@/lib/patent-data";
import { canonicalUrl } from "@/lib/site";

export type GuideTopic = {
  slug: string;
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intent: "information" | "transaction" | "exploration";
  summary: string;
  sections: { id: string; heading: string; body: string | string[] }[];
  relatedLinks?: { href: string; label: string }[];
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
        heading: "검색 목적과 범위를 먼저 고정하기",
        body: [
          "KIPRIS 특허 검색을 시작하기 전에 먼저 답해야 할 질문은 “무엇을 찾을 것인가”입니다. 이미 알고 있는 특허번호 한 건을 확인하려는지, 특정 기업의 출원 흐름을 보려는지, 전고체·양극재·분리막처럼 기술군 전체를 훑으려는지에 따라 검색식이 달라집니다. 목적을 고정하지 않으면 검색 결과가 많아 보여도 실제 의사결정에 쓰기 어렵습니다.",
          "처음 검색표에는 핵심 기술어, 동의어, 제외어, 출원인, IPC·CPC 후보, 확인 기준일을 나눠 적어 두는 것이 좋습니다. 예를 들어 전고체 전지를 찾을 때는 “전고체”, “고체전해질”, “sulfide”, “oxide”, “황화물계”, “산화물계”를 따로 놓고 H01M 계열 분류를 함께 확인합니다. KIPRIS 통합검색은 넓게 훑는 데 유용하지만, 분석용 후보군을 만들 때는 상세검색과 결과 내 재검색으로 조건을 단계적으로 좁히는 편이 재현성이 높습니다."
        ]
      },
      {
        id: "applicant",
        heading: "출원인과 번호 검색을 분리하기",
        body: [
          "특허번호나 공개번호를 알고 있다면 번호 검색으로 원문을 바로 확인하는 것이 가장 빠릅니다. 다만 번호에는 출원번호, 공개번호, 등록번호가 섞여 쓰이므로 보고서나 보도자료에서 가져온 번호가 어떤 번호인지 먼저 확인해야 합니다. 번호 하나로 원문을 찾은 뒤에는 출원인, 발명자, 우선권, 패밀리, 법적 상태를 함께 기록해 둡니다.",
          "출원인 검색은 더 조심해야 합니다. 기업명은 한글명, 영문명, 약칭, 과거 사명, 합병 전 법인, 연구소·자회사 명칭으로 나뉘어 나타날 수 있습니다. 같은 기업을 하나의 묶음으로 보려면 대표 명칭만 쓰지 말고 과거 사명과 주요 계열사를 같이 확인해야 합니다. 출원인명 하나가 빠지면 순위, 점유율, 최근 증가율 해석이 크게 흔들립니다."
        ]
      },
      {
        id: "interpret",
        heading: "검색 결과에서 먼저 걸러야 할 노이즈",
        body: [
          "검색 결과 수가 많다고 좋은 검색식은 아닙니다. 배터리 분야에서는 “cell”, “module”, “electrode”처럼 넓은 단어가 다른 산업 문헌까지 끌어올 수 있고, 소재명은 조성식·상품명·영문 약어로 흩어질 수 있습니다. 대표 문헌 20~30건을 샘플로 열어 청구항과 요약을 확인하고, 맞지 않는 문헌이 반복되면 제외어와 IPC 조건을 추가합니다.",
          "공개·등록 상태도 따로 봐야 합니다. 공개특허는 아직 심사 전이거나 거절 가능성이 남아 있을 수 있고, 등록특허라도 청구항이 출원 당시보다 좁아졌을 수 있습니다. 출원 건수는 관심 영역을 찾는 신호이지 기술 우위의 결론이 아닙니다. 최근 연도 증가율, 등록률, 청구항 범위, 패밀리 국가, 인용 관계를 함께 보아야 실제 경쟁 구도에 가까워집니다."
        ]
      },
      {
        id: "workflow",
        heading: "실무용 KIPRIS 검색 순서",
        body: [
          "첫 단계에서는 넓은 키워드로 후보군을 만들고 결과 수, 주요 출원인, 반복되는 IPC를 봅니다. 두 번째 단계에서는 상세검색에서 IPC·출원인·공개일 범위를 좁힙니다. 세 번째 단계에서는 대표 문헌의 청구항 1항, 실시예, 도면, 인용 문헌을 직접 읽어 검색식이 의도한 기술을 잡고 있는지 검증합니다.",
          "검색식은 매번 새로 만들지 말고 저장 가능한 형태로 남기는 것이 좋습니다. 검색일, 사용한 키워드, 제외한 표현, 확인한 IPC, 샘플링한 대표 문헌을 남기면 다음 조사에서 누락과 중복을 줄일 수 있습니다. 특허맵이나 기업별 순위로 확장할 때도 이 기록이 있어야 왜 특정 기업이나 문헌을 포함·제외했는지 설명할 수 있습니다."
        ]
      }
    ],
    relatedLinks: [
      { href: "/blog/kipris-query-criteria/", label: "KIPRIS 검색식 판단 기준" },
      { href: "/blog/kipris-query-mistake/", label: "KIPRIS 검색식 실수 줄이기" },
      { href: "/guide/ipc-code/", label: "IPC 분류 뜻과 활용" },
      { href: "/guide/patent-map/", label: "특허맵 작성 흐름" },
      { href: "/guide/patent-filing-cost/", label: "출원 전 비용 확인" }
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
        heading: "출원 비용을 항목별로 나누기",
        body: [
          "특허 출원 비용은 한 줄 견적보다 항목별로 봐야 합니다. 보통 출원 관납료, 명세서 작성비, 도면 작성비, 선행기술 조사비, 심사청구료, 거절이유통지 대응비, 등록료와 연차료가 나뉩니다. 특허로와 특허청 안내에서 확인하는 수수료는 국가에 납부하는 관납료이고, 변리사 비용은 사무소와 업무 범위에 따라 별도로 정해집니다.",
          "초기 상담에서 “출원 비용”만 묻는 것보다 출원, 심사청구, 중간사건 1회 대응, 등록까지 각각 얼마인지 나눠 물어보는 편이 안전합니다. 출원 단계만 낮게 보이고 심사청구나 의견서·보정서 비용이 빠져 있으면 실제 총액이 달라질 수 있습니다. 해외 출원이나 PCT 검토가 있으면 번역, 현지대리인, 우선권 기한 관리 비용도 별도 범위로 봐야 합니다."
        ]
      },
      {
        id: "difficulty",
        heading: "기술 난도와 청구항 수가 비용에 미치는 영향",
        body: [
          "비용 차이는 단순히 페이지 수가 아니라 보호하려는 권리 범위에서 생깁니다. 양극재 조성, 전해질 첨가제, BMS 알고리즘처럼 실험 조건이나 동작 로직이 중요한 발명은 선행기술 회피 논리와 실시예 정리가 필요합니다. 넓게 쓰되 거절 가능성을 낮추는 균형을 잡아야 하므로 작성 시간이 늘어날 수 있습니다.",
          "청구항 수는 비용과 심사 전략 양쪽에 영향을 줍니다. 청구항을 많이 넣으면 보호 관점을 세분화할 수 있지만 심사청구료와 검토 시간이 늘 수 있고, 너무 적게 넣으면 회피 설계에 약해질 수 있습니다. 핵심 독립항, 종속항, 대체 실시예, 수치 범위를 나누어 왜 그 청구항이 필요한지 설명할 수 있어야 합니다."
        ]
      },
      {
        id: "prep",
        heading: "상담 전 준비하면 견적이 줄어드는 자료",
        body: [
          "발명의 해결 과제, 기존 기술과 다른 점, 실험 데이터, 도면 초안, 제품 적용 위치, 공동 발명자, 예상 출원 국가를 정리하면 견적 편차가 줄어듭니다. 배터리 소재 발명이라면 조성 범위, 제조 조건, 비교예, 성능 평가 방식, 재현 가능한 효과를 함께 준비하는 것이 좋습니다. 데이터가 부족하면 명세서 작성보다 선행기술 조사와 발명 정리가 먼저 필요할 수 있습니다.",
          "이미 전시회, 논문, 제안서, 홈페이지, 영업자료에 공개한 내용이 있으면 반드시 먼저 알려야 합니다. 공개 여부는 신규성 판단과 출원 시점에 영향을 줄 수 있습니다. 공동개발 과제라면 발명자와 출원인, 지분, 직무발명 보상, 비밀유지 계약도 함께 확인해야 나중에 권리 귀속 문제가 줄어듭니다."
        ]
      },
      {
        id: "after-filing",
        heading: "출원 후 발생할 수 있는 비용과 일정",
        body: [
          "출원으로 모든 절차가 끝나는 것은 아닙니다. 심사청구를 해야 심사가 진행되고, 거절이유통지를 받으면 의견서와 보정서로 대응해야 합니다. 등록 결정 후에는 설정등록료를 납부하고, 권리를 유지하려면 연차료를 관리해야 합니다. 초기 견적을 볼 때는 출원 1회 비용뿐 아니라 등록까지의 예상 범위를 함께 확인하는 것이 안전합니다.",
          "감면 대상도 확인할 필요가 있습니다. 특허청은 개인, 중소기업, 청년·고령자 등 일정 요건에 따라 출원료·심사청구료·등록료 감면 제도를 안내합니다. 다만 감면 요건과 건수 제한은 바뀔 수 있으므로 실제 납부 전에는 특허청 또는 특허로의 최신 수수료 안내를 확인해야 합니다. 이 글은 비용 구조를 이해하기 위한 참고 자료이며, 구체적인 견적이나 법률 판단은 대리인 상담으로 확정해야 합니다."
        ]
      }
    ],
    relatedLinks: [
      { href: "/guide/patent-filing-process/", label: "특허 출원 절차" },
      { href: "/guide/kipris-search/", label: "출원 전 KIPRIS 검색" },
      { href: "/blog/filing-budget-criteria/", label: "출원 예산 판단 기준" },
      { href: "/blog/spec-writing-workflow/", label: "명세서 작성 흐름" },
      { href: "/blog/office-action-workflow/", label: "거절이유 대응 흐름" }
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
