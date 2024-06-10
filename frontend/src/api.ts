"use client";

import { Card, CardDetails, Filters, DeckDetails } from './interfaces'

function fetchCard(): CardDetails {

}

const limit = 50
function fetchCards(page: number, filter: Filters): Card[] {
    const offset = limit * page
}

function fetchDecks(): string[] {

}

function fetchDeck(name: string): DeckDetails {

}