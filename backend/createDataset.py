from rdflib import Graph, URIRef, Literal, Namespace
from rdflib.namespace import RDF, XSD
import urllib.request
import tempfile
import ijson
import gzip
import os

#CONSTANTS
scatterer = Namespace("http://rpcw.di.uminho.pt/2024/scatterer/")
badCards = ["Darksteel Ingot", "Gonti, Lord of Luxury"]
validTypes = set(["Artifact", "Battle", "Conspiracy", "Creature", "Dungeon", 
                  "Enchantment", "Hero", "Instant", "Kindred", "Land", "Phenomenon",
                  "Plane", "Planeswalker", "Scheme", "Sorcery", "Vanguard"])
mainSets = set([])

#FILTERS
def isValid(side):
    replace(side["types"], "Tribal", "Kindred")

    return "isFunny" not in side \
        and ("firstPrinting" not in side or side["firstPrinting"] != "TBTH") \
        and (side["name"] not in badCards or "firstPrinting" in side) \
        and set(side["types"]).issubset(validTypes)
        #and (side["display"] != "reversible_card")

def mainSet(s):
    return s['type'] in mainSets

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

def maybeAdd(g, subject, predicate, maybeObject):
    if maybeObject != None:
        g.add((subject, predicate, Literal(maybeObject)))

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
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
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

    return open(cache_path, 'rb')

def build_graph(atomicCards, setList):
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
        card = uri(side0['identifiers']['scryfallOracleId'])
        g.add((card, RDF.type, scatterer.Card))
        
        g.add((card, scatterer.alternative_deck_limit, Literal(side0.get('hasAlternativeDeckLimit', False))))
        maybeAdd(g, card, scatterer.ascii_name, side0.get('asciiName'))
        g.add((card, scatterer.scryfall_uuid, Literal(side0['identifiers']['scryfallOracleId'])))
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
            maybeAdd(g, side, scatterer.face_mana_value, s.get('faceManaValue'))
            maybeAdd(g, side, scatterer.face_name, s.get('faceName'))
            maybeAdd(g, side, scatterer.hand, s.get('hand'))
            maybeAdd(g, side, scatterer.life, s.get('life'))
            maybeAdd(g, side, scatterer.loyalty, s.get('loyalty'))
            g.add((side, scatterer.mana_value, Literal(s['manaValue'])))
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

    return g


def main():
    print('Downloading cards dataset...')
    atomicCards = download_file('https://mtgjson.com/api/v5/AtomicCards.json.gz', 'data/atomicCards.json', True)

    print('Downloading sets dataset...')
    setList = download_file('https://mtgjson.com/api/v5/SetList.json', 'data/sets.json')

    print('Parsing datasets...')
    g = build_graph(atomicCards, setList)

    atomicCards.close()
    setList.close()

    print("Finished parsing.", len(g), "triplets generated")
    print("Writing to file...")

    g.serialize("data/dataset.ttl")


if __name__ == "__main__":
    main()