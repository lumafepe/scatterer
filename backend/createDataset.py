from rdflib import Graph, URIRef, Literal, Namespace
from rdflib.namespace import RDF, XSD
import urllib.request
import requests
import tempfile
import requests
import ijson
import gzip
import os
import json

#CONSTANTS
graphdb_url = 'http://localhost:7200'

scatterer = Namespace("http://rpcw.di.uminho.pt/2024/scatterer/")
badCards = ["Darksteel Ingot", "Gonti, Lord of Luxury"]
validTypes = set(["Artifact", "Battle", "Conspiracy", "Creature", "Dungeon", 
                  "Enchantment", "Hero", "Instant", "Kindred", "Land", "Phenomenon",
                  "Plane", "Planeswalker", "Scheme", "Sorcery", "Vanguard"])

#FILTERS
def isValid(side):
    replace(side["types"], "Tribal", "Kindred")

    return "isFunny" not in side \
        and ("firstPrinting" not in side or side["firstPrinting"] != "TBTH") \
        and (side["name"] not in badCards or "firstPrinting" in side) \
        and set(side["types"]).issubset(validTypes) \
        and (side["layout"] != "reversible_card")

#UTILS
def uri(name):
    return URIRef(f"{scatterer}{name.replace(' ', '_')}")

def date(d):
    return Literal(f"{d}T00:00Z", datatype=XSD.dateTime)

def removeEmpty(items):
    return filter(lambda kv: kv[1] != [],items)

def replace(list, elem, other):
    for i, e in enumerate(list):
        if e == elem:
            list[i] = other

def maybeAdd(g, subject, predicate, maybeObject, trans=None):
    if maybeObject != None:
        obj = maybeObject if trans == None else trans(maybeObject)
        g.add((subject, predicate, Literal(obj)))

class URICounter:
    def __init__(self, prefix, onInit):
        self.prefix = prefix
        self.uris = {}
        self.counter = 0
        self.onInit = onInit

    def get_uri(self, obj):
        if obj not in self.uris:
            self.counter += 1
            self.uris[obj] = uri(f"{self.prefix}{self.counter}")
            self.onInit(obj, self.uris[obj])
        return self.uris[obj]


def download_file(url, cache_path, decompress=False):
    if not os.path.isfile(cache_path):
        req = urllib.request.Request(url() if callable(url) else url, headers={'User-Agent': 'Mozilla/5.0'})
        f = urllib.request.urlopen(req)

        if decompress:
            tmp = tempfile.NamedTemporaryFile()
            with open(tmp.name, 'wb') as aux:
                aux.write(f.read())
            f.close()
            f = gzip.open(tmp.name, 'rb')

        with open(cache_path, 'wb') as cache:
            cache.write(f.read())

        f.close()
        print("done\n")
    else:
        print("using cached file\n")

    return open(cache_path, 'rb')

def get_uuidConversions():
    def url():
        for file in requests.get('https://api.scryfall.com/bulk-data').json()['data']:
            if file['type']=='oracle_cards':
                return file['download_uri']

    uuids = download_file(url,'data/uuids.json',decompress=False)
    data = {x['oracle_id']:x['id'] for x in json.load(uuids)}
    uuids.close()
    return data


