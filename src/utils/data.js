export const USERS = [
  { username: "admin", password: "admin123", role: "admin", name: "Administrador" },
  { username: "operador", password: "op123", role: "operador", name: "Operador" },
];

export const INITIAL_MP = [
  { id: 1, tipo: "Polímero", nome: "PP Homopolímero", unidade: "kg", estoque: 5000, local: "Galpão A - Prateleira 1" },
  { id: 2, tipo: "Polímero", nome: "PEAD Natural", unidade: "kg", estoque: 3200, local: "Galpão A - Prateleira 2" },
  { id: 3, tipo: "Aditivo", nome: "Deslizante Interno", unidade: "kg", estoque: 120, local: "Almoxarifado B - Prateleira 3" },
  { id: 4, tipo: "Aditivo", nome: "Antioxidante 1010", unidade: "kg", estoque: 80, local: "Almoxarifado B - Prateleira 4" },
  { id: 5, tipo: "Pigmento", nome: "Masterbatch Preto", unidade: "kg", estoque: 450, local: "Galpão C - Prateleira 1" },
  { id: 6, tipo: "Carga", nome: "CaCO3 Ultra-fino", unidade: "kg", estoque: 2100, local: "Galpão A - Prateleira 5" },
];

export const INITIAL_MOVS = [
  { id: 1, mpId: 1, tipo: "Entrada", qtd: 5000, data: "2025-06-01T08:00:00", responsavel: "admin", obs: "Compra NF 001" },
  { id: 2, mpId: 2, tipo: "Entrada", qtd: 3200, data: "2025-06-02T08:00:00", responsavel: "admin", obs: "Compra NF 002" },
];

export const INITIAL_OPS = [];

export const TIPOS_MP = ["Polímero", "Aditivo", "Pigmento", "Carga", "Solvente", "Resina", "Outro"];
export const UNIDADES = ["kg", "g", "L", "mL", "un"];
