import Image from 'next/image'
import React, { ReactNode } from 'react';

interface NavBarProps {
    children: ReactNode;
}

const NavBar: React.FC<NavBarProps> = ({ children }) => {
    return (
    <nav className="border-gray-200 px-2 mb-10">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
            <a href="#" className="flex transform transition-transform duration-300 hover:scale-105">
                <Image src="/MTG.webp" alt="/no-image.svg" height={70} width={100} className="mr-4"/>
                <span className="self-center text-lg font-semibold whitespace-nowrap">Random Projeto de Cartas de Wagic</span>
            </a>
            <div className="hidden md:flex justify-between items-center w-full md:w-auto md:order-1" id="mobile-menu-3">
                <ul className="flex-col md:flex-row flex md:space-x-32 mt-4 md:mt-0 md:text-sm md:font-medium">
                    <li>
                        <a href="#" className="bg-orange-700 md:bg-transparent text-white block pl-3 pr-4 py-2 md:text-orange-700 md:p-0 rounded md:hover:text-orange-800 transform transition-transform duration-300 hover:scale-105" aria-current="page">Add Card</a>
                    </li>
                    <li>
                        <a href="#" className="bg-orange-700 md:bg-transparent text-white block pl-3 pr-4 py-2 md:text-orange-700 md:p-0 rounded md:hover:text-orange-800 transform transition-transform duration-300 hover:scale-105" aria-current="page"><Image src="/search.svg" alt="/no-image.svg" height={22} width={22} className="mr-4 dark:invert"/></a>
                    </li>
                </ul>
            </div>
        </div>
        {children}
    </nav>
    )
}


export default NavBar;

