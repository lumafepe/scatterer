'use client'
import { useEffect, useState } from 'react';
import {fetchCards} from '@/api';
import CardComp from '@/components/CardComp';
import SearchBar from '@/components/SearchBar'
import {MagicCard,Filters} from '@/interfaces';
import {Pagination} from "@nextui-org/react";


const CardPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [cards, setCards] = useState<MagicCard[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    async function fetchCardsS() {
        const res = await fetchCards(currentPage);
        setCards(res);
        setIsLoading(false);
    }
    fetchCardsS();
    }, [currentPage]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    ); 
  }
  return (
    <div>
      <SearchBar callback={(filter:Filters)=>{console.log(filter)}}/>
        <div className="container mx-auto p-4">
          {cards ?
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((item, _) => (
                <CardComp card={item} />
            ))}
          </div>
          : <p>No cards found</p>}
          <Pagination className="flex justify-end" loop showControls color="warning" total={1000} initialPage={1} page={currentPage} onChange={setCurrentPage} />
        </div>
      </div>
  );
};

export default CardPage;
