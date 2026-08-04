"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { SALES_DOC, TECH_DOC, type DocSection } from "@/lib/windkracht-vier/content";
import { BOAT_PHOTOS, HERO_PHOTO, type BoatPhoto } from "@/lib/windkracht-vier/photos";

type TabId = "technisch" | "verkoop";

function DocumentSections({ sections }: { sections: DocSection[] }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h3 className="wk-display text-2xl sm:text-[1.7rem] font-semibold tracking-tight text-[var(--wk-ink)]">
            {section.title}
          </h3>
          <div className="mt-4 space-y-4 text-[0.98rem] leading-relaxed text-[var(--wk-ink-soft)]">
            {section.paragraphs.map((p, i) => (
              <p key={`${section.id}-${i}`}>{p}</p>
            ))}
          </div>

          {section.specs ? (
            <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="border-t border-[var(--wk-line)] pt-3"
                >
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--wk-water-deep)]">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-lg font-medium text-[var(--wk-ink)]">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {section.scores ? (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {section.scores.map((item) => (
                <li
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--wk-line)] py-2"
                >
                  <span>{item.label}</span>
                  <span className="font-semibold tabular-nums text-[var(--wk-water-deep)]">
                    {item.score}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function PhotoCollage({
  photos,
  onOpen,
}: {
  photos: BoatPhoto[];
  onOpen: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[180px] md:auto-rows-[200px] gap-3 sm:gap-4">
      {photos.map((photo, index) => {
        const spanClass =
          photo.span === "wide"
            ? "col-span-2 row-span-1"
            : photo.span === "tall"
              ? "col-span-1 row-span-2"
              : "col-span-1 row-span-1";

        return (
          <button
            key={photo.id}
            type="button"
            className={`wk-collage-item group relative overflow-hidden rounded-sm bg-[var(--wk-cream)] ${spanClass}`}
            onClick={() => onOpen(index)}
            aria-label={`Open originele foto: ${photo.caption}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--wk-ink)_72%,transparent)] to-transparent px-3 pb-2.5 pt-10 text-left text-sm text-[var(--wk-foam)] opacity-90 transition-opacity group-hover:opacity-100">
              {photo.caption}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: BoatPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];
  const titleId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <div
      className="wk-lightbox fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--wk-ink)_88%,black)] p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-sm bg-[var(--wk-foam)]/90 px-3 py-1.5 text-sm font-medium text-[var(--wk-ink)]"
        onClick={onClose}
      >
        Sluiten
      </button>

      <button
        type="button"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-sm bg-[var(--wk-foam)]/85 px-3 py-2 text-sm sm:block"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Vorige foto"
      >
        ←
      </button>
      <button
        type="button"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-sm bg-[var(--wk-foam)]/85 px-3 py-2 text-sm sm:block"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Volgende foto"
      >
        →
      </button>

      <figure
        className="relative max-h-[88vh] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-black/30 sm:aspect-[16/10]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>
        <figcaption
          id={titleId}
          className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[var(--wk-foam)]"
        >
          <span className="text-sm sm:text-base">{photo.caption}</span>
          <a
            href={withBasePath(photo.src)}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline decoration-white/40 underline-offset-4 hover:decoration-white"
          >
            Open originele foto
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

export function WindkrachtVierClient() {
  const [tab, setTab] = useState<TabId>("technisch");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () =>
    setLightboxIndex((current) =>
      current === null
        ? current
        : (current - 1 + BOAT_PHOTOS.length) % BOAT_PHOTOS.length,
    );
  const showNext = () =>
    setLightboxIndex((current) =>
      current === null ? current : (current + 1) % BOAT_PHOTOS.length,
    );

  const activeDoc = tab === "technisch" ? TECH_DOC : SALES_DOC;

  return (
    <>
      <header className="relative isolate min-h-[100svh] overflow-hidden text-[var(--wk-foam)]">
        <div className="wk-hero-media absolute inset-0 -z-10">
          <Image
            src={HERO_PHOTO.src}
            alt={HERO_PHOTO.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] scale-[1.06]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--wk-ink)_55%,transparent)_0%,color-mix(in_srgb,var(--wk-ink)_35%,transparent)_45%,color-mix(in_srgb,var(--wk-ink)_78%,transparent)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--wk-sky)_25%,transparent),transparent_45%)]" />
        </div>

        <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-24 sm:pb-20">
          <p className="wk-rise text-xs uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--wk-foam)_80%,transparent)]">
            Open toerzeiler · ca. 1970–1972
          </p>
          <h1 className="wk-rise wk-rise-delay-1 wk-display mt-4 max-w-4xl text-5xl leading-[0.95] font-semibold sm:text-7xl md:text-8xl">
            Windkracht Vier
          </h1>
          <p className="wk-rise wk-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-[color-mix(in_srgb,var(--wk-foam)_88%,transparent)] sm:text-lg">
            Klassieke open toerzeiler met vaste kiel, gaffeltuig en originele
            houten rondhouten — liggend bij Giethoorn / Beulakerwijde.
          </p>
          <div className="wk-rise wk-rise-delay-3 mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-sm bg-[var(--wk-foam)] px-5 py-3 text-sm font-semibold text-[var(--wk-ink)] transition hover:bg-white"
              onClick={() => {
                setTab("technisch");
                document.getElementById("dossier")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Technisch dossier
            </button>
            <button
              type="button"
              className="rounded-sm border border-[color-mix(in_srgb,var(--wk-foam)_55%,transparent)] px-5 py-3 text-sm font-semibold text-[var(--wk-foam)] transition hover:bg-[color-mix(in_srgb,var(--wk-foam)_12%,transparent)]"
              onClick={() => {
                setTab("verkoop");
                document.getElementById("dossier")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Verkoopinformatie
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          aria-labelledby="collage-title"
          className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20"
        >
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--wk-water-deep)]">
                Fotocollage
              </p>
              <h2
                id="collage-title"
                className="wk-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Windkracht Vier in beeld
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[var(--wk-ink-soft)]">
              Klik op een foto voor de originele weergave. Navigeer met pijltjes
              of open de volledige afbeelding in een nieuw tabblad.
            </p>
          </div>
          <PhotoCollage photos={BOAT_PHOTOS} onOpen={openLightbox} />
        </section>

        <section
          id="dossier"
          className="border-t border-[var(--wk-line)] bg-[color-mix(in_srgb,var(--wk-paper)_70%,transparent)]"
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-14 sm:py-16">
            <div
              role="tablist"
              aria-label="Documenten"
              className="flex flex-wrap gap-2 rounded-sm bg-[var(--wk-cream)] p-1.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "technisch"}
                data-state={tab === "technisch" ? "active" : "inactive"}
                className="wk-tab flex-1 rounded-sm px-4 py-2.5 text-sm font-semibold transition"
                onClick={() => setTab("technisch")}
              >
                Technisch dossier
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "verkoop"}
                data-state={tab === "verkoop" ? "active" : "inactive"}
                className="wk-tab flex-1 rounded-sm px-4 py-2.5 text-sm font-semibold text-[var(--wk-ink-soft)] transition"
                onClick={() => setTab("verkoop")}
              >
                Verkoopinformatie
              </button>
            </div>

            <article
              role="tabpanel"
              className="mt-10"
              key={tab}
              style={{ animation: "wk-rise 0.55s ease both" }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--wk-water-deep)]">
                {tab === "technisch" ? "Technisch dossier" : "Verkoop"}
              </p>
              <h2 className="wk-display mt-3 text-3xl font-semibold tracking-tight sm:text-[2.35rem] leading-tight">
                {activeDoc.title}
              </h2>
              <p className="mt-4 text-[var(--wk-ink-soft)] leading-relaxed">
                {activeDoc.intro}
              </p>
              <div className="mt-10">
                <DocumentSections sections={activeDoc.sections} />
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--wk-line)] px-6 py-10 text-center text-sm text-[var(--wk-ink-soft)]">
        <p className="wk-display text-lg text-[var(--wk-ink)]">Windkracht Vier</p>
        <p className="mt-2">Giethoorn · Beulakerwijde · Beulackerhaven</p>
      </footer>

      {lightboxIndex !== null ? (
        <Lightbox
          photos={BOAT_PHOTOS}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      ) : null}
    </>
  );
}
