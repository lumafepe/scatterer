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
  name?: string;

  colors: string; //list of chars: 'BGRUW'
  colorInclusivity?: Inclusivity;

  types: string[];

  manaValueMin?: number;
  manaValueMax?: number;
  keywords: string[];

  sets: string[];

  formats: { [format: string]: Legality }

  leaderIn: string[];
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
  card: MagicCard;
  quantity: number;
}
