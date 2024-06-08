'use client'
// pages/card/[id].tsx
import { useParams } from "next/navigation";
import { useEffect, useState } from 'react';
import CardDetails from '../../../components/CardDetails';
import NavBar from "../../../components/NavBar";
import { Card } from '../../../interfaces';

const CardPage: React.FC = () => {
  const params = useParams();
  const { slug } = params;
  const [cardData, setCardData] = useState<Card | null>(null);

  useEffect(() => {
    if (slug) {
      async function fetchCardData() {
        const res = await fetch(`http://localhost:8000/cartas?scryfallUUID=${slug}`);
        const result = await res.json();
        console.log(result[0])
        setCardData(result[0]);
      }
      fetchCardData();
    }
  }, [slug]);

  return (
    <NavBar>
       <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold mb-4">Card Details</h1>
          {cardData ? (<CardDetails card={cardData} />) : (<p>Loading...</p>)}
      </div>
    </NavBar>
  );
};

export default CardPage;
