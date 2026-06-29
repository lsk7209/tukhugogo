import { canonicalUrl, reviewedDate } from "@/lib/site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type DataPageJsonLdInput = {
  url: string;
  headline: string;
  description: string;
  keywords: string[];
  about: string[];
  source: string;
  sourceUrl?: string;
  asOf: string;
  datasetName: string;
  datasetDescription: string;
  variables: string[];
  temporalCoverage?: string;
  breadcrumbs: BreadcrumbItem[];
};

export function snapshotDate(asOf: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(asOf)) return asOf;
  if (/^\d{4}-\d{2}$/.test(asOf)) return `${asOf}-01`;
  return reviewedDate();
}

export function dataPageJsonLd(input: DataPageJsonLdInput) {
  const modifiedDate = snapshotDate(input.asOf);
  const citation = input.sourceUrl || input.source;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: input.headline,
      description: input.description,
      url: input.url,
      image: canonicalUrl("/og-image.png"),
      datePublished: reviewedDate(),
      dateModified: modifiedDate,
      inLanguage: "ko-KR",
      isAccessibleForFree: true,
      mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
      publisher: { "@id": canonicalUrl("/#organization") },
      author: { "@id": canonicalUrl("/#organization") },
      keywords: input.keywords,
      about: input.about.map(name => ({ "@type": "Thing", name })),
      citation
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: input.datasetName,
      description: input.datasetDescription,
      url: input.url,
      dateModified: modifiedDate,
      inLanguage: "ko-KR",
      creator: { "@id": canonicalUrl("/#organization") },
      publisher: { "@id": canonicalUrl("/#organization") },
      citation,
      temporalCoverage: input.temporalCoverage,
      variableMeasured: input.variables.map(name => ({ "@type": "PropertyValue", name }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: input.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: canonicalUrl(item.path)
      }))
    }
  ];
}
