# Voorstel websitestructuur — PLP112

Inhoudelijke teksten, diensten en huisstijl volgen in een aparte opdracht. Dit is de **technische/IA-basis**.

## Primair navigatiemodel

1. **Home** — projectmerk + kernbelofte + primaire CTA  
2. **Over** — wat PLP112 is / voor wie  
3. **Aanbod / diensten** — overzicht + detailpagina’s (indien van toepassing)  
4. **Kennis** (optioneel) — artikelen / updates  
5. **Contact** — formulier, bereikbaarheid  

Footer: privacy, cookies, algemene voorwaarden, sitemap.

## Technische pagina’s (MVP)

| Slug | Template | Doel |
|------|----------|------|
| `/` | front-page | Hero + CTA (huisstijl later) |
| `/over` | page | Over het project |
| `/aanbod` | page | Overzicht (naam later aanpassen) |
| `/contact` | page | Contact + formulier |
| `/privacy` | page | AVG |
| `/cookies` | page | Cookiebeleid |

## WordPress-inrichting

- Block theme `plp112` (FSE)
- Permalinks: `/%postname%/`
- Formulieren: native of lichtgewicht plugin (keuze bij inhoudsopdracht)
- SEO: Yoast of Rank Math (keuze later)
- Caching: provider + minimale plugins
- Staging vóór productie

## Performance & mobiel

- Geen zware pagebuilders in de basis
- WebP-afbeeldingen, lazy load
- Core Web Vitals meenemen in tester-checklist
