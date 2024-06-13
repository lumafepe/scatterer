import React from 'react';
import {Deck} from "@/interfaces"
import { GiCardPlay } from "react-icons/gi";

import {Card, CardBody,Link} from "@nextui-org/react";

interface DeckCompProps {
  deck :Deck
}

const DeckComp: React.FC<DeckCompProps> = ( {deck} ) => {
  return (
    <Card className="p-4 border rounded-lg shadow-md flex justify-center">
        <Link color="foreground" href={`/decks/${deck.uuid}`}>
            <CardBody className='flex justify-center'>
                <div className='flex justify-between'>
                <p className='text-center'>{deck.name}</p>
                <div className='flex'><GiCardPlay />{deck.card_number}</div>
                </div>
            </CardBody>
        </Link>
    </Card>
  );
};

export default DeckComp;