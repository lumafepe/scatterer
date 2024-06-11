import React from 'react';
import { Side } from '@/interfaces';

interface SideDetailsProps {
  key: string;
  side: Side;
}

const SideDetails: React.FC<SideDetailsProps> = ({ key,side }) => {
  return (
    <div className="mb-4">
      <h3 className="text-2xl font-semibold">Side:{key}</h3>
      <p>Mana Value: {side.manaValue}</p>
      {side.faceManaValue && <p>Face Mana Value: {side.faceManaValue}</p>}
      {side.faceName && <p>Face Name: {side.faceName}</p>}
      <p>Text: {side.text}</p>
      <p>Colors: {side.colors.join(', ')}</p>
      <p>Color Indicators: {side.colorIndicators.join(', ')}</p>
      <p>Keywords: {side.keywords.join(', ')}</p>
      <p>Types: {side.types.join(', ')}</p>
      <p>Subtypes: {side.subtypes.join(', ')}</p>
      <p>Supertypes: {side.supertypes.join(', ')}</p>
      {side.defense && <p>Defense: {side.defense}</p>}
      {side.hand && <p>Hand: {side.hand}</p>}
      {side.life && <p>Life: {side.life}</p>}
      {side.loyalty && <p>Loyalty: {side.loyalty}</p>}
      {side.power && <p>Power: {side.power}</p>}
      {side.toughness && <p>Toughness: {side.toughness}</p>}
    </div>
  );
};

export default SideDetails;