def build_graph(atomicCards, setList, uuids):
    g = Graph()
    g.parse('scatterer.ttl')


    sets = set()

    def rulings_init(r, ref):
        g.add((ref, RDF.type, scatterer.Ruling))
        g.add((ref, scatterer.ruling_date, date(r[0])))
        g.add((ref, scatterer.ruling_text, Literal(r[1])))
    rulings = URICounter('r', rulings_init)

    def keywords_init(k, ref):
        g.add((ref, RDF.type, scatterer.Keyword))
        g.add((ref, scatterer.keyword_name, Literal(k)))
    keywords = URICounter('k', keywords_init)

    def subtypes_init(t, ref):
        g.add((ref, RDF.type, scatterer.Subtype))
        g.add((ref, scatterer.subtype_name, Literal(t)))
    subtypes = URICounter('t', subtypes_init)

    side_counter = 0

    data = ((k,v) for k,v in ijson.kvitems(atomicCards, 'data') if all(map(isValid,v)))

    for name,sides in data:
        side0 = sides[0]
        #card = uri(side0.get('asciiName', name))
        uuid = uuids[side0['identifiers']['scryfallOracleId']]
        card = uri(uuid)
        g.add((card, RDF.type, scatterer.Card))
        
        g.add((card, scatterer.alternative_deck_limit, Literal(side0.get('hasAlternativeDeckLimit', False))))
        maybeAdd(g, card, scatterer.ascii_name, side0.get('asciiName'))
        g.add((card, scatterer.scryfall_uuid, Literal(uuid)))
        g.add((card, scatterer.name, Literal(name)))
        for c in side0['colorIdentity']:
            g.add((card, scatterer.hasColorIdentity, uri(c)))
        for p in side0.get('printings',[]):    #TODO: dungeons may have no printings. add anyways??
            sets.add(p)
            g.add((card, scatterer.hasPrinting, uri(p)))

        for r in side0.get('rulings',[]):
            ruling = (r['date'], r['text'])
            g.add((card, scatterer.hasRuling, rulings.get_uri(ruling)))

        for f, l in side0['legalities'].items():
            if l == "Legal":
                g.add((card, scatterer.isLegalIn, uri(f)))
            elif l == "Restricted":
                g.add((card, scatterer.isRestrictedIn, uri(f)))
            else: #l == "Banned":
                g.add((card, scatterer.isBannedIn, uri(f)))
        for f, b in side0.get('leadershipSkills',{}).items():
            if b:
                g.add((card, scatterer.isValidLeaderIn, uri(f)))

        for s in sides:
            #side = uri(f"{s.get('asciiName', name)}_{s.get('side','a')}")
            side_counter += 1
            side = uri(f"s{side_counter}")

            g.add((card, scatterer.hasSide, side))

            for t in s['types']:
                g.add((side, RDF.type, uri(t)))

            maybeAdd(g, side, scatterer.defense, s.get('defense'))
            maybeAdd(g, side, scatterer.face_mana_value, s.get('faceManaValue'), int)
            maybeAdd(g, side, scatterer.face_name, s.get('faceName'))
            maybeAdd(g, side, scatterer.hand, s.get('hand'))
            maybeAdd(g, side, scatterer.life, s.get('life'))
            maybeAdd(g, side, scatterer.loyalty, s.get('loyalty'))
            g.add((side, scatterer.mana_value, Literal(int(s['manaValue']))))
            maybeAdd(g, side, scatterer.power, s.get('power'))
            g.add((side, scatterer.side, Literal(s.get('side', 'a'))))
            g.add((side, scatterer.text, Literal(s.get('text', ''))))
            maybeAdd(g, side, scatterer.toughness, s.get('toughness'))
            
            for c in s['colors']:
                g.add((side, scatterer.hasColor, uri(c)))

            for c in s.get('colorIndicator', []):
                g.add((side, scatterer.hasColorIndicator, uri(c)))

            for kw in s.get('keywords', []):
                g.add((side, scatterer.hasKeyword, keywords.get_uri(kw)))

            for st in s['subtypes']:
                g.add((side, scatterer.hasSubtype, subtypes.get_uri(st)))

            for st in s['supertypes']:
                g.add((side, scatterer.hasSupertype, uri(st)))


    data = ijson.items(setList, 'data.item')

    for s in data:
        if s['code'] in sets:
            ref = uri(s['code'])
            g.add((ref, RDF.type, scatterer.Set))
            g.add((ref, scatterer.set_code, Literal(s['code'])))
            g.add((ref, scatterer.set_name, Literal(s['name'])))
            g.add((ref, scatterer.set_date, date(s['releaseDate'])))


    #TODO: remove in prod. for testing purposes only
    uuid = "c1d3a99e-4c75-4fac-ba17-633716d98d88"
    ref = uri(uuid)
    g.add((ref, RDF.type, scatterer.Deck))
    g.add((ref, scatterer.deck_uuid, Literal(uuid)))
    g.add((ref, scatterer.deck_name, Literal("Deck Fixe")))
    g.add((ref, scatterer.hasDeckCard, uri("dc1")))
    g.add((uri("dc1"), RDF.type, scatterer.DeckCard))
    g.add((uri("dc1"), scatterer.deckcard_quantity, Literal(4)))
    g.add((uri("dc1"), scatterer.ofCard, uri("0001e77a-7fff-49d2-a55c-42f6fdf6db08")))
    g.add((ref, scatterer.hasDeckCard, uri("dc2")))
    g.add((uri("dc2"), RDF.type, scatterer.DeckCard))
    g.add((uri("dc2"), scatterer.deckcard_quantity, Literal(3)))
    g.add((uri("dc2"), scatterer.ofCard, uri("0007efdf-417d-48a7-b119-3a2fda3e1158")))

    uuid = "adb8e0ee-a2aa-4cbb-8fe4-bfa46cd41fdf"
    ref = uri(uuid)
    g.add((ref, RDF.type, scatterer.Deck))
    g.add((ref, scatterer.deck_uuid, Literal(uuid)))
    g.add((ref, scatterer.deck_name, Literal("Deck Muito Fixe")))
    g.add((ref, scatterer.hasDeckCard, uri("dc3")))
    g.add((uri("dc3"), RDF.type, scatterer.DeckCard))
    g.add((uri("dc3"), scatterer.deckcard_quantity, Literal(3)))
    g.add((uri("dc3"), scatterer.ofCard, uri("0001e77a-7fff-49d2-a55c-42f6fdf6db08")))
    g.add((ref, scatterer.hasDeckCard, uri("dc4")))
    g.add((uri("dc4"), RDF.type, scatterer.DeckCard))
    g.add((uri("dc4"), scatterer.deckcard_quantity, Literal(4)))
    g.add((uri("dc4"), scatterer.ofCard, uri("00101358-0e89-4bd1-b1f2-e889645b616e")))
    g.add((ref, scatterer.hasDeckCard, uri("dc5")))
    g.add((uri("dc5"), RDF.type, scatterer.DeckCard))
    g.add((uri("dc5"), scatterer.deckcard_quantity, Literal(3)))
    g.add((uri("dc5"), scatterer.ofCard, uri("0014def3-4063-4929-ac51-76aef1bb2a68")))
    
    return g


