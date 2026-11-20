- MongoDB e Arquitetura de Big Data - NovaCompra

- Nome: Eduardo Rafael da Silva Suarez
- Curso: Sistemas de Informação
- Instituição: AMF
- Data: 19/11/2026

--

- Parte A -- Prática no MongoDB

- Ambiente

```bash
docker compose up -d --wait
docker compose ps
docker compose exec mongo mongosh --quiet --eval 'db.adminCommand({ping:1})'
```

```
NAME               IMAGE     COMMAND                  SERVICE   CREATED         STATUS                   PORTS
novacompra-mongo   mongo:8   "docker-entrypoint.s…"   mongo     7 seconds ago   Up 6 seconds (healthy)   127.0.0.1:27017->27017/tcp

{ ok: 1 }
```

Carga inicial (executada uma única vez):

```bash
docker compose exec -T mongo mongosh --quiet < init.js
```

```
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('6aff6e51776757f4061245e4'),
    '1': ObjectId('6aff6e51776757f4061245e5'),
    '2': ObjectId('6aff6e51776757f4061245e6'),
    '3': ObjectId('6aff6e51776757f4061245e7'),
    '4': ObjectId('6aff6e51776757f4061245e8'),
    '5': ObjectId('6aff6e51776757f4061245e9'),
    '6': ObjectId('6aff6e51776757f4061245ea'),
    '7': ObjectId('6aff6e51776757f4061245eb')
  }
}
Total de vendas iniciais: 8
```

- A.1 - Preparação e inserção de dados

Usei o countDocuments pra confirmar que a coleção ficou com as 8 vendas e o findOne pra ver como é um documento.

```javascript
db.vendas.countDocuments({})
```

```
8
```

```javascript
db.vendas.findOne()
```

```
{
  _id: ObjectId('6aff6e51776757f4061245e4'),
  pedidoId: 'P1001',
  data: ISODate('2026-10-20T10:00:00.000Z'),
  canal: 'loja',
  loja: 'Santa Maria',
  clienteId: 'C01',
  itens: [
    {
      produto: 'Notebook',
      categoria: 'Informática',
      quantidade: 1,
      precoUnitario: 3200
    },
    {
      produto: 'Mouse',
      categoria: 'Acessórios',
      quantidade: 2,
      precoUnitario: 80
    }
  ],
  status: 'concluida'
}
```


- Campos escalares e estrutura incorporada

Campos escalares: pedidoId e data. Estrutura incorporada: o array itens, onde cada item tem produto, categoria, quantidade e precoUnitario.

- Por que os itens ficam dentro do pedido

Os itens fazem parte do pedido e quase sempre são consultados junto com ele. Assim uma consulta só já traz o pedido inteiro, sem precisar juntar coleções, e o pedido é gravado todo de uma vez.

- Desvantagem

O nome e a categoria do produto se repetem em cada venda. Se a categoria de um produto mudar, tem que atualizar vários documentos.

- A.2 -- Consultas e operações CRUD

- Consulta

Usei o find com projeção pra mostrar só pedidoId, loja e status, coloquei _id: 0 pra esconder o _id e usei o sort pra ordenar pelo pedidoId.

```javascript
db.vendas.find({ status: "concluida" }, { _id: 0, pedidoId: 1, loja: 1, status: 1 }).sort({ pedidoId: 1 })
```

```
[
  { pedidoId: 'P1001', loja: 'Santa Maria', status: 'concluida' },
  { pedidoId: 'P1002', loja: 'E-commerce', status: 'concluida' },
  { pedidoId: 'P1003', loja: 'Porto Alegre', status: 'concluida' },
  { pedidoId: 'P1005', loja: 'Santa Maria', status: 'concluida' },
  { pedidoId: 'P1006', loja: 'E-commerce', status: 'concluida' },
  { pedidoId: 'P1007', loja: 'Porto Alegre', status: 'concluida' }
]
```

- Filtro

Coloquei os dois filtros no mesmo find, status concluida e loja Santa Maria, assim ele traz os pedidos com os itens.

```javascript
db.vendas.find({ status: "concluida", loja: "Santa Maria" })
```

```
[
  {
    _id: ObjectId('6aff6e51776757f4061245e4'),
    pedidoId: 'P1001',
    data: ISODate('2026-10-20T10:00:00.000Z'),
    canal: 'loja',
    loja: 'Santa Maria',
    clienteId: 'C01',
    itens: [
      {
        produto: 'Notebook',
        categoria: 'Informática',
        quantidade: 1,
        precoUnitario: 3200
      },
      {
        produto: 'Mouse',
        categoria: 'Acessórios',
        quantidade: 2,
        precoUnitario: 80
      }
    ],
    status: 'concluida'
  },
  {
    _id: ObjectId('6aff6e51776757f4061245e8'),
    pedidoId: 'P1005',
    data: ISODate('2026-10-22T13:00:00.000Z'),
    canal: 'loja',
    loja: 'Santa Maria',
    clienteId: 'C04',
    itens: [
      {
        produto: 'Teclado',
        categoria: 'Acessórios',
        quantidade: 2,
        precoUnitario: 150
      }
    ],
    status: 'concluida'
  }
]
```

