from flask import Flask,request,make_response,jsonify
from unidecode import unidecode
import requests
import json
from uuid import uuid4

app = Flask(__name__)
sparql_url = "http://localhost:7200/repositories/scatterer"



def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def _corsify_actual_response(response):
    aux = jsonify(response)
    aux.headers.add("Access-Control-Allow-Origin", "*")
    return aux


def get_value(v: dict):
    if v['type'] == 'literal':
        return v['value']
    elif v['type'] == 'uri':
        return v['value'].split('/')[-1]
    
def get_values(v: dict, **keys:dict[str,callable]):
    return {k: t(get_value(v[k])) for k,t in keys.items() if k in v}

def to_bool(b: str) -> bool:
    return b == 'true'

def to_list(sep: str) -> callable:
    return lambda s: [] if s == "" else s.split(sep)

def with_sign(n: int) -> str:
    return str(n) if n < 0 else f"+{n}"

def select_query(query):
    result = None
    error = None
    try:
        response = requests.get(sparql_url, params={"query":query},headers={"Accept":"application/sparql-results+json"})
        if response.ok:
            ans = response.json()
            result = { "vars": ans['head']['vars'], "results": ans['results']['bindings'] }
        else:
            error = f"Error response ({response.status_code}: {response.text}) from graphdb"
    except Exception as e:
        error = f"Error requesting data: {e}"
    return (result, error)

def update_query(query):
    error = None
    try:
        response = requests.post(f"{sparql_url}/statements", params={"update":query},headers={"Accept":"application/sparql-results+json"})
        if not response.ok:
            error = f"Error response ({response.status_code}: {response.text}) from graphdb"
    except Exception as e:
        error = f"Error requesting data: {e}"
    return error


@app.route('/sets', methods = [ 'GET', 'OPTIONS' ])
def sets():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()

    printings_query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?code ?name ?date where {{ 
        ?s a :Set; :set_code ?code; :set_name ?name; :set_date ?date .
    }}"""

    res,err = select_query(printings_query)
    return _corsify_actual_response([get_values(s, code=str, name=str, date=str) for s in res['results']])


@app.route('/cards/<string:uuid>', methods = [ 'GET', 'OPTIONS' ])
def card(uuid):
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()

    query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?name ?scryfallUUID ?alternativeDeckLimit ?asciiName (group_concat(distinct ?cic;separator="") as ?colorIdentities) (group_concat(distinct ?lfn) as ?isValidLeaderIn) where {{
        :{uuid} a :Card; :name ?name; :scryfall_uuid ?scryfallUUID; :alternative_deck_limit ?alternativeDeckLimit .
        optional {{ :{uuid} :ascii_name ?asciiName }}
        optional {{ :{uuid} :hasColorIdentity ?ci . ?ci :color_code ?cic }}
        optional {{ :{uuid} :isValidLeaderIn ?lf . ?lf :format_name ?lfn }}
    }} group by ?name ?scryfallUUID ?asciiName ?alternativeDeckLimit"""

    res,err = select_query(query)
    card = get_values(res["results"][0], name=str, scryfallUUID=str, alternative_deck_limit=to_bool, asciiName=str, colorIdentities=list, isValidLeaderIn=to_list(" "))

    printings_query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?code ?name ?date where {{ 
        :{uuid} a :Card; :hasPrinting ?s .
        ?s :set_code ?code; :set_name ?name; :set_date ?date .
    }}"""

    res,err = select_query(printings_query)
    card['printings'] = [get_values(p, code=str, name=str, date=str) for p in res['results']]
    
    legalities_query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?format ?legality where {{
        :{uuid} a :Card; (:isLegalIn|:isRestrictedIn|:isBannedIn) ?f.
        ?f :format_name ?format.
        
        optional {{ :{uuid} :isLegalIn      ?f. bind("Legal"      as ?legality) }}.
        optional {{ :{uuid} :isRestrictedIn ?f. bind("Restricted" as ?legality) }}.
        optional {{ :{uuid} :isBannedIn     ?f. bind("Banned"     as ?legality) }}
    }}"""

    res,err = select_query(legalities_query)
    card['legalities'] = {get_value(l['format']): get_value(l['legality']) for l in res['results']}

    rulings_query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?text ?date where {{ 
        :{uuid} a :Card; :hasRuling ?r.
        ?r :ruling_text ?text; :ruling_date ?date.
    }}"""

    res,err = select_query(rulings_query)
    card['rulings'] = [get_values(r, text=str, date=str) for r in res['results']]

    sides_query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?s ?manaValue ?text ?faceManaValue ?faceName ?defense ?hand ?life ?loyalty ?power ?toughness (group_concat(?color;separator="") as ?colors) (group_concat(?colorIndicator;separator="") as ?colorIndicators) (group_concat(?subtype) as ?subtypes) (group_concat(?type) as ?types) (group_concat(?supertype) as ?supertypes) where {{
        :{uuid} :hasSide ?s.
        ?s :mana_value ?manaValue.
        ?s :text ?text.
        optional {{ ?s :face_mana_value ?faceManaValue }}
        optional {{ ?s :face_name ?faceName }}
        optional {{ ?s :defense ?defense }}
        optional {{ ?s :hand ?hand }}
        optional {{ ?s :life ?life }}
        optional {{ ?s :loyalty ?loyalty }}
        optional {{ ?s :power ?power }}
        optional {{ ?s :toughness ?toughness }}
        optional {{ ?s (:hasColor/:color_code) ?color }}
        optional {{ ?s (:hasColorIndicator/:color_code) ?colorIndicator }}
        optional {{ ?s (a/:type_name) ?type }}
        optional {{ ?s (:hasSubtype/:subtype_name) ?subtype }}
        optional {{ ?s (:hasSupertype/:supertype_name) ?supertype }}
    }} group by ?s ?manaValue ?text ?faceManaValue ?faceName ?defense ?hand ?life ?loyalty ?power ?toughness"""

    card['sides'] = []
    res,err = select_query(sides_query)
    sides = [get_values(s, s=str, manaValue=int, text=str, faceManaValue=int, faceName=str, defense=str, hand=str, life=str, loyalty=str, power=str, toughness=str, colors=list, colorIndicators=list, subtypes=to_list(' '), types=to_list(' '), supertypes=to_list(' ')) for s in res['results']]

    for s in sides:
        keywords_query = f"""
        PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
        select ?keyword where {{ 
            :{s['s']} (:hasKeyword/:keyword_name) ?keyword
        }}"""

        res,err = select_query(keywords_query)
        s['keywords'] = [get_value(k['keyword']) for k in res['results']]
        del s['s']
        card['sides'].append(s)

    return _corsify_actual_response(card)


