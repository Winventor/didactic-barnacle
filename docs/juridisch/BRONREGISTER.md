# Bronregister – Officiële Juridische Bronnen

## 1. Nederlandse wet- en regelgeving

### Wetten.overheid.nl / Basiswettenbestand (BWB)
| Veld | Waarde |
|------|--------|
| Adapter | `BwbSruAdapter` |
| Jurisdiction | `NL_NATIONAAL` |
| Website | https://wetten.overheid.nl/ |
| Dataset | https://data.overheid.nl/dataset/basis-wetten-bestand |
| SRU | https://zoekservice.overheid.nl/sru/ |
| SRU handleiding | https://www.overheid.nl/sites/default/files/pdf/Handleiding%2BSRU%2BBWB.pdf |
| Registratie | Niet vereist |
| Identificatoren | BWB-ID, citeertitel, artikelnummer |

### Officiële bekendmakingen
| Veld | Waarde |
|------|--------|
| Adapter | `OfficialGazetteAdapter` |
| Jurisdiction | `NL_NATIONAAL` |
| Website | https://www.officielebekendmakingen.nl/ |
| Zoekportaal | https://zoek.officielebekendmakingen.nl/ |
| SRU | https://zoek.officielebekendmakingen.nl/sru |
| Dataset | https://data.overheid.nl/dataset/officiele-bekendmakingen |
| Registratie | Niet vereist |

### Data.overheid.nl
| Veld | Waarde |
|------|--------|
| API | https://data.overheid.nl/data/api/3/ |
| API-register | https://apis.developer.overheid.nl/ |
| Registratie | Niet vereist voor lezen |

## 2. Lokale Nederlandse regelgeving

### Lokale wet- en regelgeving
| Veld | Waarde |
|------|--------|
| Adapter | `LocalRegulationsAdapter` |
| Jurisdiction | `NL_LOKAAL` |
| Website | https://lokaleregelgeving.overheid.nl/ |
| API | SRU via zoekservice |
| Identificatoren | CVDR-ID |
| Registratie | Niet vereist |

## 3. Nederlandse jurisprudentie

### Rechtspraak.nl Open Data
| Veld | Waarde |
|------|--------|
| Adapter | `RechtspraakOpenDataAdapter` |
| Jurisdiction | `NL_NATIONAAL` |
| Website | https://uitspraken.rechtspraak.nl/ |
| API | https://data.rechtspraak.nl/uitspraken/zoeken |
| Documentatie | https://www.rechtspraak.nl/uitspraken/open-data |
| Registratie | Niet vereist |
| Identificatoren | ECLI |

### Raad van State
| Veld | Waarde |
|------|--------|
| Adapter | `CouncilOfStateAdapter` (filter op ECLI:NL:RVS) |
| Website | https://www.raadvanstate.nl/uitspraken/ |

### Hoge Raad
| Veld | Waarde |
|------|--------|
| Primaire bron | Rechtspraak.nl (ECLI:NL:HR) |
| Website | https://www.hogeraad.nl/ |

## 4. Nederlandse verdragen

### Verdragenbank
| Veld | Waarde |
|------|--------|
| Adapter | `TreatiesDatabaseAdapter` |
| Jurisdiction | `INTERNATIONAAL_VOOR_NEDERLAND` |
| Website | https://verdragenbank.overheid.nl/ |
| Registratie | Niet vereist |

## 5. EU-wetgeving

### EUR-Lex
| Veld | Waarde |
|------|--------|
| Adapter | `EurLexAdapter` |
| Jurisdiction | `EU` |
| Website | https://eur-lex.europa.eu/ |
| Webservice | https://eur-lex.europa.eu/EURLexWebService |
| Registratie | Kosteloos via https://eur-lex.europa.eu/content/help/data-reuse/webservice.html |
| Identificatoren | CELEX, ELI |

### CELLAR
| Veld | Waarde |
|------|--------|
| Adapter | `CellarAdapter` |
| SPARQL | https://publications.europa.eu/webapi/rdf/sparql |
| REST | https://publications.europa.eu/resource/cellar/ |
| Registratie | Niet vereist |

## 6. EU-rechtspraak

### CURIA / InfoCuria
| Veld | Waarde |
|------|--------|
| Adapter | `CuriaAdapter` |
| Jurisdiction | `EU` |
| Website | https://curia.europa.eu/ |
| Database | https://infocuria.curia.europa.eu/ |
| Registratie | Niet vereist |
| Identificatoren | ECLI, CELEX, zaaknummer (C-/T-) |

## 7. EVRM en EHRM-rechtspraak

### HUDOC
| Veld | Waarde |
|------|--------|
| Adapter | `HudocAdapter` |
| Jurisdiction | `RAAD_VAN_EUROPA` |
| Database | https://hudoc.echr.coe.int/ |
| API | https://hudoc.echr.coe.int/app/query/results |
| Registratie | Niet vereist |
| Identificatoren | Applicatienummer, zaaknaam |

### ECHR Knowledge Sharing
| Veld | Waarde |
|------|--------|
| Website | https://ks.echr.coe.int/web/echr-ks |
| Gewicht | `TOELICHTEND` (niet bindend) |

## Bronhiërarchie (prioriteit)

1. NL wet- en regelgeving (BWB)
2. Lokale regelgeving (CVDR)
3. Verdragen (Verdragenbank)
4. EU-wetgeving (EUR-Lex/CELLAR)
5. NL jurisprudentie (Rechtspraak.nl)
6. CJEU-rechtspraak (CURIA)
7. EHRM-rechtspraak (HUDOC)
8. Parlementaire stukken (Officiële bekendmakingen)
9. Beleidsregels
10. Officiële toelichtingen (AG-conclusies, kennisbanken)
11. Secundaire bronnen (uitgesloten als enige basis)

## Registratie vereist

| Bron | Registratie |
|------|-------------|
| EUR-Lex webservice | Ja (gratis) – `EUR_LEX_USERNAME`, `EUR_LEX_PASSWORD` |
| Overige bronnen | Nee |

## Gebruikte endpoints (fase 1)

```
GET  https://zoekservice.overheid.nl/sru/Search?operation=searchRetrieve&...
GET  https://data.rechtspraak.nl/uitspraken/zoeken?...
GET  https://zoek.officielebekendmakingen.nl/sru/Search?...
GET  https://lokaleregelgeving.overheid.nl/HRDOCS/_int/...
POST https://eur-lex.europa.eu/EURLexWebService (SOAP, optioneel)
GET  https://publications.europa.eu/resource/cellar/{id}
GET  https://hudoc.echr.coe.int/app/query/results?query=...
```
