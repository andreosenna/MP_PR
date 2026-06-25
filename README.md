# Gestão de Matéria-Prima — React + PrimeReact

Sistema de controle de matérias-primas, estoque e ordens de produção (extrusão e mistura), com perfis de **admin** e **operador**.

## Como rodar

```bash
cd gestao-mp
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Credenciais de teste

| Perfil    | Usuário   | Senha    |
|-----------|-----------|----------|
| Admin     | admin     | admin123 |
| Operador  | operador  | op123    |

## Funcionalidades

**Admin**
- Cadastro de matérias-primas e aditivos (tipo, nome, unidade, local de armazenamento)
- Movimentação de estoque (entrada/saída) com débito e crédito automático
- Criação de fórmulas de Extrusão e de Mistura, gerando uma OP com 11 caracteres (`OP-XXXXXXXX`)
- Baixa de matéria-prima da OP (debita o estoque)
- Gestão de OPs: editar dados, visualizar apontamentos, concluir OPs encerradas

**Operador**
- Tela de OPs em andamento/encerradas
- Registro de apontamento de produção (quantidade produzida + observação), com horário e operador automáticos
- Encerramento da OP (fica com status "Encerrada", aguardando conclusão do admin)

## Stack

- React 18 + Vite
- PrimeReact (tema `lara-light-blue`) + PrimeIcons
- Estado em memória via Context API (pronto para integrar a uma API/backend depois)

## Estrutura

```
src/
  components/    Sidebar, StatusBadge
  context/       AppContext (auth + dados globais)
  pages/         Dashboard, MateriasPrimas, Estoque, Formulas, OPsAdmin, OPsOperador, LoginPage
  utils/         dados mockados, helpers (gerarOP, formatDate)
```
