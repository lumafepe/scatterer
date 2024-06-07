import React from 'react';
import { Ruling } from '../interfaces';

interface RulingsProps {
  rulings: Ruling[];
}

const Rulings: React.FC<RulingsProps> = ({ rulings }) => {
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-semibold">Rulings</h3>
      <ul>
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
