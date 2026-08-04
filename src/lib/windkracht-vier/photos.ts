export type BoatPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  span?: "wide" | "tall" | "normal";
};

/** Collagefoto's — vervang bestanden in public/windkracht-vier/fotos/ */
export const BOAT_PHOTOS: BoatPhoto[] = [
  {
    id: "zeilend",
    src: "/windkracht-vier/fotos/wk4-zeilend.jpg",
    alt: "Windkracht Vier onder zeil op open water",
    caption: "Onder zeil",
    span: "wide",
  },
  {
    id: "rondhouten",
    src: "/windkracht-vier/fotos/wk4-rondhouten.jpg",
    alt: "Massief houten mast, giek en gaffel met blanke lak",
    caption: "Rondhouten",
    span: "tall",
  },
  {
    id: "romp",
    src: "/windkracht-vier/fotos/wk4-romp-dek.jpg",
    alt: "Crèmekleurige romp en stroef dek",
    caption: "Romp en dek",
  },
  {
    id: "kuip",
    src: "/windkracht-vier/fotos/wk4-kuip.jpg",
    alt: "Verdiepte kuip met houten banken",
    caption: "Kuip",
  },
  {
    id: "spiegel",
    src: "/windkracht-vier/fotos/wk4-spiegel.jpg",
    alt: "Spiegel met doorgestoken roer en helmstok",
    caption: "Spiegel en roer",
  },
  {
    id: "kiel",
    src: "/windkracht-vier/fotos/wk4-kiel.jpg",
    alt: "Vaste kiel met blauwe antifouling",
    caption: "Kiel en antifouling",
    span: "wide",
  },
  {
    id: "zeilen",
    src: "/windkracht-vier/fotos/wk4-zeilen.jpg",
    alt: "Originele zeilen: grootzeil, fok en stormfok",
    caption: "Zeilen",
    span: "tall",
  },
  {
    id: "trailer",
    src: "/windkracht-vier/fotos/wk4-trailer.jpg",
    alt: "Boot op gegalvaniseerde wegtrailer",
    caption: "Trailer",
  },
  {
    id: "landschap",
    src: "/windkracht-vier/fotos/wk4-landschap.jpg",
    alt: "Waterlandschap Beulakerwijde nabij Giethoorn",
    caption: "Ligging Beulakerwijde",
    span: "wide",
  },
];

export const HERO_PHOTO = BOAT_PHOTOS[0];
