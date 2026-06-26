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
