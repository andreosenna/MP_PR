export function gerarOP() {
  // OP com exatamente 11 caracteres, ex: OP-A1B2C3D4
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sufixo = "";
  for (let i = 0; i < 8; i++) {
    sufixo += chars[Math.floor(Math.random() * chars.length)];
  }
  return `OP-${sufixo}`; // "OP-" (3) + 8 = 11 caracteres
}

export function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleString("pt-BR");
}

export function formatDateShort(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR");
}
