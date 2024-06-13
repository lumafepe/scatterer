from flask import Flask,request,make_response,jsonify
from unidecode import unidecode
import requests
import json
import uuid

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
        return v['value'].split('#')[-1]
    
def get_values(v: dict, **keys:dict[str,callable]):
    return {k: t(get_value(v[k])) for k,t in keys.items() if k in v}

def run_query(query):
    result = None
    error = ""
    try:
        response = requests.get(sparql_url, params={"query":query},headers={"Accept":"application/sparql-results+json"})
        if response.status_code // 100 == 2:
            ans = response.json()
            result = { "vars": ans['head']['vars'], "results": ans['results']['bindings'] }
        else:
            error = f"Error response ({response.status_code}: {response.text}) from graphdb"
    except Exception as e:
        error = f"Error requesting data: {e}"
    return (result, error)


@app.route('/cards/<string:uuid>', methods = [ 'GET','OPTIONS' ])
def card(uuid):
    if request.method == 'OPTONIS':
        return _build_cors_preflight_response()

    query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?name ?alternativeDeckLimit ?asciiName (group_concat(distinct ?cic;separator="") as ?colorIdentities) (group_concat(distinct ?lfn) as ?isValidLeaderIn) where {{
        :{uuid} a :Card; :name ?name; :alternative_deck_limit ?alternativeDeckLimit .
        optional {{ :{uuid} :ascii_name ?asciiName }}
        optional {{ :{uuid} :hasColorIdentity ?ci . ?ci :color_code ?cic }}
        optional {{ :{uuid} :isValidLeaderIn ?lf . ?lf :format_name ?lfn }}
    }} group by ?name ?asciiName ?alternativeDeckLimit"""

    printings_query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?code ?name ?date where {{ 
        ${uuid} a :Card; :hasPrinting ?s .
        ?s :set_code ?code; :set_name ?name; :set_date ?date .
    }}"""
    
    
    legalities_query = """"""

    sides_query = """"""
    
    return _corsify_actual_response({})


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
    if request.method == 'OPTONIS':
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

    }} limit {limit} offset {offset}"""

    res, err = run_query(query)
    return _corsify_actual_response([get_values(d, name=str, asciiName=str, scryfallUUID=str) for d in res["results"]])


#TODO: DELETE?
@app.route('/decks/new', methods = ['POST', 'OPTIONS'])
def new_deck():
    if request.method == 'OPTONIS':
        return _build_cors_preflight_response()

    name = request.form.get('name')
    uuid = str(uuid.uuid4())

    query = f"""
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    insert {{
        :{uuid} a :Deck; :deck_name {json.dumps(name)}; :deck_uuid {uuid}.
    }}"""

    _,err = run_query(query)
    return _corsify_actual_response({"uuid": uuid, "name": name, "card_number": 0})

@app.route('/decks/<string:uuid>', methods = ['GET', 'PATCH', 'OPTIONS'])
def deck(uuid):
    if request.method == 'OPTONIS':
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
        
        res,err = run_query(query)
        return _corsify_actual_response(
            [get_values(dc, name=str, asciiName=str, scryfallUUID=str, quantity=str) for dc in res["results"]]
        )
    elif request.method == 'PATCH':
        cardUUID = request.form.get('card')
        quantity = request.form.get('quantity')

        if quantity <= 0:
            update = f"""
            PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
            delete where {{
                :{uuid} :hasDeckCard ?dc.
                ?dc a :DeckCard; :ofCard :{cardUUID}; :deckcard_quantity ?q.
            }}"""
        else:
            update = f"""
            PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
            delete {{
                ?dc :deckcard_quantity ?q.
            }} insert {{
                :{uuid} :hasDeckCard ?dc.
                ?dc a :DeckCard; :ofCard :{cardUUID}; :deckcard_quantity {quantity}.
            }} where {{ 
                OPTIONAL {{
                    :{uuid} :hasDeckCard ?aux.
                    ?aux a :DeckCard; :ofCard :{cardUUID}; :deckcard_quantity ?q.
                }}
                BIND(COALESCE(?aux, BNODE()) AS ?dc)
            }}"""

        _,err = run_query(update)

@app.route('/decks', methods = [ 'GET', 'OPTIONS' ])
def decks():
    if request.method == 'OPTONIS':
        return _build_cors_preflight_response()

    query = """
    PREFIX : <http://rpcw.di.uminho.pt/2024/scatterer/>
    select ?uuid ?name (sum (?number) as ?card_number) where {
        ?d a :Deck; :deck_uuid ?uuid; :deck_name ?name; :hasDeckCard ?dc .
        ?dc :deckcard_quantity ?number .
    } group by ?uuid ?name"""

    res,err = run_query(query)
    return _corsify_actual_response(
        [get_values(d, uuid=str, name=str, card_number=int) for d in res["results"]]
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
