export type BoatPhoto = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  span?: "wide" | "tall" | "normal";
};

/**
 * Collagefoto's voor /windkracht-vier/.
 * Bron: public/windkracht-vier/fotos/ (JPG; HEIC omgezet voor browsers).
 */
export const BOAT_PHOTOS: BoatPhoto[] = [
  {
    id: "op-het-water",
    src: "/windkracht-vier/fotos/IMG_2218.jpg",
    alt: "Uitzicht vanaf Windkracht Vier over open water",
    caption: "Op het water",
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
    id: "trailer-zij",
    src: "/windkracht-vier/fotos/IMG_6076.jpg",
    alt: "Windkracht Vier op trailer, zijaanzicht",
    caption: "Op de trailer",
    span: "wide",
  },
  {
    id: "rondhouten",
    src: "/windkracht-vier/fotos/IMG_6072.jpg",
    alt: "Gelakte houten rondhouten en beslag",
    caption: "Rondhouten",
    span: "tall",
  },
  {
    id: "onder-zeil",
    src: "/windkracht-vier/fotos/IMG_2215.jpg",
    alt: "Houten mast en zeil op open water",
    caption: "Onder zeil",
    span: "wide",
  },
  {
    id: "zeilen-lucht",
    src: "/windkracht-vier/fotos/IMG_2216.jpg",
    alt: "Zeilen en mast tegen de lucht",
    caption: "Zeilen",
  },
  {
    id: "fok",
    src: "/windkracht-vier/fotos/IMG_2217.jpg",
    alt: "Fok en uitzicht over het water",
    caption: "Fok",
  },
  {
    id: "boeg-naam",
    src: "/windkracht-vier/fotos/IMG_6086.jpg",
    alt: "Boeg met scheepsnaam Windkracht Vier",
    caption: "Scheepsnaam",
  },
  {
    id: "trailer-profiel",
    src: "/windkracht-vier/fotos/IMG_6059.jpg",
    alt: "Windkracht Vier op trailer, zijaanzicht bij loods",
    caption: "Profiel",
    span: "wide",
  },
  {
    id: "trailer-naam",
    src: "/windkracht-vier/fotos/IMG_6060.jpg",
    alt: "Windkracht Vier op trailer met naam op de boeg",
    caption: "Trailer",
    span: "wide",
  },
  {
    id: "haven",
    src: "/windkracht-vier/fotos/IMG_6100.jpg",
    alt: "Windkracht Vier in de jachthaven",
    caption: "Jachthaven",
    span: "wide",
  },
  {
    id: "dekzeil",
    src: "/windkracht-vier/fotos/foto-082965b4.jpg",
    alt: "Windkracht Vier met blauw dekzeil in de haven",
    caption: "Dekzeil",
    span: "tall",
  },
  {
    id: "steiger-portret",
    src: "/windkracht-vier/fotos/foto-5a1a20a7.jpg",
    alt: "Windkracht Vier aan de steiger, portret",
    caption: "Steiger",
    span: "tall",
  },
  {
    id: "bij-muur",
    src: "/windkracht-vier/fotos/IMG_6235.jpg",
    alt: "Windkracht Vier op trailer naast muur",
    caption: "Op stalling",
  },
  {
    id: "mastvoet",
    src: "/windkracht-vier/fotos/IMG_6063.jpg",
    alt: "Detail mastvoet en vallen",
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
    alt: "Tuigage en spars",
    caption: "Tuigage",
  },
  {
    id: "houtwerk",
    src: "/windkracht-vier/fotos/IMG_6068.jpg",
    alt: "Detail houtwerk",
    caption: "Houtwerk",
    span: "tall",
  },
  {
    id: "kuip",
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
    id: "ligplaats",
    src: "/windkracht-vier/fotos/IMG_6099.jpg",
    alt: "Windkracht Vier bij de steiger",
    caption: "Ligplaats",
    span: "wide",
  },
  {
    id: "haven-2",
    src: "/windkracht-vier/fotos/IMG_6100.jpg",
    alt: "Windkracht Vier in de jachthaven",
    caption: "Afmeren",
  },
  {
    id: "detail-6238",
    src: "/windkracht-vier/fotos/IMG_6238.jpg",
    alt: "Detailopname Windkracht Vier",
    caption: "Detail",
  },
  {
    id: "portret-6a",
    src: "/windkracht-vier/fotos/foto-6a5aacbd.jpg",
    alt: "Windkracht Vier, portretfoto",
    caption: "Portret",
    span: "tall",
  },
  {
    id: "portret-b1",
    src: "/windkracht-vier/fotos/foto-b128021b.jpg",
    alt: "Windkracht Vier, sfeerbeeld",
    caption: "Sfeer",
    span: "tall",
  },
  {
    id: "portret-c7",
    src: "/windkracht-vier/fotos/foto-c77081db.jpg",
    alt: "Windkracht Vier, portretfoto",
    caption: "Haven",
    span: "tall",
  },
];

export const HERO_PHOTO =
  BOAT_PHOTOS.find((p) => p.id === "op-het-water") ?? BOAT_PHOTOS[0];
