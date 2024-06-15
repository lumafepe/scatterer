'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from 'react';
import {fetchDeckCards} from '@/api';
import CardComp from '@/components/CardComp';
import {DeckCard} from '@/interfaces';

const CardPage: React.FC = () => {
    const params = useParams();
    const { slug } = params;
    const [cards, setDeckCards] = useState<DeckCard[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    async function fetchDeckCardsS() {
        const res = (typeof slug === "string") ? await fetchDeckCards(slug) : await fetchDeckCards(slug.join(''));
        setDeckCards(res);
        setIsLoading(false);
    }
    if (slug)
        fetchDeckCardsS();
    }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    ); 
  }
  return (
      <div className="container mx-auto p-4">
        {cards ?
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((item, _) => (
              <CardComp key={item.scryfallUUID} scryfallUUID={item.scryfallUUID} name={item.name} quantity={item.quantity} />
          ))}
        </div>
        : <p>No cards found</p>}
      </div>
  );
};

export default CardPage;
