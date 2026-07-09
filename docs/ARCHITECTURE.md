# TES Labour Intelligence Platform v1.0

## Architectuur

Het TES Labour Intelligence Platform is een AI-ondersteund onderzoeksinstrument voor arbeid, loopbaan en duurzame inzetbaarheid.

### Kernprincipe

> Statistische modellen doen de voorspelling. AI legt de voorspelling uit. TES interpreteert de betekenis.

### Mappenstructuur

```
src/
├── app/                    # Next.js routes
├── components/             # UI-componenten
├── lib/
│   ├── connectors/         # Databron-connector architectuur
│   ├── forecast/           # ForecastEngine
│   ├── statistics/         # Klassieke statistiek
│   ├── ai/                 # AI Explanation Layer
│   ├── tes/                # TES Interpretation Layer
│   ├── evidence/           # Evidence Panel
│   ├── search/             # Semantisch zoeken
│   ├── db/                 # Data access layer
│   └── export/             # Rapportgeneratie
├── data/mock/              # Mockdata v1
└── types/                  # TypeScript types
```

### Database-tabellen (v1: in-memory + mock)

- sources, datasets, regions, occupations, sectors
- indicators, historical_values
- forecasts, forecast_models, forecast_scenarios
- tes_components, tes_interpretations
- evidence_items, user_queries, ai_explanations

### ForecastEngine

Uitbreidbare modellen:
- v1: lineaire regressie, moving average, CAGR, scenario-analyse
- gepland: ARIMA, Prophet, Bayesian, Random Forest, XGBoost, Neural Networks

### Databronnen (connectors)

- CBS, UWV, SCP, TNO/NEA (mock v1)
- Gepland: DUO, Eurostat, ESCO

### Demo-query

> Voorspel de ontwikkeling van zorgpersoneel in Drenthe.
