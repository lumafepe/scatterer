import React from 'react';
import { Ruling } from '@/interfaces';

import {Divider} from "@nextui-org/react";

interface RulingsProps {
  rulings: Ruling[];
}

const Rulings: React.FC<RulingsProps> = ({ rulings }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold">Rulings</h3>
      <Divider className='max-w-md'/>
      <ul className='ml-4'>
        {rulings.map((ruling, index) => (
          <li key={index} className="mb-2">
            <strong>{ruling.date}:</strong> {ruling.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Rulings;