def main():
    if not os.path.isfile("data/dataset.ttl"):
        print('Downloading cards dataset...')
        atomicCards = download_file('https://mtgjson.com/api/v5/AtomicCards.json.gz', 'data/atomicCards.json', True)

        print('Downloading sets dataset...')
        setList = download_file('https://mtgjson.com/api/v5/SetList.json', 'data/sets.json')

        print('Downloading uuids dataset...')
        uuids = get_uuidConversions()

        print('Generating scatterer dataset...')
        g = build_graph(atomicCards, setList, uuids)

        atomicCards.close()
        setList.close()

        print(len(g), "triplets generated\n")
        print("Writing to file...")

        g.serialize("data/dataset.ttl")
        print("done\n")

    print("Creating repository...")
    
    #Delete repo if already exists
    url = f"{graphdb_url}/rest/repositories/scatterer"
    headers = {'Accept': '*/*'}
    response = requests.delete(url, headers=headers)

    if not response.ok:
        print(response.json()['message'])
        exit(1)

    #Create repo
    with open('scatterer-config.ttl','rb') as config:
        url = f"{graphdb_url}/rest/repositories"
        headers = {'Accept': 'application/json'}
        files = {'config': config}
        response = requests.post(url, headers=headers, files=files)
    
    if not response.ok:
        print(response.json()['message'])
        exit(1)

    print("done\n")
    print("Inserting data from dataset...")

    with open('data/dataset.ttl','rb') as data:
        url = f"{graphdb_url}/repositories/scatterer/statements"
        headers = {'Accept': 'application/json','Content-Type': 'application/x-turtle'}
        response = requests.put(url, headers=headers, data=data.read())

    if not response.ok:
        print(response.json()['message'])
        exit(1)

    print('done')

if __name__ == "__main__":
    main()
