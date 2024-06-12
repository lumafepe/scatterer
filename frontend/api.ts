"use client";

import { MagicCard, MagicCardDetails, Filters, DeckCard,Deck } from '@/interfaces'

export async function fetchCard(id:string): Promise<MagicCardDetails> {
    const res = await fetch(`http://localhost:8000/cartas?scryfallUUID=${id}`);
    const result = await res.json();
    return result[0]

    const query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?name ?alternativeDeckLimit ?asciiName (group_concat(distinct ?cic;separator="") as ?colorIdentities) (group_concat(distinct ?lfn) as ?isValidLeaderIn) where {
        ${id} a :Card; :name ?name; :alternative_deck_limit ?alternativeDeckLimit .
        optional { ?c :ascii_name ?asciiName }
        optional { ?c :hasColorIdentity ?ci . ?ci :color_code ?cic }
        optional { ?c :isValidLeaderIn ?lf . ?lf :format_name ?lfn }
    } group by ?name ?asciiName ?alternativeDeckLimit`

    const printings_query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?code ?name ?date where { 
        ${id} a :Card; :hasPrinting ?s .
        ?s :set_code ?code; :set_name ?name; :set_date ?date .
    }`

    const legalities_query = `
    `

    const sides_query = `
    `

    //TODO: legalities, sides
}

const limit = 30
export async function fetchCards(page: number, filter: Filters|null): Promise<MagicCard[]> {
    const offset = limit * page
    const res = await fetch(`http://localhost:8000/cards?_page=${page}&_per_page=${limit}`);
    const result = await res.json();
    return result;

}

export async function fetchDecks(): Promise<Deck[]> {
    const res = await fetch(`http://localhost:8000/decks`);
    const result = await res.json();
    return result;

    const query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?uuid ?name (sum (?number) as ?card_number) where {
        ?d a :Deck; :deck_uuid ?uuid; :deck_name ?name; :hasDeckCard ?dc .
        ?dc :deckcard_quantity ?number .
    } group by ?uuid ?name`
}


export async function fetchDeckCards(uuid: string): Promise<DeckCard[]> {
    const res = await fetch(`http://localhost:8000/decksCards/`);
    const result = await res.json();
    return result[uuid];

    const query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?name ?asciiName ?scryfallUUID ?quantity where {
        :${uuid} a :Deck; :hasDeckCard ?dc .
        ?dc :deckcard_quantity ?quantity; :ofCard ?c .
        ?c :name ?name; :scryfall_uuid ?scryfallUUID .
        optional { ?c :ascii_name ?asciiName }
    }`
}