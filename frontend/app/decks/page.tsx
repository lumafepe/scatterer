'use client'

import { useEffect, useState } from 'react';
import {fetchDecks,createDeck} from '@/api';
import DeckComp from '@/components/Deck';
import {Deck} from '@/interfaces';
import {Input,Button} from "@nextui-org/react";
import { FaPlus } from "react-icons/fa6";


const CardPage: React.FC = () => {
  const [cardData, setDecksData] = useState<Deck[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addDeckCard,setAddDeckCard] = useState<string>("");

  useEffect(() => {
      async function fetchDecksData() {
        const res = await fetchDecks();
        setDecksData(res);
        setIsLoading(false);
        setAddDeckCard("");
      }
      if (isLoading===true)
        fetchDecksData();
  }, [cardData]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    ); 
  }

  return (
      <div className="container mx-auto p-4">
        <div className='flex justify-start items-center mb-4'>
          <h3 className='mr-4 w-max'>Crete New Deck: </h3>
          <Input className='mr-4 max-w-64' type="string" label="Deck Name" placeholder="" labelPlacement="inside" value={addDeckCard} onValueChange={setAddDeckCard}/>
          <Button className='w-max' color='warning' isIconOnly onPress={async ()=>{
              const a:Deck = await createDeck(addDeckCard);
              const b:Deck[] = [];
              if (cardData===null) setDecksData([a]);
              else setDecksData(b.concat(cardData, a));
              setIsLoading(true);
            }}><FaPlus /></Button>
        </div>
        {cardData ?
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cardData.map((item, pos) => (
              <DeckComp key={item.uuid} deck={item} />
          ))}
        </div>
        : <p>No decks found</p>}
      </div>
  );
};

export default CardPage;
