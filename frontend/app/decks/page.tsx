'use client'

import { useEffect, useState } from 'react';
import {fetchDecks} from '@/api';
import DeckComp from '@/components/Deck';
import {Deck} from '@/interfaces';

const CardPage: React.FC = () => {
  const [cardData, setDecksData] = useState<Deck[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      async function fetchDecksData() {
        const res = await fetchDecks();
        setDecksData(res);
        setIsLoading(false);
      }
      fetchDecksData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    ); 
  }

  return (
      <div className="container mx-auto p-4">
        {cardData ?
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cardData.map((item, _) => (
              <DeckComp deck={item} />
          ))}
        </div>
        : <p>No decks found</p>}
      </div>
  );
};

export default CardPage;
