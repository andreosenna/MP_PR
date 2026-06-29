import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import StatusBadge from "../components/StatusBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { formatDate } from "../utils/helpers.js";

const FILTROS = ["Todas", "Aberta", "Em Andamento", "Encerrada", "Concluída"];

export default function OPsAdmin() {
  const { ops, setOps, mp, showToast } = useApp();
  const [editingOP, setEditingOP] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", descricao: "" });
  const [filtro, setFiltro] = useState("Todas");

  const opsFiltradas = filtro === "Todas" ? ops : ops.filter((o) => o.status === filtro);

  function openEdit(op) {
    setEditForm({ nome: op.nome, descricao: op.descricao || "" });
    setEditingOP(op);
  }

  function salvarEdit() {
    setOps((prev) =>
      prev.map((o) => (o.id === editingOP.id ? { ...o, nome: editForm.nome, descricao: editForm.descricao } : o))
    );
    showToast("success", "Sucesso", "OP atualizada!");
    setEditingOP(null);
  }

  function concluir(op) {
    setOps((prev) =>
      prev.map((o) => (o.id === op.id ? { ...o, status: "Concluída", concluidoEm: new Date().toISOString() } : o))
    );
    showToast("success", "Concluída", `OP ${op.op} concluída!`);
  }

  return (
    <div>
      <div className="section-flex-header">
        <h2 className="page-title" style={{ margin: 0 }}>
          Ordens de Produção
        </h2>
        <SelectButton value={filtro} options={FILTROS} onChange={(e) => e.value && setFiltro(e.value)} />
      </div>

      {opsFiltradas.length === 0 && <div className="empty-state">Nenhuma OP encontrada.</div>}

      {opsFiltradas.map((op) => {
        const totalGeral = op.itens.reduce((sum, it) => sum + (Number(it.qtdBatelada) || 0) * op.numeroBateladas, 0);
        const bateladasConcluidas = op.bateladasConcluidas || 0;

        return (
          <div key={op.id} className="op-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span className="op-code">{op.op}</span>
                  <StatusBadge status={op.status} />
                  <Tag value={op.tipo} style={{ background: "#e6f1fb", color: "#185fa5" }} />
                  <Tag
                    value={`Batelada ${bateladasConcluidas}/${op.numeroBateladas}`}
                    style={{
                      background: bateladasConcluidas >= op.numeroBateladas ? "#eaf3de" : "#fae8da",
                      color: bateladasConcluidas >= op.numeroBateladas ? "#3b6d11" : "#854f0b",
                    }}
                  />
                </div>

                <div style={{ fontWeight: 600, fontSize: 15, color: "#1b3a5c" }}>{op.nome}</div>
                {op.descricao && <div style={{ fontSize: 13, color: "#888" }}>{op.descricao}</div>}

                <div style={{ display: "flex", gap: 16, marginTop: 8, marginBottom: 8, fontSize: 13 }}>
                  <span>
                    <b>Total da fórmula:</b> {totalGeral.toLocaleString("pt-BR")}
                  </span>
                </div>

                {op.produtoGerado && (
                  <div style={{ fontSize: 12, background: "#f7faff", border: "1px solid #e1ecfb", borderRadius: 8, padding: "6px 10px", marginBottom: 8, color: "#185fa5" }}>
                    <i className="pi pi-box" style={{ marginRight: 4 }} />
                    Gera produto intermediário: <b>{op.produtoGerado.codigoEspecifico}</b> — {op.produtoGerado.descricaoEspecifica}
                  </div>
                )}

                <div style={{ marginBottom: 8 }}>
                  {op.itens.map((it, i) => {
                    let label, unidade;
                    if (it.modo === "Específico") {
                      const m = mp.find((x) => x.id === it.mpId);
                      label = m?.codigoEspecifico || "?";
                      unidade = m?.unidade || "";
                    } else {
                      label = it.codigoComum;
                      unidade = mp.find((m) => m.codigoComum === it.codigoComum)?.unidade || "";
                    }
                    const total = (Number(it.qtdBatelada) || 0) * op.numeroBateladas;
                    return (
                      <span key={i} className="op-item-pill">
                        <Tag
                          value={it.modo}
                          style={{
                            background: it.modo === "Específico" ? "#fae8da" : "#e1ecfb",
                            color: it.modo === "Específico" ? "#854f0b" : "#185fa5",
                            fontSize: 10,
                            marginRight: 4,
                          }}
                        />
                        {label}: <b>{it.qtdBatelada}</b>/batelada → <b>{total} {unidade}</b> total
                      </span>
                    );
                  })}
                </div>

                {op.apontamentos?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>
                      Apontamentos ({op.apontamentos.length}):
                    </div>
                    {op.apontamentos.map((a, i) => (
                      <div key={i} className="apontamento-item">
                        <b>{a.operador}</b> em {formatDate(a.horario)} — Batelada {a.batelada}/{op.numeroBateladas}: {a.obs}
                        {a.baixas?.length > 0 && (
                          <div style={{ marginTop: 2, color: "#854f0b" }}>
                            Baixa: {a.baixas.map((b) => `${b.codigoEspecifico} (${b.qtd} ${b.unidade})`).join(", ")}
                          </div>
                        )}
                        {a.credito && (
                          <div style={{ marginTop: 2, color: "#185fa5" }}>
                            Crédito: {a.credito.codigoEspecifico} (+{a.credito.qtd} {a.credito.unidade})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                {(op.status === "Encerrada" || op.status === "Em Andamento") && (
                  <Button icon="pi pi-pencil" label="Editar" size="small" severity="secondary" outlined onClick={() => openEdit(op)} />
                )}
                {op.status === "Encerrada" && (
                  <Button icon="pi pi-check" label="Concluir" size="small" severity="success" onClick={() => concluir(op)} />
                )}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>
              Criado em {formatDate(op.criadoEm)} por {op.criadoPor}
            </div>
          </div>
        );
      })}

      <Dialog
        header={editingOP ? `Editar OP: ${editingOP.op}` : ""}
        visible={!!editingOP}
        style={{ width: 460 }}
        onHide={() => setEditingOP(null)}
      >
        <div className="field-block">
          <label className="field-label">Nome</label>
          <InputText
            value={editForm.nome}
            onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Descrição</label>
          <InputTextarea
            value={editForm.descricao}
            onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))}
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setEditingOP(null)} />
          <Button label="Salvar" onClick={salvarEdit} />
        </div>
      </Dialog>
    </div>
  );
}
