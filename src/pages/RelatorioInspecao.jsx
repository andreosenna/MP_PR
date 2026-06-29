import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { TabView, TabPanel } from "primereact/tabview";
import { useApp } from "../context/AppContext.jsx";
import { gerarRelatorioInspecao, corClassificacao, formatDate } from "../utils/helpers.js";
import { CRITERIOS_INSPECAO } from "../utils/data.js";

export default function RelatorioInspecao() {
  const { movs, mp, fornecedores } = useApp();
  const [expandedFornecedor, setExpandedFornecedor] = useState(null);
  const [expandedMP, setExpandedMP] = useState(null);

  const relatorio = gerarRelatorioInspecao(movs, mp, fornecedores);

  function renderCriterios(mediaPorCriterio) {
    return (
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
        {CRITERIOS_INSPECAO.map((c) => {
          const valor = mediaPorCriterio[c.key];
          return (
            <div key={c.key} style={{ fontSize: 12, background: "#f0f4f8", borderRadius: 8, padding: "4px 10px" }}>
              <b>{c.label}:</b> {valor != null ? valor.toFixed(1) : "-"}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">Relatório Analítico de Inspeção de Recebimento</h2>

      {relatorio.porFornecedor.length === 0 && (
        <div className="empty-state">Nenhuma inspeção de recebimento registrada ainda.</div>
      )}

      {relatorio.porFornecedor.length > 0 && (
        <TabView>
          <TabPanel header="Por Fornecedor">
            <DataTable
              value={relatorio.porFornecedor}
              size="small"
              stripedRows
              expandedRows={expandedFornecedor}
              onRowToggle={(e) => setExpandedFornecedor(e.data)}
              rowExpansionTemplate={(r) => (
                <div style={{ padding: "12px 24px", background: "#fafbfc" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Média por critério:</div>
                  {renderCriterios(r.mediaPorCriterio)}
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 12, marginBottom: 6 }}>Histórico de avaliações:</div>
                  {r.avaliacoes.map((a, i) => (
                    <div key={i} className="apontamento-item">
                      {formatDate(a.data)} — {a.mpDescricao} — Lote {a.lote || "-"} — NF {a.nf || "-"} — Média: <b>{a.media.toFixed(1)}</b>
                    </div>
                  ))}
                </div>
              )}
              dataKey="fornecedor"
            >
              <Column expander style={{ width: "3rem" }} />
              <Column field="fornecedor" header="Fornecedor" body={(r) => <b>{r.fornecedor}</b>} />
              <Column field="totalAvaliacoes" header="Nº Avaliações" />
              <Column
                header="Média Geral"
                body={(r) => (r.mediaGeral != null ? <Rating value={Math.round(r.mediaGeral)} readOnly cancel={false} /> : "-")}
              />
              <Column
                header="Classificação"
                body={(r) => {
                  const cor = corClassificacao(r.classificacao);
                  return <Tag value={r.classificacao} style={{ background: cor.bg, color: cor.color }} />;
                }}
              />
            </DataTable>
          </TabPanel>

          <TabPanel header="Por Matéria-Prima">
            <DataTable
              value={relatorio.porMP}
              size="small"
              stripedRows
              expandedRows={expandedMP}
              onRowToggle={(e) => setExpandedMP(e.data)}
              rowExpansionTemplate={(r) => (
                <div style={{ padding: "12px 24px", background: "#fafbfc" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Média por critério:</div>
                  {renderCriterios(r.mediaPorCriterio)}
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 12, marginBottom: 6 }}>Histórico de avaliações:</div>
                  {r.avaliacoes.map((a, i) => (
                    <div key={i} className="apontamento-item">
                      {formatDate(a.data)} — Lote {a.lote || "-"} — NF {a.nf || "-"} — Validade {a.validade || "-"} — Média:{" "}
                      <b>{a.media.toFixed(1)}</b>
                    </div>
                  ))}
                </div>
              )}
              dataKey="codigoEspecifico"
            >
              <Column expander style={{ width: "3rem" }} />
              <Column
                header="Código Específico"
                body={(r) => <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#854f0b" }}>{r.codigoEspecifico}</span>}
              />
              <Column field="descricaoEspecifica" header="Descrição" />
              <Column field="fornecedor" header="Fornecedor" />
              <Column field="totalAvaliacoes" header="Nº Avaliações" />
              <Column
                header="Média Geral"
                body={(r) => (r.mediaGeral != null ? <Rating value={Math.round(r.mediaGeral)} readOnly cancel={false} /> : "-")}
              />
              <Column
                header="Classificação"
                body={(r) => {
                  const cor = corClassificacao(r.classificacao);
                  return <Tag value={r.classificacao} style={{ background: cor.bg, color: cor.color }} />;
                }}
              />
            </DataTable>
          </TabPanel>
        </TabView>
      )}
    </div>
  );
}
