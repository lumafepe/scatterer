"use client";

import { Card, CardDetails, Filters, DeckCard } from './interfaces'



const limit = 51
export function fetchCards(page: number, filter: Filters): Card[] {
    const offset = limit * page

    //TODO
}


//TODO: escape name? or not use name at all??
export function fetchCard(uuid: string): CardDetails {
    const query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?name ?alternativeDeckLimit ?asciiName (group_concat(distinct ?cic;separator="") as ?colorIdentities) (group_concat(distinct ?lfn) as ?isValidLeaderIn) where {
        ${uuid} a :Card; :name ?name; :alternative_deck_limit ?alternativeDeckLimit .
        optional { ?c :ascii_name ?asciiName }
        optional { ?c :hasColorIdentity ?ci . ?ci :color_code ?cic }
        optional { ?c :isValidLeaderIn ?lf . ?lf :format_name ?lfn }
    } group by ?name ?asciiName ?alternativeDeckLimit`

    const printings_query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?code ?name ?date where { 
        ${uuid} a :Card; :hasPrinting ?s .
        ?s :set_code ?code; :set_name ?name; :set_date ?date .
    }`

    const legalities_query = `
    `

    const sides_query = `
    `

    //TODO: legalities, sides
}


//Assume few decks exist
export function fetchDecks(): Deck[] {
    const query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?uuid ?name (sum (?number) as ?card_number) where {
        ?d a :Deck; :deck_uuid ?uuid; :deck_name ?name; :hasDeckCard ?dc .
        ?dc :deckcard_quantity ?number .
    } group by ?uuid ?name`


}


export function fetchDeckCards(uuid: string): DeckCard[] {
    const query = `
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?name ?asciiName ?scryfallUUID ?quantity where {
        :${uuid} a :Deck; :hasDeckCard ?dc .
        ?dc :deckcard_quantity ?quantity; :ofCard ?c .
        ?c :name ?name; :scryfall_uuid ?scryfallUUID .
        optional { ?c :ascii_name ?asciiName }
    }`
}