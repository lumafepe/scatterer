import React from 'react';
import { MagicCardDetails } from '@/interfaces';
import Printings from './Printings';
import Rullings from './Rulings';
import LeaderIn from './LeaderIn';
import Legalities from './Legalities';
import Side from './Side';
import {Card, CardBody, Image, Button,Divider,Spacer} from "@nextui-org/react";
import {updateDeckCard} from '@/api'
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

interface CardDetailsProps {
  card: MagicCardDetails;
}

function CharToSymbol(symbol:string) {
  return <Image src={"/icons/"+symbol.toLowerCase()+".svg"} alt="/no-image.svg" width={20} height={20} className="mr-2" />
}

function getDeckCookie(): string | undefined {
  return Cookies.get('deck');
}



const CardDetails: React.FC<CardDetailsProps> = ({ card }) => {
  const [adding, setAdding] = useState<boolean>(false);
  
  let imageSrc = "https://api.scryfall.com/cards/"+card.scryfallUUID+"?format=image";

  useEffect(() => {
    async function addCardToDeck(){
      const deck = getDeckCookie();
      if (deck === undefined) alert("Please select a deck first");
      else{
        await updateDeckCard(deck,card.scryfallUUID,1);
      }
    }
    if (adding===true){
      addCardToDeck();
      setAdding(false);
    }
  }, [adding,card.scryfallUUID]);
  
  return (
    <div className="max-w-full max-h-full mx-auto p-4">
      <Card isBlurred className="border-none bg-background/60 dark:bg-default-100/50" shadow="sm">
        <CardBody>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
            <div className="relative col-span-6 md:col-span-4">
              <Image alt={card.name} className="object-cover" height={400} shadow="md" src={imageSrc} width="100%"/>
            </div>
            <div className="flex flex-col col-span-6 md:col-span-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0">
                  <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
                  {card.asciiName && <h2 className="text-xl italic mb-2">({card.asciiName})</h2>}
                  <Spacer className='h-10'/>
                  <h3 className="text-2xl font-semibold">Basic Information</h3>
                  <Divider className='max-w-md'/>
                  <ul>
                    <li>
                      <strong>Alternative Deck Limit:</strong> {card.alternativeDeckLimit ? 'Yes' : 'No'}
                    </li>
                    <li>
                      <strong>Color Identities:</strong> <span className="whitespace-nowrap">{card.colorIdentities.map((symbol, pos) => (<div key={`${pos}${symbol}`} className="inline-block">{CharToSymbol(symbol)}</div>))}</span>
                    </li>
                  </ul>
                  <Spacer className='h-10'/>
                  <Printings printings={card.printings} />
                </div>
                <div className="flex flex-col gap-0">
                  <Button disabled={adding} data-hover="Add to deck" className='bg-orange-700' onPressEnd={()=>setAdding(true)} >Add to Deck</Button>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/*SideDetails components */}
      <Spacer className='h-20'/>
      <div className="flex-1 flex"> {/* Container for card information */} {/* Card information container */}
        {Object.entries(card.sides).map(([key,value], i) => 
          <div key={key} className="flex-1">
            <Side key={key} side={value} />
          </div>
        )}
      </div>
        
      <Spacer className='h-10'/>
      <Rullings rulings={card.rulings} />
      
      <Spacer className='h-10'/>
      <Legalities data={card.legalities}/>
      
      <Spacer className='h-10'/>
      <LeaderIn data={card.isValidLeaderIn}/>
    </div>
  );
};

export default CardDetails;