- Inserção e atualização

Inseri o P1009 como pendente e depois usei o updateOne com $set, pra mudar só o status e não mexer no resto do documento.

```javascript
db.vendas.insertOne({
  pedidoId: "P1009", data: ISODate("2026-10-24T10:00:00Z"),
  canal: "online", loja: "E-commerce", clienteId: "C06",
  itens: [{ produto: "Mouse", categoria: "Acessórios", quantidade: 1, precoUnitario: 80 }],
  status: "pendente"
})
```

```
{
  acknowledged: true,
  insertedId: ObjectId('6aff6f749242abedb98bf46b')
}
```

```javascript
db.vendas.updateOne({ pedidoId: "P1009" }, { $set: { status: "concluida" } })
db.vendas.find({ pedidoId: "P1009" }, { _id: 0, pedidoId: 1, status: 1 })
```

```
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
[ { pedidoId: 'P1009', status: 'concluida' } ]
```

-Exclusão

Usei o deleteOne com filtro no pedidoId pra apagar só o P1009 e depois conferi a contagem.

```javascript
db.vendas.deleteOne({ pedidoId: "P1009" })
db.vendas.countDocuments({})
```

```
{ acknowledged: true, deletedCount: 1 }
8
```

-A.3 - Aggregation Pipeline

Nos dois primeiros pipelines eu usei o $match pra pegar só os pedidos concluídos e o $unwind pra separar os itens, assim cada item é calculado separado, mesmo nos pedidos que têm mais de um. Depois usei o $group pra somar, o $project pra renomear o campo e o $sort pra ordenar.

- Receita total por loja

Aqui eu multipliquei quantidade por precoUnitario dentro do $sum e agrupei pela loja.

```javascript
db.vendas.aggregate([
  { $match: { status: "concluida" } },
  { $unwind: "$itens" },
  { $group: { _id: "$loja", receita: { $sum: { $multiply: ["$itens.quantidade", "$itens.precoUnitario"] } } } },
  { $project: { _id: 0, loja: "$_id", receita: 1 } },
  { $sort: { receita: -1 } }
])
```

```
[
  { receita: 3660, loja: 'Santa Maria' },
  { receita: 3250, loja: 'E-commerce' },
  { receita: 2830, loja: 'Porto Alegre' }
]
```

-Unidades vendidas por categoria

Aqui agrupei pela categoria do item e somei só a quantidade.

```javascript
db.vendas.aggregate([
  { $match: { status: "concluida" } },
  { $unwind: "$itens" },
  { $group: { _id: "$itens.categoria", quantidade: { $sum: "$itens.quantidade" } } },
  { $project: { _id: 0, categoria: "$_id", quantidade: 1 } },
  { $sort: { quantidade: -1 } }
])
```

```
[
  { quantidade: 6, categoria: 'Acessórios' },
  { quantidade: 5, categoria: 'Informática' }
]
```

- Pedidos por status

Nesse eu não usei $match nem $unwind, porque é pra contar pedidos de todos os status e não itens. Usei $sum: 1 pra contar 1 por pedido.

```javascript
db.vendas.aggregate([
  { $group: { _id: "$status", total: { $sum: 1 } } },
  { $project: { _id: 0, status: "$_id", total: 1 } },
  { $sort: { total: -1 } }
])
```

```
[
  { total: 6, status: 'concluida' },
  { total: 1, status: 'cancelada' },
  { total: 1, status: 'pendente' }
]
```


- Cancelados e pendentes

Cancelados e pendentes não entram na receita por causa do $match em status: "concluida". Se entrassem, a receita ia ficar R$ 390 maior com vendas que não aconteceram ou que ainda não foram confirmadas.

-A.4 -- Integridade e qualidade de dados

-Índice único e duplicidade

Criei o índice único no pedidoId e depois tentei inserir o P1001 de novo pra testar.

```javascript
db.vendas.createIndex({ pedidoId: 1 }, { unique: true })
```

```
pedidoId_1
```

```javascript
db.vendas.insertOne({
  pedidoId: "P1001", data: ISODate("2026-10-24T10:00:00Z"),
  canal: "loja", loja: "Santa Maria", clienteId: "C01",
  itens: [{ produto: "Mouse", categoria: "Acessórios", quantidade: 1, precoUnitario: 80 }],
  status: "concluida"
})
```

```
MongoServerError: E11000 duplicate key error collection: novacompra_avaliacao.vendas index: pedidoId_1 dup key: { pedidoId: "P1001" }
```

A contagem permaneceu em 8 após a tentativa.

-Quantidade negativa (P9999)

Inseri o P9999 com quantidade -2, conferi a contagem e depois apaguei ele com deleteOne.

```javascript
db.vendas.insertOne({
  pedidoId: "P9999", data: ISODate("2026-10-24T12:00:00Z"),
  canal: "online", loja: "E-commerce", clienteId: "C99",
  itens: [{ produto: "Mouse", categoria: "Acessórios", quantidade: -2, precoUnitario: 80 }],
  status: "concluida"
})
```

