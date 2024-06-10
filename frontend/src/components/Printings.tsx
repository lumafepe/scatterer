import React from 'react';
import { Set } from '../interfaces';

interface PrintingsProps {
  printings: Set[];
}

const Printings: React.FC<PrintingsProps> = ({ printings }) => {
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-semibold">Printings</h3>
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
