import type { Connector } from "@/types";
import { mockSources } from "@/data/mock";

export interface ConnectorRegistry {
  getAll(): Connector[];
  getById(id: string): Connector | undefined;
  getByTESComponent(componentSlug: string): Connector[];
}

const PLANNED_CONNECTORS: Connector[] = [
  {
    id: "conn-duo",
    name: "DUO",
    owner: "Dienst Uitvoering Onderwijs",
    api: "https://duo.nl/open_onderwijsdata/",
    updateFrequency: "jaarlijks",
    license: "CC BY 4.0",
    lastSync: "—",
    reliability: 0,
    tesComponents: ["competentie"],
    status: "planned",
  },
  {
    id: "conn-eurostat",
    name: "Eurostat",
    owner: "European Statistical Office",
    api: "https://ec.europa.eu/eurostat/api/",
    updateFrequency: "kwartaal",
    license: "CC BY 4.0",
    lastSync: "—",
    reliability: 0,
    tesComponents: ["generativiteit", "bereidwilligheid"],
    status: "planned",
  },
  {
    id: "conn-esco",
    name: "ESCO",
    owner: "European Commission",
    api: "https://ec.europa.eu/esco/api/",
    updateFrequency: "halfjaarlijks",
    license: "CC BY 4.0",
    lastSync: "—",
    reliability: 0,
    tesComponents: ["competentie", "autonomie"],
    status: "planned",
  },
];

function sourceToConnector(source: (typeof mockSources)[0]): Connector {
  return {
    id: `conn-${source.id.replace("src-", "")}`,
    name: source.name,
    owner: source.owner,
    api: source.apiUrl,
    updateFrequency: source.updateFrequency,
    license: source.license,
    lastSync: source.lastSync,
    reliability: source.reliability,
    tesComponents: source.tesComponents,
    status: "mock",
  };
}

export const connectorRegistry: ConnectorRegistry = {
  getAll() {
    return [...mockSources.map(sourceToConnector), ...PLANNED_CONNECTORS];
  },
  getById(id: string) {
    return this.getAll().find((c) => c.id === id);
  },
  getByTESComponent(componentSlug: string) {
    return this.getAll().filter((c) => c.tesComponents.includes(componentSlug));
  },
};
