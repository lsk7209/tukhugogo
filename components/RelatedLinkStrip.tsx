import Link from "next/link";

type RelatedLink = {
  href: string;
  label: string;
};

export function RelatedLinkStrip({ title, links }: { title: string; links: RelatedLink[] }) {
  return (
    <nav className="related-strip" aria-label={title}>
      <b>{title}</b>
      <div>
        {links.map(link => (
          <Link href={link.href} key={`${link.href}-${link.label}`}>{link.label}</Link>
        ))}
      </div>
    </nav>
  );
}
