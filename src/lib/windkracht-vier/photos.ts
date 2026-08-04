export type BoatPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  span?: "wide" | "tall" | "normal";
};

/**
 * Collagefoto's voor /windkracht-vier/.
 * Bronbestanden: public/windkracht-vier/fotos/
 * HEIC is omgezet naar JPG voor webbrowsers.
 *
 * Extra foto's: upload via GitHub naar die map, daarna collage bijwerken.
 */
export const BOAT_PHOTOS: BoatPhoto[] = [
  {
    id: "trailer-zij",
    src: "/windkracht-vier/fotos/IMG_6076.jpg",
    alt: "Windkracht Vier op trailer, zijaanzicht met Mercury-motor",
    caption: "Op de trailer",
    span: "wide",
  },
  {
    id: "steiger",
    src: "/windkracht-vier/fotos/IMG_6098.jpg",
    alt: "Windkracht Vier afgemeerd aan de steiger",
    caption: "Aan de steiger",
    span: "wide",
  },
  {
    id: "onder-zeil",
    src: "/windkracht-vier/fotos/IMG_2215.jpg",
    alt: "Houten mast en zeil op open water",
    caption: "Onder zeil",
    span: "wide",
  },
  {
    id: "rondhouten-detail",
    src: "/windkracht-vier/fotos/IMG_6072.jpg",
    alt: "Gelakte houten rondhouten en RVS-beslag",
    caption: "Rondhouten",
    span: "tall",
  },
  {
    id: "zeilen-lucht",
    src: "/windkracht-vier/fotos/IMG_2216.jpg",
    alt: "Zeilen en houten mast tegen de lucht",
    caption: "Zeilen",
  },
  {
    id: "fok-water",
    src: "/windkracht-vier/fotos/IMG_2217.jpg",
    alt: "Fok en uitzicht over het water",
    caption: "Fok",
  },
  {
    id: "op-het-water",
    src: "/windkracht-vier/fotos/IMG_2218.jpg",
    alt: "Kuip en uitzicht vanaf Windkracht Vier op het water",
    caption: "Op het water",
    span: "wide",
  },
  {
    id: "trailer-naam",
    src: "/windkracht-vier/fotos/IMG_6060.jpg",
    alt: "Windkracht Vier op trailer met scheepsnaam op de boeg",
    caption: "Scheepsnaam",
    span: "wide",
  },
  {
    id: "mastvoet",
    src: "/windkracht-vier/fotos/IMG_6063.jpg",
    alt: "Detail mastvoet, vallen en houtwerk",
    caption: "Mastvoet",
  },
  {
    id: "dek-beslag",
    src: "/windkracht-vier/fotos/IMG_6064.jpg",
    alt: "Dekbeslag en houten rondhouten",
    caption: "Dekbeslag",
  },
  {
    id: "tuigage",
    src: "/windkracht-vier/fotos/IMG_6065.jpg",
    alt: "Tuigage en houten spars",
    caption: "Tuigage",
  },
  {
    id: "detail-portret",
    src: "/windkracht-vier/fotos/IMG_6068.jpg",
    alt: "Detailopname houtwerk Windkracht Vier",
    caption: "Houtwerk",
    span: "tall",
  },
  {
    id: "kuip-detail",
    src: "/windkracht-vier/fotos/IMG_6069.jpg",
    alt: "Kuip en afwerking",
    caption: "Kuip",
  },
  {
    id: "overzicht",
    src: "/windkracht-vier/fotos/IMG_6071.jpg",
    alt: "Overzicht Windkracht Vier",
    caption: "Overzicht",
  },
  {
    id: "steiger-2",
    src: "/windkracht-vier/fotos/IMG_6099.jpg",
    alt: "Windkracht Vier bij de steiger",
    caption: "Ligplaats",
    span: "wide",
  },
];

/** Hero: boot onder zeil / op het water */
export const HERO_PHOTO = BOAT_PHOTOS.find((p) => p.id === "op-het-water") ?? BOAT_PHOTOS[0];
