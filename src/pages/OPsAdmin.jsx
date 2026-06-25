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

      {opsFiltradas.map((op) => (
        <div key={op.id} className="op-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span className="op-code">{op.op}</span>
                <StatusBadge status={op.status} />
                <Tag value={op.tipo} style={{ background: "#e6f1fb", color: "#185fa5" }} />
              </div>

              <div style={{ fontWeight: 600, fontSize: 15, color: "#1b3a5c" }}>{op.nome}</div>
              {op.descricao && <div style={{ fontSize: 13, color: "#888" }}>{op.descricao}</div>}
              {op.qtdProduzida != null && (
                <div style={{ fontSize: 13, color: "#3b6d11", marginTop: 4 }}>
                  <i className="pi pi-check-circle" style={{ marginRight: 4 }} />
                  Produzido: <b>{op.qtdProduzida} kg</b>
                </div>
              )}

              {op.apontamentos?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>Apontamentos:</div>
                  {op.apontamentos.map((a, i) => (
                    <div key={i} className="apontamento-item">
                      <b>{a.operador}</b> em {formatDate(a.horario)}: {a.obs} {a.qtd ? `— ${a.qtd} kg produzidos` : ""}
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
      ))}

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
