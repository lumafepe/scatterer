import React from 'react';
import { Set } from '@/interfaces';
import {Divider} from "@nextui-org/react";

interface PrintingsProps {
  printings: Set[];
}

const Printings: React.FC<PrintingsProps> = ({ printings }) => {
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-semibold">Printings</h3>
      <Divider className='max-w-md'/>
      <ul>
        {printings.map((printing, index) => (
          <li key={index}>
            <strong>{printing.name}:</strong> {printing.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Printings;
