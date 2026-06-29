import { JsonLd } from "@/components/JsonLd";

type FaqItem = {
  question: string;
  answer: string;
};

export function SeoFaq({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <section className="faq-block" aria-labelledby="faq-title">
      <h2 id="faq-title">자주 묻는 질문</h2>
      <JsonLd data={jsonLd} />
      {items.map(item => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}
