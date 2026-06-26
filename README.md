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
- Cadastro de matérias-primas e aditivos com:
  - **Código comum** + **descrição comum** (agrega estoque de itens equivalentes de fornecedores diferentes)
  - **Código específico** + **descrição específica** (controla o estoque real, único por fornecedor)
  - Fornecedor, unidade e local de armazenamento
- Movimentação de estoque (entrada/saída) sempre pelo **código específico**, com visão agregada por código comum
- Criação de fórmulas de Extrusão e de Mistura:
  - **Número da OP digitado pelo admin** (gerado em outro sistema), validado com exatamente 11 caracteres
  - Cada item da fórmula pode ser definido por **código específico** ou **código comum** (escolha explícita por item, com indicação visual)
  - Quantidade informada **por batelada** + **número de bateladas** → o app calcula o total de cada item e o total geral da fórmula
- Baixa de matéria-prima da OP (itens por código específico são debitados direto; itens por código comum exigem escolha do fornecedor no momento da baixa)
- Gestão de OPs: editar dados, visualizar apontamentos por batelada, concluir OPs encerradas

**Operador**
- Tela de OPs em andamento/encerradas, com progresso de bateladas (ex: 2/5)
- Apontamento de produção feito **por batelada**: a cada apontamento, debita do estoque a quantidade da fórmula daquela batelada
  - Para itens de código comum, o operador escolhe o código específico (fornecedor) de onde sairá a baixa
  - Observação obrigatória, com horário e operador registrados automaticamente
- Encerramento da OP (fica com status "Encerrada", aguardando conclusão do admin, que ainda pode editar os dados)

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
  utils/         dados mockados, helpers (validarOP, calcularTotaisFormula, formatDate)
```

## Regras de negócio implementadas

1. O número da OP **não é gerado pelo app** — é digitado pelo admin (vem de outro sistema), validado com 11 caracteres e checagem de duplicidade.
2. Cada matéria-prima tem 2 códigos e 2 descrições: comum (agregador, compartilhado entre fornecedores equivalentes) e específico (controla o estoque real por fornecedor).
3. Ao montar a fórmula, cada item indica claramente se foi definido por código **Específico** ou **Comum** (tag visual laranja/azul).
4. A fórmula é definida por quantidade **por batelada**; o admin informa o número de bateladas e o app soma automaticamente o total por item e o total geral.
5. O apontamento do operador é feito por batelada — a cada apontamento, debita-se do estoque a quantidade daquela batelada; para itens de código comum, o operador escolhe o código específico (fornecedor) no momento do apontamento.
