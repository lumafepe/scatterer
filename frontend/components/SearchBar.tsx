import React from 'react';
import { Set,Inclusivity,Legality,Filters } from '@/interfaces';
import {Card,Divider,CardBody,Image, Button} from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { IoArrowDownOutline,IoArrowUpOutline } from "react-icons/io5";
import {Textarea,Input} from "@nextui-org/input";
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import { IoSearch } from "react-icons/io5";
import { PressEvent } from "@react-types/shared"; // Import the PressEvent type

interface SearchBarProps {
  callback: (e: PressEvent) => void;
}

interface SearchBarActiveProps {
  callback: (e: PressEvent) => void;
  close: (e: PressEvent) => void;
}


const Inactive: React.FC<SearchBarProps> = ({ callback })=>{
  return(
    <Card isPressable onPress={callback}>
       <CardBody className="overflow-visible p-0">
        <div className='inline-flex justify-start'>
          <h3>Search</h3>
          <IoArrowDownOutline className='ml-4'/>
        </div>
       </CardBody>
    </Card>
  );
}

function CharToSymbol(symbol:any) {
  return <Image src={"/icons/"+symbol.toLowerCase()+".svg"} alt="/no-image.svg" width={20} height={20} className="mr-2" />
}
function Inclusivity2Text(s:Inclusivity){
  switch (s) {
    case Inclusivity.AnyOf:
      return "AnyOf";
    case Inclusivity.AtLeast:
      return "AtLeast";
    case Inclusivity.AtMost:
      return "AtMost";
    case Inclusivity.Exactly:
      return "Exactly";
    default:
      return "";
  } 
}

