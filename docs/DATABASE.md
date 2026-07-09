# Database Schema — TES Labour Intelligence Platform v1

Versie 1 gebruikt een in-memory data layer met mockdata. De schema's hieronder zijn ontworpen voor toekomstige migratie naar PostgreSQL of SQLite.

## Tabellen

### sources
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| name | string | Naam databron |
| owner | string | Eigenaar |
| api_url | string | API-endpoint |
| update_frequency | string | Updatefrequentie |
| license | string | Licentie |
| last_sync | date | Laatste synchronisatie |
| reliability | float | Betrouwbaarheidsscore 0–1 |
| tes_components | string[] | Relevante TES-componenten |

### datasets
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| source_id | FK → sources | Databron |
| name | string | Datasetnaam |
| description | text | Beschrijving |
| last_update | date | Laatste update |
| indicator_ids | string[] | Gekoppelde indicatoren |
| region_ids | string[] | Gekoppelde regio's |
| occupation_ids | string[] | Gekoppelde beroepen |

### regions
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| name | string | Regionaam |
| type | enum | provincie, gemeente, arbeidsmarktregio |
| parent_id | FK → regions | Bovenliggende regio |
| province_code | string | Provinciecode (NL) |

### occupations
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| name | string | Beroepsnaam |
| esco_code | string | ESCO-classificatie |
| sector_id | FK → sectors | Sector |
| synonyms | string[] | Synoniemen voor zoeken |

### sectors
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| name | string | Sectornaam |
| description | text | Beschrijving |

### indicators
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| name | string | Indicatornaam |
| unit | string | Meeteenheid |
| description | text | Beschrijving |
| tes_component_id | FK → tes_components | Gekoppelde TES-component |

### historical_values
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| indicator_id | FK → indicators | Indicator |
| region_id | FK → regions | Regio |
| occupation_id | FK → occupations | Beroep (optioneel) |
| year | int | Jaar |
| value | float | Waarde |
| source_id | FK → sources | Bron |

### forecast_models
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| name | string | Modelnaam |
| type | enum | Modeltype |
| description | text | Beschrijving |
| enabled | boolean | Actief |
| parameters | jsonb | Modelparameters |

### forecasts
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| indicator_id | FK | Indicator |
| region_id | FK | Regio |
| occupation_id | FK | Beroep (optioneel) |
| model_id | FK → forecast_models | Model |
| historical_period | jsonb | { start, end } |
| horizon_years | int | Prognosehorizon |
| created_at | timestamp | Aanmaakdatum |

### forecast_scenarios
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| forecast_id | FK → forecasts | Prognose |
| type | enum | conservatief, realistisch, optimistisch |
| assumptions | text[] | Aannames |
| uncertainty_margin | float | Onzekerheidsmarge % |
| explanation | text | Toelichting |
| values | jsonb | [{ year, value }] |

### tes_components
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| name | string | Componentnaam |
| slug | string | URL-slug |
| description | text | Beschrijving |

### tes_interpretations
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| query_id | FK → user_queries | Zoekopdracht |
| component_id | FK → tes_components | TES-component |
| indicator_id | FK | Indicator (optioneel) |
| signal | enum | positief, negatief, neutraal |
| narrative | text | Kwalitatieve interpretatie |
| evidence_level | enum | Bewijsniveau |

### evidence_items
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| query_id | FK | Zoekopdracht |
| type | enum | bron, dataset, model, aanname, beperking, onderzoeksvraag |
| title | string | Titel |
| content | text | Inhoud |
| source_id | FK | Bron (optioneel) |
| evidence_level | enum | Bewijsniveau |

### user_queries
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| query | text | Zoektekst |
| audience | enum | Doelgroep |
| created_at | timestamp | Tijdstip |
| entities | jsonb | Geëxtraheerde entiteiten |

### ai_explanations
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | string | Primaire sleutel |
| query_id | FK | Zoekopdracht |
| label | enum | Feit, Statistische uitkomst, etc. |
| text | text | Uitlegtekst |
| source_ids | string[] | Bronverwijzingen |
