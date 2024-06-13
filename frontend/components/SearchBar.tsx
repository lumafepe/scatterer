import React from 'react';
import { Set } from '@/interfaces';
import {Card,Divider} from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { IoArrowDownOutline } from "react-icons/io5";

interface SearchBarProps {
    callback: Function;
}

const Inactive: React.FC<SearchBarProps> = ({ callback })=>{
    return(
    <Card className='flex' onClick={callback()}>
        <h3>Search</h3>
        <IoArrowDownOutline />
    </Card>
    )
}


const SearchBar: React.FC<SearchBarProps> = ({ callback }) => {
    const [active, setActive] = useState<boolean>(false);
    return (
        <div className="mb-4">
          <Divider className='max-w-md'/>
          { active ? 
            <h3>Hello</h3>
            :
            <Inactive callback={()=>{setActive(true)}}/>
          }
        </div>
  );
};

export default SearchBar;
