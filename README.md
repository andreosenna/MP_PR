# Gestão de Matéria-Prima — React + PrimeReact

Sistema de controle de matérias-primas, fornecedores, estoque (com inspeção de recebimento) e ordens de produção (extrusão e mistura), com perfis de **admin** e **operador**.

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
- Cadastro de **Fornecedores** (nome, CNPJ, contato), com classificação calculada a partir das inspeções de recebimento
- Cadastro de matérias-primas e aditivos com:
  - **Código comum** + **descrição comum** (agrega estoque de itens equivalentes de fornecedores diferentes)
  - **Código específico** + **descrição específica** (controla o estoque real, único por fornecedor)
  - Fornecedor vinculado ao cadastro, unidade e local de armazenamento
- Movimentação de estoque sempre pelo **código específico**, com visão agregada por código comum:
  - **Entrada**: exige inspeção de recebimento (Qualidade, Preço, Quantidade, Prazo, Validade e Fluidez — escala 1 a 5) e dados de lote, NF, data de validade e índice de fluidez
  - **Saída**: simples, sem inspeção
- **Relatório Analítico de Inspeção**: médias por critério, média geral e classificação (Excelente/Bom/Regular/Fraco/Péssimo), agrupado por Fornecedor e por Matéria-Prima, com histórico expansível
- Criação de fórmulas de Extrusão e de Mistura:
  - **Número da OP digitado pelo admin** (gerado em outro sistema), validado com exatamente 11 caracteres
  - Cada item da fórmula pode ser definido por **código específico** ou **código comum** (escolha explícita por item, com indicação visual)
  - Quantidade informada **por batelada** + **número de bateladas** → o app calcula o total de cada item e o total geral da fórmula
  - Fórmulas de **Extrusão** podem definir um **produto intermediário gerado** (novo código comum/específico), que é cadastrado automaticamente em Matérias-Primas com estoque zero e fica disponível para ser usado como insumo nas fórmulas de **Mistura**
- O admin **apenas cria e inicia a OP** (libera para produção) — ele não realiza mais a baixa de matéria-prima; isso é exclusivo do operador
- Gestão de OPs: editar dados, visualizar apontamentos por batelada (baixas e créditos), concluir OPs encerradas

**Operador**
- Tela de OPs em andamento/encerradas, com progresso de bateladas (ex: 2/5)
- Apontamento de produção feito **por batelada**: a cada apontamento, debita do estoque a quantidade da fórmula daquela batelada
  - Para itens de código comum, o operador escolhe o código específico (fornecedor) de onde sairá a baixa
  - Se a OP for de Extrusão com produto gerado configurado, cada batelada também **credita** o estoque do produto intermediário automaticamente
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
  context/       AppContext (auth + dados globais: mp, movs, ops, fornecedores)
  pages/         Dashboard, MateriasPrimas, Fornecedores, Estoque, RelatorioInspecao,
                 Formulas, OPsAdmin, OPsOperador, LoginPage
  utils/         dados mockados, helpers (validarOP, calcularTotaisFormula, mediaInspecao,
                 classificacaoPorMedia, gerarRelatorioInspecao, formatDate)
```

## Regras de negócio implementadas

1. **OP iniciada, não baixada, pelo admin.** O admin cria a fórmula/OP e a "Inicia" (status vai de Aberta → Em Andamento), liberando-a para o operador. A baixa de matéria-prima passou a ser feita exclusivamente pelo operador, por batelada, na tela de apontamento.
2. **Extrusão gera estoque para a Mistura.** Ao montar uma fórmula de Extrusão, o admin pode marcar que ela gera um produto intermediário (novo código comum/específico). Esse produto é cadastrado em Matérias-Primas com estoque zero e tipo "Produto Intermediário"; cada batelada apontada pelo operador credita seu estoque, tornando-o disponível para ser usado como insumo em fórmulas de Mistura.
3. **Inspeção de recebimento na entrada de estoque.** Toda movimentação de Entrada exige avaliação de 6 critérios (Qualidade, Preço, Quantidade, Prazo, Validade, Fluidez) em escala de 1 (péssimo) a 5 (ótimo), usando o componente de estrelas do PrimeReact.
4. **Dados complementares na entrada.** Além da inspeção, a entrada registra lote, número da NF, data de validade e índice de fluidez (texto livre, ex: "3.5 g/10min").
5. **Cadastro de Fornecedores com classificação.** Tela própria de Fornecedores (nome, CNPJ, contato). A classificação (Excelente/Bom/Regular/Fraco/Péssimo) é calculada automaticamente a partir da média das inspeções de recebimento vinculadas a esse fornecedor, e o Relatório Analítico de Inspeção detalha o desempenho por fornecedor e por matéria-prima, com médias por critério e histórico de avaliações.
