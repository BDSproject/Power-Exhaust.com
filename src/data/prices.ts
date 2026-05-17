// POWER EXHAUST - Grille tarifaire de rachat
// Structure a deux niveaux :
//   PRIX_RACHAT[marque_echappement] = {
//     default: { EXCELLENT, BON, MOYEN }   <- prix si moto non listee
//     motos: { BMW: {...}, Honda: {...} }   <- prix specifiques par marque moto
//   }

export type EtatRachat = "EXCELLENT" | "BON" | "MOYEN";

export interface TarifMarque {
  EXCELLENT: number;
  BON: number;
  MOYEN: number;
}

export interface TarifExhaust {
  default: TarifMarque;
  motos?: Partial<Record<string, TarifMarque>>;
}

export const PRIX_RACHAT: Record<string, TarifExhaust> = {

  Akrapovic: {
    default:  { EXCELLENT: 620, BON: 420, MOYEN: 220 },
    motos: {
      BMW:               { EXCELLENT: 750, BON: 520, MOYEN: 280 },
      Honda:             { EXCELLENT: 680, BON: 460, MOYEN: 240 },
      Yamaha:            { EXCELLENT: 650, BON: 440, MOYEN: 230 },
      Kawasaki:          { EXCELLENT: 640, BON: 430, MOYEN: 225 },
      Suzuki:            { EXCELLENT: 620, BON: 420, MOYEN: 220 },
      Ducati:            { EXCELLENT: 720, BON: 500, MOYEN: 260 },
      KTM:               { EXCELLENT: 680, BON: 460, MOYEN: 240 },
      Aprilia:           { EXCELLENT: 700, BON: 480, MOYEN: 250 },
      Triumph:           { EXCELLENT: 650, BON: 440, MOYEN: 230 },
      "MV Agusta":       { EXCELLENT: 730, BON: 510, MOYEN: 265 },
      "Harley-Davidson": { EXCELLENT: 580, BON: 390, MOYEN: 200 },
    },
  },

  Termignoni: {
    default:  { EXCELLENT: 580, BON: 390, MOYEN: 200 },
    motos: {
      BMW:               { EXCELLENT: 700, BON: 480, MOYEN: 250 },
      Honda:             { EXCELLENT: 640, BON: 430, MOYEN: 225 },
      Yamaha:            { EXCELLENT: 620, BON: 415, MOYEN: 215 },
      Kawasaki:          { EXCELLENT: 610, BON: 410, MOYEN: 210 },
      Suzuki:            { EXCELLENT: 600, BON: 400, MOYEN: 205 },
      Ducati:            { EXCELLENT: 680, BON: 460, MOYEN: 240 },
      KTM:               { EXCELLENT: 640, BON: 430, MOYEN: 225 },
      Aprilia:           { EXCELLENT: 660, BON: 445, MOYEN: 230 },
      Triumph:           { EXCELLENT: 610, BON: 410, MOYEN: 210 },
      "MV Agusta":       { EXCELLENT: 690, BON: 470, MOYEN: 245 },
    },
  },

  "SC-Project": {
    default:  { EXCELLENT: 480, BON: 320, MOYEN: 170 },
    motos: {
      BMW:               { EXCELLENT: 560, BON: 380, MOYEN: 200 },
      Honda:             { EXCELLENT: 510, BON: 340, MOYEN: 180 },
      Yamaha:            { EXCELLENT: 500, BON: 335, MOYEN: 175 },
      Kawasaki:          { EXCELLENT: 490, BON: 328, MOYEN: 172 },
      Suzuki:            { EXCELLENT: 480, BON: 320, MOYEN: 170 },
      Ducati:            { EXCELLENT: 540, BON: 365, MOYEN: 190 },
      KTM:               { EXCELLENT: 510, BON: 340, MOYEN: 180 },
      Aprilia:           { EXCELLENT: 520, BON: 350, MOYEN: 185 },
      "MV Agusta":       { EXCELLENT: 550, BON: 370, MOYEN: 195 },
    },
  },

  "Austin Racing": {
    default:  { EXCELLENT: 420, BON: 280, MOYEN: 150 },
    motos: {
      Honda:             { EXCELLENT: 460, BON: 310, MOYEN: 165 },
      BMW:               { EXCELLENT: 490, BON: 330, MOYEN: 175 },
      Ducati:            { EXCELLENT: 480, BON: 320, MOYEN: 170 },
      Yamaha:            { EXCELLENT: 440, BON: 295, MOYEN: 158 },
      Kawasaki:          { EXCELLENT: 430, BON: 288, MOYEN: 154 },
    },
  },

  Yoshimura: {
    default:  { EXCELLENT: 300, BON: 200, MOYEN: 110 },
    motos: {
      Honda:             { EXCELLENT: 340, BON: 230, MOYEN: 125 },
      Yamaha:            { EXCELLENT: 320, BON: 215, MOYEN: 118 },
      Kawasaki:          { EXCELLENT: 315, BON: 210, MOYEN: 115 },
      Suzuki:            { EXCELLENT: 330, BON: 220, MOYEN: 120 },
      BMW:               { EXCELLENT: 360, BON: 240, MOYEN: 130 },
      Ducati:            { EXCELLENT: 350, BON: 235, MOYEN: 128 },
      KTM:               { EXCELLENT: 320, BON: 215, MOYEN: 118 },
    },
  },

  Arrow: {
    default:  { EXCELLENT: 280, BON: 185, MOYEN: 100 },
    motos: {
      BMW:               { EXCELLENT: 330, BON: 220, MOYEN: 120 },
      Honda:             { EXCELLENT: 310, BON: 205, MOYEN: 112 },
      Yamaha:            { EXCELLENT: 300, BON: 200, MOYEN: 108 },
      Kawasaki:          { EXCELLENT: 295, BON: 196, MOYEN: 106 },
      Suzuki:            { EXCELLENT: 290, BON: 192, MOYEN: 104 },
      Ducati:            { EXCELLENT: 320, BON: 212, MOYEN: 115 },
      KTM:               { EXCELLENT: 305, BON: 202, MOYEN: 110 },
      Aprilia:           { EXCELLENT: 310, BON: 206, MOYEN: 112 },
      Triumph:           { EXCELLENT: 295, BON: 196, MOYEN: 106 },
    },
  },

  Leovince: {
    default:  { EXCELLENT: 220, BON: 145, MOYEN: 80 },
    motos: {
      BMW:               { EXCELLENT: 260, BON: 173, MOYEN: 95 },
      Honda:             { EXCELLENT: 240, BON: 160, MOYEN: 88 },
      Yamaha:            { EXCELLENT: 235, BON: 156, MOYEN: 86 },
      Kawasaki:          { EXCELLENT: 230, BON: 152, MOYEN: 84 },
      Suzuki:            { EXCELLENT: 225, BON: 149, MOYEN: 82 },
      Ducati:            { EXCELLENT: 250, BON: 166, MOYEN: 92 },
      KTM:               { EXCELLENT: 240, BON: 160, MOYEN: 88 },
    },
  },

  Mivv: {
    default:  { EXCELLENT: 260, BON: 175, MOYEN: 95 },
    motos: {
      BMW:               { EXCELLENT: 300, BON: 200, MOYEN: 110 },
      Honda:             { EXCELLENT: 275, BON: 184, MOYEN: 100 },
      Yamaha:            { EXCELLENT: 270, BON: 180, MOYEN: 98 },
      Kawasaki:          { EXCELLENT: 265, BON: 177, MOYEN: 97 },
      Suzuki:            { EXCELLENT: 260, BON: 175, MOYEN: 95 },
      Ducati:            { EXCELLENT: 290, BON: 194, MOYEN: 106 },
      Aprilia:           { EXCELLENT: 280, BON: 187, MOYEN: 102 },
      "MV Agusta":       { EXCELLENT: 295, BON: 197, MOYEN: 108 },
    },
  },

  Remus: {
    default:  { EXCELLENT: 240, BON: 160, MOYEN: 85 },
    motos: {
      BMW:               { EXCELLENT: 290, BON: 194, MOYEN: 106 },
      Honda:             { EXCELLENT: 255, BON: 170, MOYEN: 92 },
      Yamaha:            { EXCELLENT: 250, BON: 167, MOYEN: 90 },
      Kawasaki:          { EXCELLENT: 245, BON: 163, MOYEN: 88 },
      KTM:               { EXCELLENT: 260, BON: 173, MOYEN: 94 },
    },
  },

  GPR: {
    default:  { EXCELLENT: 180, BON: 120, MOYEN: 65 },
    motos: {
      BMW:               { EXCELLENT: 210, BON: 140, MOYEN: 76 },
      Honda:             { EXCELLENT: 192, BON: 128, MOYEN: 70 },
      Yamaha:            { EXCELLENT: 188, BON: 125, MOYEN: 68 },
      Kawasaki:          { EXCELLENT: 185, BON: 123, MOYEN: 67 },
      Suzuki:            { EXCELLENT: 183, BON: 122, MOYEN: 66 },
      Ducati:            { EXCELLENT: 200, BON: 133, MOYEN: 72 },
      KTM:               { EXCELLENT: 190, BON: 127, MOYEN: 69 },
    },
  },

  Dominator: {
    default:  { EXCELLENT: 200, BON: 130, MOYEN: 70 },
    motos: {
      BMW:               { EXCELLENT: 240, BON: 160, MOYEN: 86 },
      Honda:             { EXCELLENT: 215, BON: 143, MOYEN: 77 },
      Yamaha:            { EXCELLENT: 210, BON: 140, MOYEN: 75 },
      Kawasaki:          { EXCELLENT: 208, BON: 138, MOYEN: 74 },
      KTM:               { EXCELLENT: 220, BON: 147, MOYEN: 79 },
    },
  },

  "FMF Racing": {
    default:  { EXCELLENT: 260, BON: 175, MOYEN: 90 },
    motos: {
      Honda:             { EXCELLENT: 290, BON: 194, MOYEN: 105 },
      Kawasaki:          { EXCELLENT: 280, BON: 187, MOYEN: 101 },
      KTM:               { EXCELLENT: 300, BON: 200, MOYEN: 108 },
      Yamaha:            { EXCELLENT: 275, BON: 184, MOYEN: 99 },
      Suzuki:            { EXCELLENT: 270, BON: 180, MOYEN: 97 },
    },
  },

  "Two Brothers Racing": {
    default:  { EXCELLENT: 220, BON: 145, MOYEN: 75 },
    motos: {
      Honda:             { EXCELLENT: 250, BON: 166, MOYEN: 88 },
      Yamaha:            { EXCELLENT: 240, BON: 160, MOYEN: 86 },
      Kawasaki:          { EXCELLENT: 235, BON: 157, MOYEN: 84 },
      Suzuki:            { EXCELLENT: 230, BON: 153, MOYEN: 82 },
    },
  },

  "Vance & Hines": {
    default:  { EXCELLENT: 320, BON: 210, MOYEN: 115 },
    motos: {
      "Harley-Davidson": { EXCELLENT: 400, BON: 270, MOYEN: 148 },
      Honda:             { EXCELLENT: 340, BON: 226, MOYEN: 124 },
    },
  },

  HGS: {
    default:  { EXCELLENT: 300, BON: 200, MOYEN: 110 },
    motos: {
      KTM:               { EXCELLENT: 360, BON: 240, MOYEN: 132 },
      Honda:             { EXCELLENT: 330, BON: 220, MOYEN: 121 },
      Husqvarna:         { EXCELLENT: 350, BON: 233, MOYEN: 128 },
      "Gas Gas":         { EXCELLENT: 340, BON: 226, MOYEN: 124 },
      Yamaha:            { EXCELLENT: 320, BON: 213, MOYEN: 117 },
    },
  },
};

/**
 * Retourne le prix de rachat.
 * Cherche d'abord un tarif specifique a la marque de moto,
 * puis utilise le tarif par defaut si non trouve.
 */
export function getPrixRachat(
  marqueExhaust: string,
  etat: EtatRachat,
  marqueMoto?: string
): number | null {
  const tarif = PRIX_RACHAT[marqueExhaust];
  if (!tarif) return null;
  if (marqueMoto && tarif.motos?.[marqueMoto]) {
    return tarif.motos[marqueMoto]![etat];
  }
  return tarif.default[etat];
}

/**
 * Retourne les 3 tarifs (EXCELLENT/BON/MOYEN) pour une combinaison donnee.
 */
export function getTarifComplet(
  marqueExhaust: string,
  marqueMoto?: string
): TarifMarque | null {
  const tarif = PRIX_RACHAT[marqueExhaust];
  if (!tarif) return null;
  if (marqueMoto && tarif.motos?.[marqueMoto]) {
    return tarif.motos[marqueMoto]!;
  }
  return tarif.default;
}