newline = '\n'
inclusivities = ['AnyOf', 'AtLeast', 'AtMost', 'Exactly']
def read_inclusivity(i):
    i if i in inclusivities else None

card_types = ['Artifact', 'Battle', 'Conspiracy', 'Creature', 'Dungeon',
              'Enchantment', 'Hero', 'Instant', 'Kindred', 'Land', 'Phenomenon',
              'Plane', 'Planeswalker', 'Scheme', 'Sorcery', 'Vanguard']
def get_card_type(t):
    for ct in card_types:
        if ct.lower() == t:
            return ct
        
def splitArgs(s):
    if s == None or s == '':
        return []
    return s.split(' ')

@app.route('/cards', methods = [ 'GET', 'OPTIONS' ])
def cards():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()

    page = int(request.args.get('page', 1))
    limit = 30
    offset = (page - 1) * limit

    name = request.args.get('name') #TODO: separate words? remove symbols? something else??

    colors = ''.join(c for c in request.args.get('colors', '') if c in "BGRUW")
    #colorInclusivity = read_inclusivity(request.args.get('colorInclusivity'))
    #TODO

    types = [unidecode(t.lower()) for t in splitArgs(request.args.get('types'))]

    sets = splitArgs(request.args.get('sets'))

    manaValueMin = request.args.get('manaValueMin')
    manaValueMax = request.args.get('manaValueMax')
    keywords = [unidecode(k.lower()) for k in splitArgs(request.args.get('keywords'))]

    legalIn = splitArgs(request.args.get('legalIn'))
    restrictedIn = splitArgs(request.args.get('restrictedIn'))
    bannedIn = splitArgs(request.args.get('bannedIn'))
    leaderIn = splitArgs(request.args.get('leaderIn'))


    query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?name ?asciiName ?scryfallUUID {{
        ?c a :Card; :name ?name; :scryfall_uuid ?scryfallUUID.
        optional {{ ?c :ascii_name ?asciiName }}

        { f'''
            bind(lcase(coalesce(?asciiName, ?name)) as ?ascii)
            filter(contains(?ascii, {json.dumps(unidecode(name.lower()))}))
          ''' if name != None else ""  
        }

        { newline.join(f'?c (:hasPrinting/:set_code) "{s}".' for s in sets) }

        { f'?c :isLegalIn        {", ".join(f":{f}" for f in legalIn)     }.' if legalIn      != [] else '' }
        { f'?c :isRestrictedIn   {", ".join(f":{f}" for f in restrictedIn)}.' if restrictedIn != [] else '' }
        { f'?c :isBannedIn       {", ".join(f":{f}" for f in bannedIn)    }.' if bannedIn     != [] else '' }
        { f'?c :isValidLeaderIn  {", ".join(f":{f}" for f in leaderIn)    }.' if leaderIn     != [] else '' }
        { f'?c :hasColorIdentity {", ".join(f":{c}" for c in colors)      }.' if colors       != '' else '' }

        filter exists {{
            ?c :hasSide ?s.
            ?s a :Side; :mana_value ?m.

            { newline.join(f'?s a :{get_card_type(t)}.' for t in types if get_card_type(t) != None) }

            { newline.join(f'''
                filter exists {{
                    ?s ((:hasSubtype/:subtype_name)|(:hasSupertype/:supertype_name)) ?t.
                    filter(lcase(?t) = {json.dumps(t)})
                }}''' for t in types if get_card_type(t) == None)
            }
            
            { f'filter(?m >= {manaValueMin})' if manaValueMin != None else '' }
            { f'filter(?m <= {manaValueMax})' if manaValueMax != None else '' }
            { newline.join(f'''
                filter exists {{
                    ?s (:hasKeyword/:keyword_name) ?k.
                    filter(lcase(?k) = {json.dumps(k)})
                }}''' for k in keywords)
            }
        }}
    }} limit {limit} offset {offset}"""

    res, err = select_query(query)
    return _corsify_actual_response([get_values(d, name=str, asciiName=str, scryfallUUID=str) for d in res["results"]])


#TODO: DELETE?
@app.route('/decks/new', methods = ['POST', 'OPTIONS'])
def new_deck():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()

    name = request.json.get('name')
    uuid = str(uuid4())

    query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    insert {{
        :{uuid} a :Deck; :deck_name {json.dumps(name)}; :deck_uuid "{uuid}".
    }} where {{}}"""

    err = update_query(query)
    print(err)
    return _corsify_actual_response({"uuid": uuid, "name": name, "card_number": 0})


