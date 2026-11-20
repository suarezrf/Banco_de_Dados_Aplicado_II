const banco = db.getSiblingDB("novacompra_avaliacao");

if (banco.vendas.countDocuments({}) !== 0) {
  throw new Error("A coleção vendas já contém documentos. Não repita a carga inicial.");
}

banco.vendas.insertMany([
  {
    pedidoId: "P1001", data: ISODate("2026-10-20T10:00:00Z"),
    canal: "loja", loja: "Santa Maria", clienteId: "C01",
    itens: [
      { produto: "Notebook", categoria: "Informática", quantidade: 1, precoUnitario: 3200 },
      { produto: "Mouse", categoria: "Acessórios", quantidade: 2, precoUnitario: 80 }
    ], status: "concluida"
  },
  {
    pedidoId: "P1002", data: ISODate("2026-10-20T11:00:00Z"),
    canal: "online", loja: "E-commerce", clienteId: "C02",
    itens: [{ produto: "Teclado", categoria: "Acessórios", quantidade: 1, precoUnitario: 150 }],
    status: "concluida"
  },
  {
    pedidoId: "P1003", data: ISODate("2026-10-21T09:00:00Z"),
    canal: "loja", loja: "Porto Alegre", clienteId: "C03",
    itens: [{ produto: "Monitor", categoria: "Informática", quantidade: 2, precoUnitario: 900 }],
    status: "concluida"
  },
  {
    pedidoId: "P1004", data: ISODate("2026-10-21T14:00:00Z"),
    canal: "online", loja: "E-commerce", clienteId: "C01",
    itens: [{ produto: "Mouse", categoria: "Acessórios", quantidade: 3, precoUnitario: 80 }],
    status: "cancelada"
  },
  {
    pedidoId: "P1005", data: ISODate("2026-10-22T13:00:00Z"),
    canal: "loja", loja: "Santa Maria", clienteId: "C04",
    itens: [{ produto: "Teclado", categoria: "Acessórios", quantidade: 2, precoUnitario: 150 }],
    status: "concluida"
  },
  {
    pedidoId: "P1006", data: ISODate("2026-10-22T15:00:00Z"),
    canal: "online", loja: "E-commerce", clienteId: "C05",
    itens: [{ produto: "Notebook", categoria: "Informática", quantidade: 1, precoUnitario: 3100 }],
    status: "concluida"
  },
  {
    pedidoId: "P1007", data: ISODate("2026-10-23T09:30:00Z"),
    canal: "loja", loja: "Porto Alegre", clienteId: "C02",
    itens: [
      { produto: "Monitor", categoria: "Informática", quantidade: 1, precoUnitario: 950 },
      { produto: "Mouse", categoria: "Acessórios", quantidade: 1, precoUnitario: 80 }
    ], status: "concluida"
  },
  {
    pedidoId: "P1008", data: ISODate("2026-10-23T16:00:00Z"),
    canal: "online", loja: "E-commerce", clienteId: "C03",
    itens: [{ produto: "Teclado", categoria: "Acessórios", quantidade: 1, precoUnitario: 150 }],
    status: "pendente"
  }
]);

print("Total de vendas iniciais: " + banco.vendas.countDocuments({}));
