## Grupo
| Número | Nome             |
| -------- | ------- |
| PG54009  | Luís Pereira  |
| PG54257  | Tiago Pereira   |

# Scatterer

Através da realização deste projeto foi criada a plataforma **Scatterer** com o intuído de auxiliar qualquer tipo de pessoa ou organização a procurar ou guardar em decks cartas de Magic the gathering.

Ao longo do projeto, foram utilizadas diferentes *stacks* de tecnologias. De um modo geral, o *backend* foi desenvolvido em Python (Flask), devivo à facilidade de processamento, parsing e manipulação de dados. E no *frontend* Typescript (NextUI + NextJS) devido à sua grande abstração de tarefas que noutras ***frameworks*** seriam, no mínimo, cansativas.

Relativamente a base de dados, foi escolhido o GraphDB pelo sua capacidade de guardar relações como triplos de dados, uma vantagem principalmente quando nem todas as cartas têm o mesmo tipo de dados. Devido aos limites de velocidade impostos por serviços de ***hosting,*** a bases de dados é alojada localmente em um **docker container** (assim como todo o projeto).

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
- `.env`: Guarda variáveis de ambiente usadas dentro do servidor de frontend para o enderesso do backend

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
3. ***Base de Dados Não Relacional (MongoDB)***
Desenvolvida em MongoDB, é utilizada para guardar dados sobre os quais não se tem a certeza quais os seus campos nem o tamanho/tipo dos seus valores. Neste caso foi usado para guardar os dados das várias versões de um acórdão.
4. **Base de dados (GraphDB)**
TODO

![image](https://github.com/lumafepe/rpcw-proj/arq.svg)

# Desenvolvimento do ***Backend***

### Normalização dos **datasets**

TODO

Dado que eram fornecidos 14 *datasets* diferentes, com o objetivo de reduzir o número de chaves foi feita uma normalização deste *datasets*. Visto que havia vários descritores com o mesmo significado ou um descritor com a informação de vários estes foram também normalizados.

Para isto criaram-se os *scripts* `keysByFile.py` e `typesToTable`.py que permitem analisar as chaves existentes e ajudar a juntar vários campos em um chamado apêndice.

Como normalizar os datasets:

```
mv {local_com_os_acórdãos} norm/acordãos_in
cd norm
python3 normalizers/run.py
```

Os datasets normalizados podem ser encontrados na pasta `norm/acordãos_out`.

Na normalização de descritores é feita uma lista com todos os descritores existentes comparando os novos aos já existentes. Caso a única diferença seja ter `"."` no fim, os acórdãos são considerados o mesmo sendo guardado o que já existia. Para além disso é verificada a existência de separações dentro de um descritor criando assim 2 descritores separados.

Na normalização de *datasets* a principal operação é a de adicionar valores ao apêndice sendo este o caso quando a chave de um valor se encontra usado no texto integral e/ou sumário (exceto situações em que é um campo existente em todos os registos). Outros casos de agrupamentos são `areaTematica`,`jurisprudências`,`normas`,`legislações` e `referências` que foram juntadas numa só chave.

### *Seeding* da base de dados

Para colocar automaticamente os dados nas bases de dados foi gerado um programa que automaticamente faz download dos dados e dá seed destes no graphdb.

Visto este remover os dados antigos e colocar os novos esta aplicação pode ser colocada num *chron job* para automatizar a atualização dos dados. 

Para utilizar basta executar dentro do *container* da *backend*:

```
python3 createDataset.py
```

### *Backend*

TODO

Visto que parte do grupo já tinha bastante experiência com a *framework* `Django` e esta possui bastantes extensões, que nos foram úteis, o grupo decidiu usá-la.

Um problema que encontramos com a nossa escolha de framework foi a falta de interação com bases de dados não relacionais como MongoDB. Visto que, desde início, a intenção era a generalidade dos acórdãos, seria necessário que qualquer chave fosse aceite, não fazendo sentido usar uma base de dados relacional. Daqui surgiu a ideia de ter duas bases de dados. Para resolver o problema apresentado criaram-se várias funções que tomam uso de `PyMongo` para comunicarem com uma base de dados onde todos os dados dos acórdãos e alterações de dados são guardadas.

Esta camada dispões de várias rotas públicas e acessíveis a qualquer utilizador (desde que possua uma chave secreta), na seguinte tabela podemos observar todos as rotas (divididas por grupos) existentes juntamente com a descrição de cada.

A documentação e listagem de todas as rotas públicas e privadas está totalmente documentada e pode ser consultada:

- No `Postman`, importando o ficheiro **[Acordãos.postman_collection.json](https://github.com/gweebg/acordb/blob/main/server/Acord%C3%A3os.postman_collection.json).**
- No ***browser*** através de `Swagger Docs`, acessível por http://localhost:8000/swagger/.
- No ***browser*** através de `Redoc`, acessível por http://localhost:8000/redoc/.

Tanto a documentação do `Swagger` como do `Redoc` seguem o _standard_ da _OpenAPI_.

Relativamente às funcionalidades, temos particular orgulho na implementação do histórico dos acórdãos. De modo a nunca perder informação e em alternativa à edição/remoção de acórdãos, optamos por distinguir um acórdão como sendo um conjunto de `records`, onde cada `record` representa uma versão do acórdão, estas versões são geradas através do mecanismo de revisões, isto é, um utilizador (autenticado) pode sugerir uma alteração a um acórdão que pode posteriormente ser aceite ou rejeitado (ficando sempre um registo no ********dashboard******** do utilizador). Assim caso um acórdão seja alterado o utilizador poderá sempre verificar como era antes, podemos pensar nesta funcionalidade como os Pull Requests do GitHub, do mesmo modo, o administrador pode ver as diferenças entre a versão sugerida e a atual antes de aceitar ou rejeitar o pedido. 

# Desenvolvimento do **Frontend**

### **Frontend**

Para a realização do **frontend** foi utilizado `TypeScript` juntamente com as ***frameworks*** `NextJS` e `NextUI`, visto parte do grupo já possuia experiência com estas frameworks. Enquanto que `NextJS` trata de routing e renderização de pedidos `NextUI` disponibiliza 

Como já referido previamente, podemos testar a interface em http://localhost:3000/ que nos leva à página principal da nossa aplicação onde podemos executar qualquer pesquisa ou consultar as cartas. 

Da página inicial temos acesso também aos *********decks********* (http://localhost:3000/decks) que nos listar todos os decks existentes com o seu nome e o número de cartas existentes. Para além disso, é tambem possivel criar novos decks apartir desta página.

Também podemos consultar uma carta `http://localhost:3000/card/{id}` onde podemos observar todo o conteúdo da carta, assim como adiciona-la a um *deck*.

Para consultar as cartas pertencentes a um *Deck* basta aceder a `http://localhost:3000/decks/{id}`.



No fundo estas quatro rotas mencionadas permitem realizar todas as operações da aplicação.
