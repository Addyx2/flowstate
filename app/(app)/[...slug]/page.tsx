import { notFound } from "next/navigation";

import { findPage, NAVIGATION } from "@/lib/navigation";

// Placeholder for every sidebar page that isn't built yet (docs/spec/navigation.md).
// Built pages get their own route folder, which takes precedence over this one.

export function generateStaticParams() {
  return NAVIGATION.flatMap((s) => [s.built ? undefined : s.href, ...(s.items ?? []).filter((i) => !i.built).map((i) => i.href)])
    .filter((h): h is string => !!h)
    .map((href) => ({ slug: href.slice(1).split("/") }));
}

export default async function Placeholder({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = findPage(`/${slug.join("/")}`);
  if (!page) notFound();

  const { section, item } = page;
  return (
    <main className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
      <p className="font-mono text-[10px] tracking-widest text-[#4a9eff] mb-2">
        {section.title.toUpperCase()}
        {item ? ` // ${item.label.toUpperCase()}` : ""}
      </p>
      <h1 className="text-3xl font-light mb-2">{item?.label ?? section.title}</h1>
      <p className="text-[#a0a0a0] mb-10 max-w-2xl">{item?.purpose ?? section.purpose}</p>
      <div className="border border-dashed border-[#2a2a2a] p-8 text-center text-[#a0a0a0] font-mono text-xs">
        NOT BUILT YET — WAITING ON DESIGN
      </div>
    </main>
  );
}
