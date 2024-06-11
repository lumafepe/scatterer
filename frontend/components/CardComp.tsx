import React from 'react';
import {MagicCard} from "@/interfaces"
import { GiCardPlay } from "react-icons/gi";

import {Card, CardBody,Link,Image} from "@nextui-org/react";

interface CardCompProps {
  card : MagicCard,
  quantity?: number
}
interface Names{
  name:string,
  asciiName?:string
}

const Name:React.FC<Names> = ({name,asciiName})=>{
  if (asciiName!=null){
    return (
      <div>
        <p className='text-center'>{name}</p>
        <p className='text-center'>{asciiName}</p>
      </div>
    );
  } else{
    return (<p className='text-center'>{name}</p>);
  }
}


const CardComp: React.FC<CardCompProps> = ( {card,quantity} ) => {
  let imageSrc = "https://api.scryfall.com/cards/"+card.scryfallUUID+"?format=image";
  return (
    <Card className="p-4 border rounded-lg shadow-md flex justify-center">
        <Link color="foreground" href={`/cards/${card.scryfallUUID}`}>
          <CardBody className='flex justify-center'>
            <div>
              <Image alt={card.name} className="object-cover" height={300} shadow="md" src={imageSrc} width="100%"/>
              {(quantity != null) ?
              <div className='flex justify-between'>
                <Name name={card.name} asciiName={card.asciiName}/>
                <div className='flex'><GiCardPlay />{quantity}</div>
              </div>                
              :
              <Name name={card.name} asciiName={card.asciiName}/>
              }
            </div>
          </CardBody>
        </Link>
    </Card>
  );
};

export default CardComp;