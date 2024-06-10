import React from 'react';
import {Divider} from "@nextui-org/react";

interface LegalitiesProps {
  data: { [key: string]: string };
}

const Legalities: React.FC<LegalitiesProps> = ({ data }) => {
  return (
    <div className="max-w-md">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Legalities</h3>
        </div>
        <Divider className='max-w-md'/>
        <ul className='ml-4'>
        {Object.entries(data).map(([format, legality], index) => (
          <li key={index}>
            <strong>{format}:</strong> {legality}
          </li>
        ))}
        </ul>
      </div>
  );
};

export default Legalities;