export const USERS = [
  { username: "admin", password: "admin123", role: "admin", name: "Administrador" },
  { username: "operador", password: "op123", role: "operador", name: "Operador" },
];

// Cada MP agora tem:
// - codigoComum: agrega estoque de itens da mesma classificação (ex: vários fornecedores do mesmo PP)
// - codigoEspecifico: único por fornecedor/lote de fornecimento, controla estoque real
// - descricaoComum: nome genérico do material
// - descricaoEspecifica: nome/variante específica do fornecedor
export const INITIAL_MP = [
  {
    id: 1,
    tipo: "Polímero",
    codigoComum: "PP-001",
    descricaoComum: "PP Homopolímero",
    codigoEspecifico: "PP-001-BRA",
    descricaoEspecifica: "PP Homopolímero - Braskem H503",
    fornecedor: "Braskem",
    unidade: "kg",
    estoque: 5000,
    local: "Galpão A - Prateleira 1",
  },
  {
    id: 2,
    tipo: "Polímero",
    codigoComum: "PP-001",
    descricaoComum: "PP Homopolímero",
    codigoEspecifico: "PP-001-INN",
    descricaoEspecifica: "PP Homopolímero - Innova HP500",
    fornecedor: "Innova",
    unidade: "kg",
    estoque: 1800,
    local: "Galpão A - Prateleira 1B",
  },
  {
    id: 3,
    tipo: "Polímero",
    codigoComum: "PEAD-001",
    descricaoComum: "PEAD Natural",
    codigoEspecifico: "PEAD-001-BRA",
    descricaoEspecifica: "PEAD Natural - Braskem HF0540",
    fornecedor: "Braskem",
    unidade: "kg",
    estoque: 3200,
    local: "Galpão A - Prateleira 2",
  },
  {
    id: 4,
    tipo: "Aditivo",
    codigoComum: "ADT-DES",
    descricaoComum: "Deslizante Interno",
    codigoEspecifico: "ADT-DES-CRO",
    descricaoEspecifica: "Deslizante Interno - Croda Erucamida",
    fornecedor: "Croda",
    unidade: "kg",
    estoque: 120,
    local: "Almoxarifado B - Prateleira 3",
  },
  {
    id: 5,
    tipo: "Aditivo",
    codigoComum: "ADT-ANT",
    descricaoComum: "Antioxidante 1010",
    codigoEspecifico: "ADT-ANT-BASF",
    descricaoEspecifica: "Antioxidante 1010 - BASF Irganox",
    fornecedor: "BASF",
    unidade: "kg",
    estoque: 80,
    local: "Almoxarifado B - Prateleira 4",
  },
  {
    id: 6,
    tipo: "Pigmento",
    codigoComum: "PIG-PRT",
    descricaoComum: "Masterbatch Preto",
    codigoEspecifico: "PIG-PRT-CLR",
    descricaoEspecifica: "Masterbatch Preto - Clariant MB2099",
    fornecedor: "Clariant",
    unidade: "kg",
    estoque: 450,
    local: "Galpão C - Prateleira 1",
  },
  {
    id: 7,
    tipo: "Carga",
    codigoComum: "CAR-CACO3",
    descricaoComum: "CaCO3 Ultra-fino",
    codigoEspecifico: "CAR-CACO3-OMYA",
    descricaoEspecifica: "CaCO3 Ultra-fino - Omya Omyalite",
    fornecedor: "Omya",
    unidade: "kg",
    estoque: 2100,
    local: "Galpão A - Prateleira 5",
  },
];

export const INITIAL_MOVS = [
  { id: 1, mpId: 1, tipo: "Entrada", qtd: 5000, data: "2025-06-01T08:00:00", responsavel: "admin", obs: "Compra NF 001" },
  { id: 2, mpId: 3, tipo: "Entrada", qtd: 3200, data: "2025-06-02T08:00:00", responsavel: "admin", obs: "Compra NF 002" },
];

export const INITIAL_OPS = [];

export const TIPOS_MP = ["Polímero", "Aditivo", "Pigmento", "Carga", "Solvente", "Resina", "Outro"];
export const UNIDADES = ["kg", "g", "L", "mL", "un"];
