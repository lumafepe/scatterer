## Grupo
| Número | Nome             |
| -------- | ------- |
| PG54009  | Luís Pereira  |
| PG54257  | Tiago Pereira   |

# Scatterer

Através da realização deste projeto foi criada a plataforma **Scatterer** com o intuído de auxiliar qualquer tipo de pessoa ou organização a procurar ou guardar em decks cartas de Magic the gathering.

Ao longo do projeto, foram utilizadas diferentes *stacks* de tecnologias. De um modo geral, o *backend* foi desenvolvido em Python (Flask), devido à facilidade de processamento, parsing e manipulação de dados. E no *frontend* Typescript (NextUI + NextJS) devido à sua grande abstração de tarefas que noutras ***frameworks*** seriam, no mínimo, cansativas.

Relativamente a base de dados, foi escolhido o GraphDB pela sua capacidade de guardar relações como triplos de dados, uma vantagem principalmente quando nem todas as cartas têm o mesmo tipo de dados. Devido aos limites de velocidade impostos por serviços de ***hosting,*** a bases de dados é alojada localmente em um **docker container** (assim como todo o projeto).

No presente relatório, são explicadas as ferramentas e tecnologias usadas, a arquitetura implementada, o tratamento de dados feito, a implementação de bases de dados e ainda a interface da aplicação.

## Pré-requisitos e Manual de Utilização

A plataforma depende de vários serviços, pelo que é necessário ter instaladas as aplicações :

- Docker
- Docker-Compose

Para iniciar a aplicação temos de executar:

```
git clone <https://github.com/lumafepe/rpcw-proj>
cd rpcw-proj
docker-compose up --build
Se for a primeira vez:
docker exec -it rpcw-proj-backend-1 python createDataset.py 
```

Após isto, temos garantidamente a API de dados a ser executada em [localhost:8000](http://localhost:8000/) e a interface em [localhost:3000](http://localhost:3000), ambas prontas a ser utilizadas.

Relativamente à base de dado, esta pode ser acedida através `localhost:7200`.

### Configuração

O **Scatterer** dispõe de varias opções de configuração. As principais configurações incluem:

- `docker-compose.yml`: Define os serviços, redes, volumes de dados dos containers Docker.
- `.env`: Guarda variáveis de ambiente usadas dentro do servidor de frontend para o endereço do backend

## Funcionalidades Implementadas

### Cartas

- Listar todas as cartas
- Pesquisa avançada por vários campos das cartas.
- Possibilidade de guardar cartas em decks
- Ver informação completa de uma carta
### Decks

- Listar todos os decks
- Ver as cartas de um deck
- Criar novos decks
### Interface

- Interface reativa, intuitiva e minimalista.

# Arquitetura da Aplicação

A aplicação está divida em três partes distintas.

1. ***Frontend (Interface)***
Desenvolvido em [Nextjs](https://nextjs.org/), comunica diretamente com o *backend* para gestão de dados. É responsável por mostrar ao utilizador os dados das cartas, e a possibilidade de gestão das mesmas.
2. ***Backend***
Desenvolvido em Flask, providencia uma **Restfull** API com a qual o *frontend* comunica. Para além disso comunica com a base de dados para implementar a lógica da aplicação.
3. **Base de dados (GraphDB)**
Desenvolvida em GraphDB, contém todos os dados do sistema, incluindo cartas e decks.

![image](https://github.com/lumafepe/rpcw-proj/blob/main/arq.svg)

# Desenvolvimento do ***Backend***

### Processamento dos **datasets**

O dataset escolhido ([https://mtgjson.com/](https://mtgjson.com/)) tinha bastante informação redundante devido ao formato de armazenamento dos dados, bem como informação indesejada (cartas experimentais/inválidas em jogo) ou mal formatada (principalmente de cartas antigas que não foram atualizadas com o passar dos anos). Foi feito um grande esforço, envolvendo bastante pesquisa e investigaçlão dos termos do domínio, para filtrar, referenciar, combinar e formatar corretamente estes dados, e criar uma ontologia que acomodasse as cartas resultantes. O resultado foi uma ontologia base e um script python que recolhe os dados do site e popula a ontologia.

### *Seeding* da base de dados

Tendo já uma ontologia, o *seeding* é feito usando a REST API do GraphDB. Foram adicionados ao script de criação três pedidos ao GraphDB: primeiramente apagar o repositório com o nome *scatterer*, caso ele já exista; seguidamente criar um repositório chamado *scatterer*; e por fim popular este repositório com os dados gerados pelo script, como descrito anteriormente. O resultado foi um único script que faz todo este processo:


```
python3 createDataset.py
```

### *Backend*

A backend, desenvolvida em flask, serve como intermediário entre o GraphDB e a frontend. Consiste em 7 endpoints, que executam queries ao GraphDB e retornam a resposta. Os endpoints são:

- Listar todos os sets de cartas
- Listar cartas, opcionalmente indicando filtros
- Obter os detalhes de uma carta
- Criar um novo deck
- Listar todos os decks
- Obter todas as cartas de um deck
- Modificar a quantidade de uma carta num deck

Todos são facilmente implementáveis usando queries SPARQL de *select*, *insert* e *delete* relativamente simples.

# Desenvolvimento do **Frontend**

### **Frontend**

Para a realização do **frontend** foi utilizado `TypeScript` juntamente com as ***frameworks*** `NextJS` e `NextUI`, visto parte do grupo já possuia experiência com estas frameworks. Enquanto que `NextJS` trata de routing e renderização de pedidos `NextUI` disponibiliza 

Como já referido previamente, podemos testar a interface em http://localhost:3000/ que nos leva à página principal da nossa aplicação onde podemos executar qualquer pesquisa ou consultar as cartas. 

Da página inicial temos acesso também aos *********decks********* (http://localhost:3000/decks) que nos listar todos os decks existentes com o seu nome e o número de cartas existentes. Para além disso, é tambem possivel criar novos decks apartir desta página.

Também podemos consultar uma carta (http://localhost:3000/card/{id}) onde podemos observar todo o conteúdo da carta, assim como adiciona-la a um *deck*.

Para consultar as cartas pertencentes a um *Deck* basta aceder a (http://localhost:3000/decks/{id}).



No fundo estas quatro rotas mencionadas permitem realizar todas as operações da aplicação.
