const banco = db.getSiblingDB("novacompra_avaliacao");

if (banco.vendas.countDocuments({}) !== 8) {
  throw new Error("A coleção vendas deve ter exatamente 8 documentos antes de executar este script.");
}

// A.1 — Preparação e inserção de dados
print("=== A.1 countDocuments ===");
printjson(banco.vendas.countDocuments({}));
print("=== A.1 findOne ===");
printjson(banco.vendas.findOne());

// A.2 — Consultas e operações CRUD
print("=== A.2 1. Pedidos concluídos ===");
printjson(banco.vendas.find(
  { status: "concluida" },
  { _id: 0, pedidoId: 1, loja: 1, status: 1 }
).sort({ pedidoId: 1 }).toArray());

print("=== A.2 2. Pedidos concluídos de Santa Maria ===");
printjson(banco.vendas.find({ status: "concluida", loja: "Santa Maria" }).toArray());

print("=== A.2 3. Inserir P1009 e atualizar status ===");
try {
  printjson(banco.vendas.insertOne({
    pedidoId: "P1009", data: ISODate("2026-10-24T10:00:00Z"),
    canal: "online", loja: "E-commerce", clienteId: "C06",
    itens: [{ produto: "Mouse", categoria: "Acessórios", quantidade: 1, precoUnitario: 80 }],
    status: "pendente"
  }));
  printjson(banco.vendas.updateOne({ pedidoId: "P1009" }, { $set: { status: "concluida" } }));
  printjson(banco.vendas.find({ pedidoId: "P1009" }, { _id: 0, pedidoId: 1, status: 1 }).toArray());
} finally {
  print("=== A.2 4. Excluir P1009 e conferir a contagem ===");
  printjson(banco.vendas.deleteOne({ pedidoId: "P1009" }));
  printjson(banco.vendas.countDocuments({}));
}

// A.3 — Aggregation Pipeline
print("=== A.3 1. Receita por loja ===");
printjson(banco.vendas.aggregate([
  { $match: { status: "concluida" } },
  { $unwind: "$itens" },
  { $group: { _id: "$loja", receita: { $sum: { $multiply: ["$itens.quantidade", "$itens.precoUnitario"] } } } },
  { $project: { _id: 0, loja: "$_id", receita: 1 } },
  { $sort: { receita: -1 } }
]).toArray());

print("=== A.3 2. Quantidade vendida por categoria ===");
printjson(banco.vendas.aggregate([
  { $match: { status: "concluida" } },
  { $unwind: "$itens" },
  { $group: { _id: "$itens.categoria", quantidade: { $sum: "$itens.quantidade" } } },
  { $project: { _id: 0, categoria: "$_id", quantidade: 1 } },
  { $sort: { quantidade: -1 } }
]).toArray());

print("=== A.3 3. Quantidade de pedidos por status ===");
printjson(banco.vendas.aggregate([
  { $group: { _id: "$status", total: { $sum: 1 } } },
  { $project: { _id: 0, status: "$_id", total: 1 } },
  { $sort: { total: -1 } }
]).toArray());

// A.4 — Integridade e qualidade
print("=== A.4 1. Índice único e tentativa de duplicidade ===");
printjson(banco.vendas.createIndex({ pedidoId: 1 }, { unique: true }));
try {
  printjson(banco.vendas.insertOne({
    pedidoId: "P1001", data: ISODate("2026-10-24T10:00:00Z"),
    canal: "loja", loja: "Santa Maria", clienteId: "C01",
    itens: [{ produto: "Mouse", categoria: "Acessórios", quantidade: 1, precoUnitario: 80 }],
    status: "concluida"
  }));
} catch (e) {
  print("Erro esperado: " + e.message);
}
printjson(banco.vendas.countDocuments({}));

print("=== A.4 2. Quantidade negativa e limpeza de P9999 ===");
try {
  printjson(banco.vendas.insertOne({
    pedidoId: "P9999", data: ISODate("2026-10-24T12:00:00Z"),
    canal: "online", loja: "E-commerce", clienteId: "C99",
    itens: [{ produto: "Mouse", categoria: "Acessórios", quantidade: -2, precoUnitario: 80 }],
    status: "concluida"
  }));
  print("Contagem com P9999: " + banco.vendas.countDocuments({}));
} finally {
  printjson(banco.vendas.deleteOne({ pedidoId: "P9999" }));
}

// A.4 3. Estratégia conceitual de reprocessamento (no relatório)

print("=== Verificação final ===");
const total = banco.vendas.countDocuments({});
print("Total final: " + total);
if (total !== 8) {
  throw new Error("A coleção terminou com " + total + " documentos; o esperado é 8.");
}
