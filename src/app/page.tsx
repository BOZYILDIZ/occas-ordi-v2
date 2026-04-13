import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Occas Ordi — Informatique reconditionnée à Haguenau",
  description:
    "Achetez des PC reconditionnés et d'occasion de qualité à Haguenau. " +
    "Laptops, desktops, all-in-one — tous testés et garantis.",
};

export const dynamic = "force-dynamic";

async function getFeatured() {
  return prisma.computer.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

const gradeLabels: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar Apple ── */}
      <nav
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/60"
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[#1d1d1f] font-semibold text-[17px] tracking-tight">
            Occas Ordi
          </Link>
          <Link
            href="/catalogue"
            className="text-[#1d1d1f] text-sm hover:text-[#6e6e73] transition-colors duration-200"
          >
            Catalogue
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
        <FadeIn>
          <p className="text-[#6e6e73] text-sm font-medium tracking-widest uppercase mb-5">
            Haguenau · Alsace
          </p>
        </FadeIn>
        <FadeIn delay={80}>
          <h1
            className="font-bold text-[#1d1d1f] leading-[1.07] tracking-tight mb-6"
            style={{ fontSize: "clamp(40px, 7vw, 72px)" }}
          >
            L'informatique
            <br />
            reconditionnée.
            <br />
            <span className="text-[#6e6e73]">Au juste prix.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={160}>
          <p className="text-[#6e6e73] text-xl max-w-lg mx-auto mb-10 leading-relaxed">
            Tous nos appareils sont testés, nettoyés et garantis.
            Des ordinateurs fiables, pour tous les budgets.
          </p>
        </FadeIn>
        <FadeIn delay={240}>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 px-7 py-3 bg-[#0071e3] hover:bg-[#0077ed]
                       text-white text-[17px] font-normal rounded-full transition-colors duration-200"
          >
            Voir le catalogue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </FadeIn>
      </section>

      {/* ── Avantages ── */}
      <FadeIn>
        <section className="bg-[#f5f5f7] py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {[
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Testé & contrôlé",
                  desc: "Chaque appareil passe par une série de tests complets avant la mise en vente.",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  ),
                  title: "Qualité garantie",
                  desc: "Chaque appareil est évalué et classé par grade de A+ à C pour une transparence totale.",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Prix honnêtes",
                  desc: "Des tarifs transparents, bien en dessous du neuf, sans compromis sur la qualité.",
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div className="bg-white rounded-2xl p-8 h-full">
                    <div className="text-[#1d1d1f] mb-4">{item.icon}</div>
                    <h3 className="text-[#1d1d1f] font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-[#6e6e73] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── Dernières arrivées ── */}
      {featured.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#6e6e73] text-sm font-medium tracking-widest uppercase mb-2">
                  Nouveau
                </p>
                <h2 className="text-[#1d1d1f] font-bold text-4xl tracking-tight">
                  Dernières arrivées
                </h2>
              </div>
              <Link
                href="/catalogue"
                className="text-[#0071e3] text-sm hover:underline transition-all hidden sm:block"
              >
                Voir tout →
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((c, i) => {
              const storageStr =
                c.storageSize >= 1000
                  ? `${c.storageSize / 1000} To`
                  : `${c.storageSize} Go`;

              return (
                <FadeIn key={c.id} delay={i * 60}>
                  <Link
                    href={`/catalogue/${c.id}`}
                    className="group block bg-[#f5f5f7] rounded-2xl overflow-hidden
                               hover:shadow-xl hover:shadow-black/5 transition-all duration-300
                               hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative w-full h-44 bg-white flex items-center justify-center">
                      {c.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt={`${c.brand ?? c.cpuBrand} ${c.cpuModel}`}
                          fill
                          className="object-contain p-5 group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <svg className="w-14 h-14 text-[#d2d2d7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#6e6e73] text-xs font-medium">
                          Grade {gradeLabels[c.grade] ?? c.grade}
                        </span>
                        <span className="text-[#86868b] text-xs font-mono">{c.sku}</span>
                      </div>
                      <h3 className="text-[#1d1d1f] font-semibold text-base leading-snug mb-1">
                        {c.brand ?? c.cpuBrand} {c.cpuModel}
                      </h3>
                      <p className="text-[#6e6e73] text-sm mb-4">
                        {c.ramSize} Go · {storageStr}
                      </p>
                      <div className="flex items-center justify-between border-t border-[#d2d2d7]/60 pt-4">
                        <span className="text-[#1d1d1f] font-bold text-xl">
                          {Number(c.price).toFixed(0)} €
                        </span>
                        {c.priceOld && (
                          <span className="text-[#86868b] text-sm line-through">
                            {Number(c.priceOld).toFixed(0)} €
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn>
            <div className="text-center mt-12">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 border border-[#0071e3]
                           text-[#0071e3] text-sm rounded-full hover:bg-[#0071e3] hover:text-white
                           transition-all duration-200"
              >
                Voir tout le stock →
              </Link>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[#d2d2d7]/60 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className="text-[#86868b] text-xs">
            © {new Date().getFullYear()} Occas Ordi · Haguenau, Alsace
          </p>
        </div>
      </footer>

    </div>
  );
}