```
{
  acknowledged: true,
  insertedId: ObjectId('6aff6f8cf71991d8f98942d7')
}
```

Contagem após a inserção: 9.

Limpeza:

```javascript
db.vendas.deleteOne({ pedidoId: "P9999" })
db.vendas.countDocuments({})
```

```
{ acknowledged: true, deletedCount: 1 }
8
```


- Por que a inserção foi aceita

O MongoDB não tem esquema fixo e a coleção não tem nenhuma validação, então ele aceita qualquer valor no campo quantidade. O índice único só verifica o pedidoId.

- Regra para devoluções e quantidades negativas

A regra que eu proponho é que numa venda a quantidade tem que ser no mínimo 1. Devolução não entra como venda negativa, ela é registrada separada, ligada ao pedidoId da venda original, e depois é descontada da receita.

- Como evitar duplicar vendas no reprocessamento

Eu usaria o pedidoId como chave única e faria upsert em vez de insert: se o pedido já existe só atualiza, se não existe insere. Assim rodar o mesmo lote duas vezes não duplica nada. No lakehouse dá pra fazer o mesmo com MERGE no Delta Lake.

- Verificação final

No final conferi que a coleção voltou pra 8 documentos e que o índice ficou criado.

```javascript
db.vendas.countDocuments({})
db.vendas.getIndexes().map(i => i.name)
```

```
8
[ '_id_', 'pedidoId_1' ]
```


--

- Parte B - Arquitetura de Big Data

- B.1 -- Fluxo da plataforma

O diagrama eu fiz no Excalidraw e ele está na imagem que anexei junto com este relatório.

Usei setas cheias pro caminho dos dados, das fontes até os dashboards. As setas pontilhadas eu usei só no Airflow, porque ele não passa dados nenhum: ele só agenda os jobs, controla a ordem deles e monitora se deu certo. Assim fica separado o que é fluxo de dados do que é orquestração.

-Papel de cada ferramenta

-Batch com Spark: ERP, CRM, planilhas e MongoDB, carregados de tempos em tempos.
-Streaming com Kafka e Spark Structured Streaming: eventos do e-commerce e dos sensores, que chegam o tempo todo. O Kafka recebe os eventos e o Spark lê e grava na Bronze.
-MinIO guarda os arquivos e o Delta Lake transforma eles em tabelas.
-Airflow agenda os jobs e controla a ordem deles, mas não processa nem guarda dados.
-DuckDB e Trino servem pra consultar os dados com SQL, e o Metabase faz os dashboards.

- Coleção vendas na tabela analítica

Os documentos de vendas entram como fonte, passam pela ingestão batch e chegam na Bronze do jeito que estão. Na Silver o array itens é separado e cada item vira uma linha, com os campos do pedido (pedidoId, data, loja, status) e os do item (produto, categoria, quantidade, precoUnitario).

- B.2 - Medallion, qualidade e consumo

| Camada | Que dados ficam nessa camada? | Uma transformação ou regra de qualidade | Quem usa esses dados? |
| --- | --- | --- | --- |
| Bronze | Dados brutos como vieram das fontes, inclusive pedidos cancelados | Só guarda, não altera nada | Engenheiros de dados |
| Silver | Dados limpos, uma linha por item vendido | Remover pedidos duplicados e itens com quantidade negativa | Analistas e engenheiros de dados |
| Gold | Indicadores prontos, como receita por loja e vendas por categoria | Somar só pedidos concluídos | Diretoria, pelo Metabase |

- Pedido cancelado na Bronze e na Gold

Na Bronze fica tudo que veio da fonte, pra ter o histórico e poder reprocessar. Na Gold o faturamento é só do que foi vendido de verdade, e pedido cancelado não gerou dinheiro.

- Parquet e Delta Lake

Parquet é um formato de arquivo colunar, bom pra leitura de dados. O Delta Lake usa arquivos Parquet mas adiciona um log de transações, que garante que as gravações sejam completas (ACID) e guarda versões da tabela, então dá pra consultar ou voltar uma versão antiga.

- Indicador no Metabase

O indicador que eu colocaria é a receita por loja por dia. Precisa da data, da loja e do valor de cada item (quantidade x precoUnitario), filtrando só pedidos concluídos e agrupando por data e loja.

- B.3 -- Lambda ou Kappa

- Comparação

A Lambda tem dois caminhos, um batch e um de streaming, então a mesma lógica fica em dois lugares. A Kappa tem um caminho só, de streaming. Pra reprocessar o histórico na Kappa, os eventos guardados são lidos de novo desde o início.

- Escolha

Escolhi a Kappa, porque a empresa quer dashboards atualizados com frequência e com um caminho só fica mais simples de manter. Quando tiver erro, é só corrigir o job e rodar de novo em cima dos dados guardados na Bronze.

- Como os dados chegam na Gold

Os dados chegam na Bronze, o Spark limpa e manda pra Silver, depois agrega e grava na Gold. O Metabase lê a Gold pelo Trino.
