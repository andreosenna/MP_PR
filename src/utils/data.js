export const USERS = [
  { username: "admin", password: "admin123", role: "admin", name: "Administrador" },
  { username: "operador", password: "op123", role: "operador", name: "Operador" },
];

export const INITIAL_FORNECEDORES = [
  { id: 1, nome: "Braskem", cnpj: "42.150.391/0001-70", contato: "comercial@braskem.com.br" },
  { id: 2, nome: "Innova", cnpj: "92.693.118/0001-60", contato: "vendas@innova.com.br" },
  { id: 3, nome: "Croda", cnpj: "61.064.215/0001-08", contato: "contato@croda.com" },
  { id: 4, nome: "BASF", cnpj: "60.398.138/0001-79", contato: "atendimento@basf.com" },
  { id: 5, nome: "Clariant", cnpj: "59.151.460/0001-91", contato: "vendas@clariant.com" },
  { id: 6, nome: "Omya", cnpj: "60.621.146/0001-08", contato: "comercial@omya.com.br" },
];

// Cada MP tem:
// - codigoComum / descricaoComum: agrega estoque de itens equivalentes de fornecedores diferentes
// - codigoEspecifico / descricaoEspecifica: único por fornecedor, controla o estoque real
// - fornecedorId: vínculo com o cadastro de fornecedores (null para itens gerados internamente, como produto de extrusão)
// - origem: "Compra" (adquirido de fornecedor externo) | "Extrusão" (produto intermediário gerado pela própria produção)
export const INITIAL_MP = [
  {
    id: 1,
    tipo: "Polímero",
    codigoComum: "PP-001",
    descricaoComum: "PP Homopolímero",
    codigoEspecifico: "PP-001-BRA",
    descricaoEspecifica: "PP Homopolímero - Braskem H503",
    fornecedorId: 1,
    unidade: "kg",
    estoque: 5000,
    local: "Galpão A - Prateleira 1",
    origem: "Compra",
  },
  {
    id: 2,
    tipo: "Polímero",
    codigoComum: "PP-001",
    descricaoComum: "PP Homopolímero",
    codigoEspecifico: "PP-001-INN",
    descricaoEspecifica: "PP Homopolímero - Innova HP500",
    fornecedorId: 2,
    unidade: "kg",
    estoque: 1800,
    local: "Galpão A - Prateleira 1B",
    origem: "Compra",
  },
  {
    id: 3,
    tipo: "Polímero",
    codigoComum: "PEAD-001",
    descricaoComum: "PEAD Natural",
    codigoEspecifico: "PEAD-001-BRA",
    descricaoEspecifica: "PEAD Natural - Braskem HF0540",
    fornecedorId: 1,
    unidade: "kg",
    estoque: 3200,
    local: "Galpão A - Prateleira 2",
    origem: "Compra",
  },
  {
    id: 4,
    tipo: "Aditivo",
    codigoComum: "ADT-DES",
    descricaoComum: "Deslizante Interno",
    codigoEspecifico: "ADT-DES-CRO",
    descricaoEspecifica: "Deslizante Interno - Croda Erucamida",
    fornecedorId: 3,
    unidade: "kg",
    estoque: 120,
    local: "Almoxarifado B - Prateleira 3",
    origem: "Compra",
  },
  {
    id: 5,
    tipo: "Aditivo",
    codigoComum: "ADT-ANT",
    descricaoComum: "Antioxidante 1010",
    codigoEspecifico: "ADT-ANT-BASF",
    descricaoEspecifica: "Antioxidante 1010 - BASF Irganox",
    fornecedorId: 4,
    unidade: "kg",
    estoque: 80,
    local: "Almoxarifado B - Prateleira 4",
    origem: "Compra",
  },
  {
    id: 6,
    tipo: "Pigmento",
    codigoComum: "PIG-PRT",
    descricaoComum: "Masterbatch Preto",
    codigoEspecifico: "PIG-PRT-CLR",
    descricaoEspecifica: "Masterbatch Preto - Clariant MB2099",
    fornecedorId: 5,
    unidade: "kg",
    estoque: 450,
    local: "Galpão C - Prateleira 1",
    origem: "Compra",
  },
  {
    id: 7,
    tipo: "Carga",
    codigoComum: "CAR-CACO3",
    descricaoComum: "CaCO3 Ultra-fino",
    codigoEspecifico: "CAR-CACO3-OMYA",
    descricaoEspecifica: "CaCO3 Ultra-fino - Omya Omyalite",
    fornecedorId: 6,
    unidade: "kg",
    estoque: 2100,
    local: "Galpão A - Prateleira 5",
    origem: "Compra",
  },
];

// Movimentações de entrada agora carregam dados de inspeção de recebimento.
export const INITIAL_MOVS = [
  {
    id: 1,
    mpId: 1,
    tipo: "Entrada",
    qtd: 5000,
    data: "2025-06-01T08:00:00",
    responsavel: "admin",
    obs: "Compra NF 001",
    lote: "L2025-0601",
    nf: "000123",
    validade: "2026-06-01",
    fluidez: "3.5 g/10min",
    inspecao: { qualidade: 5, preco: 4, quantidade: 5, prazo: 4, validade: 5, fluidez: 5 },
  },
  {
    id: 2,
    mpId: 3,
    tipo: "Entrada",
    qtd: 3200,
    data: "2025-06-02T08:00:00",
    responsavel: "admin",
    obs: "Compra NF 002",
    lote: "L2025-0602",
    nf: "000124",
    validade: "2026-06-02",
    fluidez: "0.9 g/10min",
    inspecao: { qualidade: 4, preco: 4, quantidade: 5, prazo: 3, validade: 5, fluidez: 4 },
  },
];

export const INITIAL_OPS = [];

export const TIPOS_MP = ["Polímero", "Aditivo", "Pigmento", "Carga", "Solvente", "Resina", "Produto Intermediário", "Outro"];
export const UNIDADES = ["kg", "g", "L", "mL", "un"];

export const CRITERIOS_INSPECAO = [
  { key: "qualidade", label: "Qualidade" },
  { key: "preco", label: "Preço" },
  { key: "quantidade", label: "Quantidade" },
  { key: "prazo", label: "Prazo" },
  { key: "validade", label: "Validade" },
  { key: "fluidez", label: "Fluidez" },
];
