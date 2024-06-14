// interfaces.ts
export interface Set {
  code: string;
  name: string;
  date: string;
}

export interface Ruling {
  date: string;
  text: string;
}

export interface Side {
  manaValue: number;
  text: string;
  faceManaValue?: number;
  faceName?: string;
  defense?: string;
  hand?: string;
  life?: string;
  loyalty?: string;
  power?: string;
  toughness?: string;
  colors: string[];
  colorIndicators: string[];
  keywords: string[];
  types: string[];
  subtypes: string[];
  supertypes: string[];
}

export interface MagicCard {
  name: string;
  scryfallUUID: string;
  asciiName?: string;
}

export interface MagicCardDetails extends MagicCard {
  alternativeDeckLimit: boolean;
  colorIdentities: string[];
  printings: Set[];
  rulings: Ruling[];
  sides: { [key: string]: Side };
  legalities: { [key: string]: string };
  isValidLeaderIn: string[];
}


export enum Inclusivity {
  AnyOf,
  AtLeast,
  AtMost,
  Exactly
}

export enum Legality {
  Legal,
  Restricted,
  Banned
}

export interface Filters {
  name?: string; //searchbar

  types: string[]; //searchbar

  keywords: string[]; //searchbar

  colors: string; //list of chars: 'BGRUW' //multiselctor
  colorInclusivity?: Inclusivity; //selector with default

  sets: string[]; //multiselector
  leaderIn: string[]; //multiselector

  manaValueMin?: number; // 1 text fields
  manaValueMax?: number; // 1 text fields
  
  formats: { [format: string]: Legality } //selector for each
}

export function emptyFilter(): Filters {
  return {
    colors: '',
    types: [],
    keywords: [],
    sets: [],
    formats: {},
    leaderIn: []
  };
}

export interface Deck {
  uuid: string;
  name: string;
  card_number: number;
}

export interface DeckCard {
  name: string;
  scryfallUUID: string;
  quantity: number;
}