const Active: React.FC<SearchBarActiveProps> = ({ close,callback })=>{
  const [name, setName] = useState<any>("");
  const [colors,setColors] = useState<any>([]);
  const [colorInclusivity,setColorInclusivity] = useState<any>(Inclusivity.AnyOf);
  const [types,setTypes] = useState<any>("");
  const [manaValueMin,setManaValueMin] = useState<any>(0);
  const [manaValueMax,setManaValueMax] = useState<any>(100);
  const [keywords,setKeywords] = useState<any>("");
  const [sets,setSets] = useState<any>([]);
  const [formats,setFormats] = useState<any>({});
  const [leaderIn,setLeaderIn] = useState<any>([]);
  
  const leaderInOptions=["perdi","puta","ardeu","idfk"]; //TODO
  const setsOptions=["perdi","puta","ardeu","idfk"]; //TODO
  const formatOptions=["perdi","puta","ardeu","idfk"]; //TODO
  function get_Filter():any{
    let f : Filters={
      types:[],
      keywords:[],
      colors:"",
      sets:[],
      leaderIn:[],
      formats:{}
    };
    if (name!="") f.name=name;
    if (types!="") f.types=types.split("\n");
    if (keywords!="") f.keywords=keywords.split("\n");
    if (colors.length!=0) f.colors=colors.join('');
    if (colors.length!=0) f.colorInclusivity=colorInclusivity;
    if (sets.length!=0) f.sets = sets;
    if (leaderIn.length!=0) f.leaderIn = leaderIn;
    if (manaValueMin!=0) f.manaValueMin = manaValueMin; 
    if (manaValueMax!=100) f.manaValueMax = manaValueMax;
    f.formats=formats;
    return f;
  }
  return(
    <div>
      <Card>
          <CardBody className="overflow-visible p-0">
            <Textarea variant="underlined" label="Name" labelPlacement="outside" placeholder="Enter the Name" value={name} onValueChange={setName}/>
            <Textarea variant="underlined" label="Types (one per line)" labelPlacement="outside" placeholder="Enter the Types" value={types} onValueChange={setTypes}/>
            <Textarea variant="underlined" label="Keywords (one per line)" labelPlacement="outside" placeholder="Enter the Keywords" value={keywords} onValueChange={setKeywords}/>
            <div className='flex justify-start'>
              <Select label="Colors" selectionMode="multiple" placeholder="Select the colors" selectedKeys={colors} onSelectionChange={setColors}  renderValue={(items) => {return <div className='flex justify-start'>{items.map((item) => <h3 className='ml-4' key={item.key}>{CharToSymbol(item.key)}</h3>)}</div>}}>
                {['B','G','R','U','W'].map((key) => (<SelectItem key={key}>{CharToSymbol(key)}</SelectItem>))}
              </Select>
              <Select label="Color Inclusivity" placeholder="Select the color inclusivity" selectedKeys={[colorInclusivity]} onSelectionChange={setColorInclusivity} defaultSelectedKeys={[colorInclusivity]}>
                {[Inclusivity.AnyOf,Inclusivity.AtLeast,Inclusivity.AtMost,Inclusivity.Exactly].map((key) => (<SelectItem key={key}>{Inclusivity2Text(key)}</SelectItem>))}
              </Select>
            </div>
            <Divider className='max-w-fill mb-1 mt-1'/>
            <div className='flex justify-start'>
              <Select label="Sets" selectionMode="multiple" placeholder="Select the sets" selectedKeys={sets} onSelectionChange={setSets} >
                {leaderInOptions.map((key) => (<SelectItem key={key}>{key}</SelectItem>))}
              </Select>
              <Select label="Leader In" selectionMode="multiple" placeholder="Select the leader in" selectedKeys={[leaderIn]} onSelectionChange={setLeaderIn}>
                {setsOptions.map((key) => (<SelectItem key={key}>{key}</SelectItem>))}
              </Select>
            </div>
            <Card>
              <h5>Mana: </h5>
              <div className='flex justify-evenly'>
                <Input type="number" label="Min" placeholder="0.00" labelPlacement="inside" value={manaValueMin} onValueChange={setManaValueMin}/>
                <Input type="number" label="Max" placeholder="0.00" labelPlacement="inside" value={manaValueMax} onValueChange={setManaValueMax}/>
              </div>
            </Card>
            <Card>
              <h5>Formats: </h5>
              {
                Object.entries(formats).map(([key,value], _) => {
                  return(
                  <Card key={key}>
                    <div className='flex justify-start'>
                      <h5>{key}</h5>
                      <Select className='ml-4 max-w-32' label="Legality" placeholder="Select the legality" onSelectionChange={(v)=>{
                        const newFormat = { ...formats};
                        newFormat[key]=v;
                        setFormats(newFormat);
                        }}>
                          <SelectItem key={Legality.Legal}>Legal</SelectItem>
                          <SelectItem key={Legality.Restricted}>Restricted</SelectItem>
                          <SelectItem key={Legality.Banned}>Banned</SelectItem>
                      </Select>
                    </div>
                  </Card>
                  );
                })
              }
              <Select label="Formats" selectionMode="multiple" placeholder="Select the formats" selectedKeys={Object.keys(formats)} onSelectionChange={
                (l:any)=>setFormats(
                  [...l].reduce(function(map, obj) {
                    if (obj in formats){
                      map[obj] = formats[obj];
                    } else{
                      map[obj] = Legality.Legal;
                    }
                    return map;
                  }, {})
                )}>
              {formatOptions.map((key) => (<SelectItem key={key}>{key}</SelectItem>))}
            </Select>
            </Card>
          </CardBody>
          <Button color='warning' isIconOnly onPress={()=>callback(get_Filter())}><IoSearch /></Button>
         <Card isPressable onPress={close}>
            <div className='inline-flex justify-start'>
              <h3>Search</h3>
              <IoArrowUpOutline className='ml-4'/>
            </div>
         </Card>
      </Card>
    </div>
  );
}



const SearchBar: React.FC<SearchBarProps> = ({ callback }) => {
    const [active, setActive] = useState<boolean>(false);
    
    useEffect(() => {
      if (active){

      }
    }, [active]);
    if (active)
      return (
        <div className="mb-4">
          <Divider className='max-w-md'/>
          <Active close={()=>{setActive(false)}} callback={callback}/>
        </div>
      );
  else
    return (
      <div className="mb-4">
        <Divider className='max-w-md'/>
        <Inactive callback={()=>{setActive(true)}}/>
      </div>
    );
};

export default SearchBar;
