export const GOVERNMENT_LEVELS = [
  "Gemeente",
  "Provincie",
  "Waterschap",
  "Gemeenschappelijke regeling",
  "Veiligheidsregio",
  "Omgevingsdienst",
  "Regio",
  "Overig",
] as const;

export type GovernmentLevel = (typeof GOVERNMENT_LEVELS)[number];
