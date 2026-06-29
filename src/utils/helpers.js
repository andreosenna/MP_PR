import { CRITERIOS_INSPECAO } from "./data.js";

export function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleString("pt-BR");
}

export function formatDateShort(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR");
}

// A OP é digitada pelo admin (gerada em outro sistema). Regra: exatamente 11 caracteres.
export function validarOP(op) {
  if (!op) return "Informe o número da OP";
  const trimmed = op.trim();
  if (trimmed.length !== 11) return `A OP deve ter exatamente 11 caracteres (atual: ${trimmed.length})`;
  return null;
}

export function opJaExiste(ops, opNumero) {
  return ops.some((o) => o.op.toUpperCase() === opNumero.trim().toUpperCase());
}

// Agrega o estoque de todos os itens (códigos específicos) que compartilham o mesmo código comum.
export function estoqueAgregadoPorComum(mp, codigoComum) {
  return mp.filter((m) => m.codigoComum === codigoComum).reduce((sum, m) => sum + m.estoque, 0);
}

// Lista única de códigos comuns presentes no cadastro de MP, com a descrição comum e estoque agregado.
export function listarCodigosComuns(mp) {
  const map = new Map();
  for (const m of mp) {
    if (!map.has(m.codigoComum)) {
      map.set(m.codigoComum, {
        codigoComum: m.codigoComum,
        descricaoComum: m.descricaoComum,
        unidade: m.unidade,
        estoqueTotal: 0,
        especificos: [],
      });
    }
    const entry = map.get(m.codigoComum);
    entry.estoqueTotal += m.estoque;
    entry.especificos.push(m);
  }
  return Array.from(map.values());
}

// Calcula o total de uma fórmula: quantidade por batelada x número de bateladas, por item.
export function calcularTotaisFormula(itens, numeroBateladas) {
  const n = Number(numeroBateladas) || 0;
  return itens.map((it) => ({
    ...it,
    qtdTotal: (Number(it.qtdBatelada) || 0) * n,
  }));
}

export function somaTotalFormula(itens, numeroBateladas) {
  return calcularTotaisFormula(itens, numeroBateladas).reduce((sum, it) => sum + it.qtdTotal, 0);
}

// Média simples dos 6 critérios de uma inspeção.
export function mediaInspecao(inspecao) {
  if (!inspecao) return null;
  const valores = CRITERIOS_INSPECAO.map((c) => Number(inspecao[c.key]) || 0);
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

// Classificação textual a partir da média (escala 1-5).
export function classificacaoPorMedia(media) {
  if (media == null) return "Sem avaliação";
  if (media >= 4.5) return "Excelente";
  if (media >= 3.5) return "Bom";
  if (media >= 2.5) return "Regular";
  if (media >= 1.5) return "Fraco";
  return "Péssimo";
}

export function corClassificacao(classificacao) {
  const map = {
    Excelente: { bg: "#e1f5ee", color: "#085041" },
    Bom: { bg: "#eaf3de", color: "#3b6d11" },
    Regular: { bg: "#faeeda", color: "#854f0b" },
    Fraco: { bg: "#fbe4d5", color: "#a3460b" },
    Péssimo: { bg: "#fcebeb", color: "#a32d2d" },
    "Sem avaliação": { bg: "#f1efe8", color: "#5f5e5a" },
  };
  return map[classificacao] || map["Sem avaliação"];
}

// Relatório analítico: agrupa as movimentações de Entrada com inspeção por fornecedor e por matéria-prima.
export function gerarRelatorioInspecao(movs, mp, fornecedores) {
  const entradasComInspecao = movs.filter((m) => m.tipo === "Entrada" && m.inspecao);

  const porFornecedor = new Map();
  const porMP = new Map();

  for (const mov of entradasComInspecao) {
    const item = mp.find((m) => m.id === mov.mpId);
    if (!item) continue;
    const fornecedor = fornecedores.find((f) => f.id === item.fornecedorId);
    const fornecedorNome = fornecedor?.nome || "Sem fornecedor";
    const media = mediaInspecao(mov.inspecao);

    // Por fornecedor
    if (!porFornecedor.has(fornecedorNome)) {
      porFornecedor.set(fornecedorNome, { fornecedor: fornecedorNome, fornecedorId: fornecedor?.id, avaliacoes: [], somaPorCriterio: {} });
    }
    const entryF = porFornecedor.get(fornecedorNome);
    entryF.avaliacoes.push({ ...mov, media, mpDescricao: item.descricaoEspecifica });

    // Por matéria-prima (código específico)
    const key = item.codigoEspecifico;
    if (!porMP.has(key)) {
      porMP.set(key, {
        codigoEspecifico: item.codigoEspecifico,
        descricaoEspecifica: item.descricaoEspecifica,
        fornecedor: fornecedorNome,
        avaliacoes: [],
      });
    }
    porMP.get(key).avaliacoes.push({ ...mov, media });
  }

  function calcularResumo(grupo) {
    const medias = grupo.avaliacoes.map((a) => a.media).filter((m) => m != null);
    const mediaGeral = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null;

    const mediaPorCriterio = {};
    for (const c of CRITERIOS_INSPECAO) {
      const valores = grupo.avaliacoes.map((a) => Number(a.inspecao[c.key]) || 0);
      mediaPorCriterio[c.key] = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    }

    return { ...grupo, mediaGeral, classificacao: classificacaoPorMedia(mediaGeral), mediaPorCriterio, totalAvaliacoes: grupo.avaliacoes.length };
  }

  return {
    porFornecedor: Array.from(porFornecedor.values()).map(calcularResumo),
    porMP: Array.from(porMP.values()).map(calcularResumo),
  };
}
