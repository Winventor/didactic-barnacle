# Centrale webdienstenomgeving

Professionele omgeving in Cursor voor het ontwikkelen, publiceren en beheren van websites, hostingaccounts, domeinnamen en DNS — met Nederlandse opdrachten voor AI-agents.

## Projecten

| Project | Werkomgeving | Pad | Doel |
|---------|--------------|-----|------|
| Walda Zakelijk – Website | `waldazakelijk-website` | [`projects/waldazakelijk-website`](projects/waldazakelijk-website/) | WordPress-site bij mijn.host |
| Mijn.host – Domeinbeheer | `mijnhost-domeinbeheer` | [`projects/mijnhost-domeinbeheer`](projects/mijnhost-domeinbeheer/) | Domeinen & DNS via mijn.host API |
| SiteGround – Websites | `siteground-websites` | [`projects/siteground-websites`](projects/siteground-websites/) | Multi-site WordPress bij SiteGround |

## Documentatie

1. [Overzicht projecten & werkomgevingen](docs/01-overzicht-projecten.md)
2. [Websites & domeinen](docs/02-websites-en-domeinen.md)
3. [Hostingproviders & verbindingen](docs/03-hostingproviders.md)
4. [Automatiseringsmogelijkheden](docs/04-automatisering.md)
5. [Beveiliging & toegangsbeleid](docs/05-beveiliging.md)
6. [Back-up & herstel](docs/06-backup-herstel.md)
7. [Publicatie & onderhoud](docs/07-publicatie-onderhoud.md)
8. [Wijzigingslogboek](docs/08-wijzigingslogboek.md)
9. [Openstaande werkzaamheden](docs/09-openstaande-werkzaamheden.md)
10. [Architectuur](docs/architectuur/OVERZICHT.md)
11. [Inventarisatie fase 1](docs/inventaris/FASE1.md)

## Agentrollen

Herbruikbare instructies in [`agents/`](agents/):

- Websiteontwikkelaar
- Hostingbeheerder
- Domein- en DNS-beheerder
- WordPress-beheerder
- Tester en beveiligingscontroleur

## Snelle start

```bash
# Domeinbeschikbaarheid (vereist MIJNHOST_API_TOKEN)
./webdiensten/scripts/mijnhost.sh domains availability waldazakelijk.nl

# Lokale WordPress-testomgeving voor Walda Zakelijk
cd webdiensten/projects/waldazakelijk-website && docker compose up -d
```

## Goedkeuringsgrenzen

Agents voeren analyses, voorstellen, lokale ontwikkeling en tests zelfstandig uit. Expliciete goedkeuring is vereist voor: domeinregistratie/-verhuizing/-opzegging, betaalde hosting, betalingen, productiel-DNS, productiepublicatie, definitieve verwijderingen en ingrijpende rechtenwijzigingen.

Geheimen horen in Cursor Secrets / omgevingsvariabelen — nooit in Git.
