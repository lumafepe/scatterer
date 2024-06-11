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

export interface Card {
  name: string;
  scryfallUUID: string;
  asciiName?: string;
}

export interface CardDetails extends Card {
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

export interface Range {
  min: number,
  max: number
}

export interface Filters {
  name?: string;

  //colors
  colorsInclusivity?: Inclusivity,

  types: string[];
  typesInclusivity?: Inclusivity,
  manaValue?: Range

  //power
  //toughness
  //loyalty
}

export interface Deck {
  uuid: string;
  name: string;
  card_number: number;
}

export interface DeckCard {
  card: Card,
  quantity: number
}