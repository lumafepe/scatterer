'use client'
import Image from 'next/image'
import React from 'react';
import {Select, SelectItem,Navbar, NavbarBrand, NavbarContent, NavbarItem, Link,Button} from "@nextui-org/react";
import { AiOutlineRedo } from "react-icons/ai";
import {fetchDecks} from "@/api";
import { Deck } from '@/interfaces';

import Cookies from 'js-cookie';

import { useEffect, useState } from 'react';

function getDeckCookie(): string | undefined {
    return Cookies.get('deck');
}



function NavBar() {
    const [DecksData, setDecksData] = useState<Deck[]>([]);
    const [currDeck, setCurrData] = useState<string | undefined>(getDeckCookie());

    const setDeckCookie = (e:any) => {
        setCurrData(e.target.value);
        Cookies.set('deck', e.target.value, { expires: 7 });
    };

    useEffect(() => {
      async function fetchDeckData() {
        const res = await fetchDecks();
        setDecksData(res);
      }
      if (DecksData.length==0)
        fetchDeckData();
    }, [DecksData]);
    return (
        <Navbar isBordered>
            <NavbarBrand>
                <Link color="foreground" href="/">
                    <Image src="/MTG.webp" alt="/no-image.svg" height={70} width={100} className="max-w-min mr-4"/>
                    <p className="font-bold text-inherit">Scatterer</p>
                </Link>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                    <Link color="foreground" href="/decks">
                      Decks
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
              <NavbarItem className='items-center'>
                <Select selectedKeys={(currDeck === undefined)?[]:[currDeck]} isLoading={(DecksData.length === 0)} label="Select Deck" className="w-48" onChange={setDeckCookie}>
                    {
                    DecksData.map((x : Deck) => (
                        <SelectItem key={x.uuid}>
                            {x.name}
                        </SelectItem>)
                        )
                    }
                </Select>
                <Button color='warning' isIconOnly data-hover="Refresh decks" onPressEnd={()=>{setDecksData([]);}} >
                    <AiOutlineRedo />
                </Button>
              </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
}


export default NavBar;

