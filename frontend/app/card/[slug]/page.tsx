'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from 'react';
import CardDetails from '@/components/CardDetails';
import { Card } from '@/interfaces';
import {fetchCard} from '@/api';

const CardPage: React.FC = () => {
  const params = useParams();
  const { slug } = params;
  const [cardData, setCardData] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      async function fetchCardData() {
        const res = await fetchCard(slug);
        setCardData(res);
        setIsLoading(false);
      }
      fetchCardData();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Card Details</h1>
        <p>Loading...</p>
      </div>
    ); 
  }

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Card Details</h1>
        {cardData ? <CardDetails card={cardData} /> : <p>Card not found</p>}
      </div>
  );
};

export default CardPage;
