"use client";

import { MagicCard, MagicCardDetails, Filters, Deck, DeckCard, Legality, emptyFilter } from '@/interfaces'
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchCard(id:string): Promise<MagicCardDetails> {
    const response = await API.get(`/cards/${id}`);
    return response.data;
}


export async function fetchCards(page: number = 1, filter: Filters = emptyFilter()): Promise<MagicCard[]> {
    const response = await API.get('/cards', { params: {
        page: page,
        name: filter.name,
        colors: filter.colors,
        colorInclusivity: filter.colorInclusivity,
        types: filter.types.join(' '),
        sets: filter.sets.join(' '),
        manaValueMin: filter.manaValueMin,
        manaValueMax: filter.manaValueMax,
        keywords: filter.keywords.join(' '),
        legalIn: Object.entries(filter.formats).filter((fl) => fl[1] == Legality.Legal).map((fl) => fl[0]),
        restrictedIn: Object.entries(filter.formats).filter((fl) => fl[1] == Legality.Restricted).map((fl) => fl[0]),
        bannedIn: Object.entries(filter.formats).filter((fl) => fl[1] == Legality.Banned).map((fl) => fl[0]),
        leaderIn: filter.leaderIn.join(' ')
    }});

    return response.data;
}


export async function fetchDecks(): Promise<Deck[]> {
    const response = await API.get('/decks');
    return response.data;
}


export async function createDeck(name: string): Promise<Deck> {
    const response = await API.post('/decks/new', {
        name: name
    });

    return response.data;
}


export async function fetchDeckCards(uuid: string): Promise<DeckCard[]> {
    const response = await API.get(`/decks/${uuid}`);
    return response.data;
}

export async function setDeckCard(uuid: string, cardUUID: string, quantity: number): Promise<void> {
    const response = await API.put(`/decks/${uuid}`, {
        card: cardUUID,
        quantity: quantity
    });
}

export async function updateDeckCard(uuid: string, cardUUID: string, increment: number): Promise<void> {
    const response = await API.put(`/decks/${uuid}`, {
        card: cardUUID,
        increment: increment
    });
}