@app.route('/decks/<string:uuid>', methods = ['GET', 'PUT', 'OPTIONS'])
def deck(uuid):
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    elif request.method == 'GET':
        query = f"""
        PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
        select ?name ?asciiName ?scryfallUUID ?quantity where {{
            :{uuid} a :Deck; :hasDeckCard ?dc .
            ?dc :deckcard_quantity ?quantity; :ofCard ?c .
            ?c :name ?name; :scryfall_uuid ?scryfallUUID .
            optional {{ ?c :ascii_name ?asciiName }}
        }}"""
        
        res,err = select_query(query)
        return _corsify_actual_response(
            [get_values(dc, name=str, asciiName=str, scryfallUUID=str, quantity=str) for dc in res["results"]]
        )
    elif request.method == 'PUT':
        cardUUID = request.json.get('card')
        increment = request.json.get('increment')
        quantity = request.json.get('quantity')

        qbind = quantity if quantity != None else f"coalesce(?old_q, 0){with_sign(increment)}"
        update = f"""
        PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        delete {{
            ?d :hasDeckCard ?old_dc.
            ?old_dc a :DeckCard; :ofCard ?c; :deckcard_quantity ?old_q.
        }} insert {{
            ?d :hasDeckCard ?dc.
            ?dc a :DeckCard; :ofCard ?c; :deckcard_quantity ?quantity.
        }} where {{
            bind(:{cardUUID} as ?c)
            bind(:{uuid} as ?d)
        
            optional {{
                ?d :hasDeckCard ?old_dc.
                ?old_dc a :DeckCard; :ofCard ?c; :deckcard_quantity ?old_q.
            }}
            
            optional {{
                ?c :alternative_deck_limit "false"^^xsd:boolean.
                filter not exists {{
                    ?c :hasSide ?s.
                    ?s a :Land; :hasSupertype :Basic.
                }}
                bind(4 as ?limit)
            }}
            
            bind({qbind} as ?q)
            bind(if(?q > 0,coalesce(?old_dc, bnode()),1+"") as ?dc)
            bind(if(bound(?limit) && ?limit < ?q,?limit,?q) as ?quantity)
        }}"""

        err = update_query(update)
        
        return _corsify_actual_response({})

@app.route('/decks', methods = [ 'GET', 'OPTIONS' ])
def decks():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()

    query = """
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?uuid ?name (sum (?number) as ?card_number) where {
        ?d a :Deck; :deck_uuid ?uuid; :deck_name ?name.
        optional { ?d (:hasDeckCard/:deckcard_quantity) ?number }
    } group by ?uuid ?name"""

    res,err = select_query(query)
    return _corsify_actual_response(
        [get_values(d, uuid=str, name=str, card_number=int) for d in res["results"]]
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
