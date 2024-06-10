import { Card, CardDetails, Filters, DeckDetails } from '@/interfaces'

export async function fetchCard(id:string): Promise<CardDetails> {
    const res = await fetch(`http://localhost:8000/cartas?scryfallUUID=${id}`);
    const result = await res.json();
    return result[0]
}

const limit = 50
function fetchCards(page: number, filter: Filters): Card[] {
    const offset = limit * page
}

export async function fetchDecks(): Promise<string[]> {
    const res = await fetch(`http://localhost:8000/decks`);
    const result = await res.json();
    return result;
}

function fetchDeck(name: string): DeckDetails {

}