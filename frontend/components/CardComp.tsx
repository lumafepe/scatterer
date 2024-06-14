import React from 'react';
import {MagicCard} from "@/interfaces"
import { GiCardPlay } from "react-icons/gi";

import {Card, CardBody,Link,Image} from "@nextui-org/react";

interface CardCompProps {
  name: string
  scryfallUUID:string
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


const CardComp: React.FC<CardCompProps> = ( {name,scryfallUUID,quantity} ) => {
  let imageSrc = "https://api.scryfall.com/cards/"+scryfallUUID+"?format=image";
  if (quantity === undefined){
    return (
      <Card className="p-4 border rounded-lg shadow-md flex justify-center">
          <Link color="foreground" href={`/card/${scryfallUUID}`}>
            <CardBody className='flex justify-center'>
              <Image alt={name} className="object-cover" height={300} shadow="md" src={imageSrc} width="100%"/>
            </CardBody>
          </Link>
      </Card>
    );
  }
  return (
    <Card className="p-4 border rounded-lg shadow-md flex justify-center">
        <Link color="foreground" href={`/card/${scryfallUUID}`}>
          <CardBody className='flex justify-center'>
            <div>
              <Image alt={name} className="object-cover" height={300} shadow="md" src={imageSrc} width="100%"/>
              <div className='flex'><GiCardPlay />{quantity}</div>               
            </div>
          </CardBody>
        </Link>
    </Card>
  );
};

export default CardComp;