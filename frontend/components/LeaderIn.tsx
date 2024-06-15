import React from 'react';
import {Divider} from "@nextui-org/react";

interface LeaderInProps {
  data: string[];
}

const LeaderIn: React.FC<LeaderInProps> = ({ data }) => {
  return (
    <div className="max-w-md">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">Valid Leader In</h3>
        </div>
        <Divider className='max-w-md'/>
        <ul className='ml-4'>
          {data.map((format:string, pos) => (<li key={`${format}${pos}`}>- {format}</li>))}
        </ul>
    </div>
  );
};

export default LeaderIn;