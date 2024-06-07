// interfaces.ts
export interface Printing {
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
    alternativeDeckLimit: boolean;
    name: string;
    scryfallUUID: string;
    asciiName?: string;
    colorIdentities: string[];
    printings: Printing[];
    rulings: Ruling[];
    sides: { [key: string]: Side };
    legalities: { [key: string]: string };
    isValidLeaderIn: string[];
  }
  