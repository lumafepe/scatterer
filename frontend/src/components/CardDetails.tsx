import React from 'react';
import { Card } from '../interfaces';
import Printings from './Printings';
import Rullings from './Rulings';
import Side from './Side';
import Image from 'next/image'

interface CardDetailsProps {
  card: Card;
}

function CharToSymbol(symbol:string) {
  return "/icons/"+symbol.toLowerCase()+".svg";
}




const CardDetails: React.FC<CardDetailsProps> = ({ card }) => {
  let imageSrc = "https://api.scryfall.com/cards/"+card.scryfallUUID+"?format=image";
  return (
    <div className="max-w-full max-h-full mx-auto p-4 bg-green rounded shadow-lg">
      <div className="flex items-start"> {/* Flex container to align items in a row */}
        <div className="w-64 h-128 min-h-[400px] mr-4 flex-shrink-0 relative overflow-hidden"> {/* Image container with fixed dimensions */}
          <Image
            src={imageSrc}
            alt={card.name}
            layout="fill"
            objectFit="contain"
            className="transform hover:scale- transition-transform duration-300" // Scale up on hover
          />
        </div>
        <div className="flex-1"> {/* Container for card name and basic information */}
          <h1 className="text-3xl font-bold mb-2">{card.name}</h1>
          {card.asciiName && <h2 className="text-xl italic mb-2">({card.asciiName})</h2>}
          <div className="mb-4">
            <h3 className="text-2xl font-semibold">Basic Information</h3>
            <p>Alternative Deck Limit: {card.alternativeDeckLimit ? 'Yes' : 'No'}</p>
            <p className="inline-block">Color Identities: 
              <span className="whitespace-nowrap">
                {card.colorIdentities.map((symbol, index) => (
                  <div key={index} className="inline-block">
                    <Image src={CharToSymbol(symbol)} alt="/no-image.svg" width={20} height={20} className="mr-2" /> {/* Add margin between symbols */}
                  </div>))}
              </span>
            </p>
          </div>
          <Printings printings={card.printings} /> {/* Printings component */}
        </div>
      </div>

      {/*SideDetails components */}

      <div className="flex-1 flex"> {/* Container for card information */} {/* Card information container */}
        {Object.entries(card.sides).map(([key,value], _) => (
          <div className="flex-1 ml-4">
            <Side key={key} side={value} />
          </div>
        ))}
      </div>

      <div className="mt-4"> {/* Indent the content */}
        <Rullings rulings={card.rulings} />
      </div>

      <div className="mb-4"> {/* Indent the content */}
        <h3 className="text-2xl font-semibold">Legalities</h3>
        <ul>
          {Object.entries(card.legalities).map(([format, legality], index) => (
            <li key={index}>
              <strong>{format}:</strong> {legality}
            </li>
          ))}
        </ul>
      </div>

      {/* ValidLeaderIn component */}
      {card.isValidLeaderIn && (
        <div className="mb-4"> {/* Indent the content */}
          <h3 className="text-2xl font-semibold">Valid Leader In</h3>
          <ul>
            {card.isValidLeaderIn.map((format, index) => (
              <li key={index}>{format}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CardDetails;
