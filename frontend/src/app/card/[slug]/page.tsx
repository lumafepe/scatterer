'use client'
// pages/card/[id].tsx
import { useParams } from "next/navigation";
import { useEffect, useState } from 'react';
import CardDetails from '../../../components/CardDetails';
import NavBar from "../../../components/NavBar";
import { Card } from '../../../interfaces';
import { useRouter } from 'next/router';

const CardPage: React.FC = () => {
  const params = useParams();
  const { slug } = params;
  const [cardData, setCardData] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      async function fetchCardData() {
        const res = await fetch(`http://localhost:8000/cartas?scryfallUUID=${slug}`);
        const result = await res.json();
        setCardData(result[0]);
        setIsLoading(false);
      }
      fetchCardData();
    }
  }, [slug]);

  if (isLoading) {
    return (
    <NavBar>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Card Details</h1>
        <p>Loading...</p>
      </div>
    </NavBar>
    );
  }

  return (
    <NavBar>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Card Details</h1>
        {cardData ? <CardDetails card={cardData} /> : <p>Card not found</p>}
      </div>
    </NavBar>
  );
};

export default CardPage;
