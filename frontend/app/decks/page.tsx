'use client'

import { useEffect, useState } from 'react';
import {fetchDecks} from '@/api';
import {Card, CardBody,Link} from "@nextui-org/react";

const CardPage: React.FC = () => {
  const [cardData, setDecksData] = useState<string[] | null>(null);
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
              <Card className="p-4 border rounded-lg shadow-md flex justify-center">
                <Link color="foreground" href={`/decks/${item}`}>
                  <CardBody>
                    <p className='text-center'>{item}</p>
                  </CardBody>
                </Link>
              </Card>
          ))}
        </div>
        : <p>No decks found</p>}
      </div>
  );
};

export default CardPage;
