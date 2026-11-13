# Voorstel websitestructuur — Walda Zakelijk

Inhoudelijke teksten, diensten en huisstijl volgen in een aparte opdracht. Dit is de **technische/IA-basis**.

## Primair navigatiemodel

1. **Home** — merk + kernbelofte + primaire CTA  
2. **Diensten** — overzicht + detailpagina’s per dienst  
3. **Aanpak** — werkwijze / wat klanten mogen verwachten  
4. **Over Walda Zakelijk** — profiel, betrouwbaarheid  
5. **Kennis / inzichten** (optioneel blog) — SEO + thought leadership  
6. **Contact** — formulier, bereikbaarheid  

Footer: privacy, cookies, algemene voorwaarden, sitemap.

## Technische pagina’s (MVP)

| Slug | Template | Doel |
|------|----------|------|
| `/` | front-page | Hero + CTA (huisstijl later) |
| `/diensten` | page | Overzicht |
| `/diensten/{dienst}` | page | Detail |
| `/aanpak` | page | Proces |
| `/over` | page | Over |
| `/contact` | page | Contact + formulier |
| `/privacy` | page | AVG |
| `/cookies` | page | Cookiebeleid |

## WordPress-inrichting

- Block theme `walda-zakelijk` (FSE)
- Permalinks: `/%postname%/`
- Formulieren: native of lichtgewicht plugin (keuze bij inhoudsopdracht)
- SEO: Yoast of Rank Math (keuze later)
- Caching: provider (LiteSpeed) + minimale plugins
- Staging: mijn.host WordPress-staging vóór productie

## Performance & mobiel

- Geen zware pagebuilders in de basis
- WebP-afbeeldingen, lazy load
- Kritische CSS beperkt; system fonts vermijden in definitief design (huisstijl later)
- Core Web Vitals meenemen in tester-checklist
