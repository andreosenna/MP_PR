import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { useApp } from "../context/AppContext.jsx";
import { TIPOS_MP, UNIDADES } from "../utils/data.js";

const EMPTY_FORM = { tipo: "", nome: "", unidade: "kg", local: "" };

export default function MateriasPrimas() {
  const { mp, setMp, showToast, user } = useApp();
  const [dialogMode, setDialogMode] = useState(null); // "add" | "edit" | null
  const [form, setForm] = useState(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setDialogMode("add");
  }

  function openEdit(item) {
    setForm({ ...item });
    setDialogMode("edit");
  }

  function save() {
    if (!form.tipo || !form.nome || !form.local) {
      showToast("error", "Erro", "Preencha todos os campos");
      return;
    }
    if (dialogMode === "add") {
      setMp((prev) => [...prev, { ...form, id: Date.now(), estoque: 0 }]);
      showToast("success", "Sucesso", "Matéria-prima cadastrada!");
    } else {
      setMp((prev) => prev.map((m) => (m.id === form.id ? { ...form } : m)));
      showToast("success", "Sucesso", "Matéria-prima atualizada!");
    }
    setDialogMode(null);
  }

  return (
    <div>
      <div className="section-flex-header">
        <h2 className="page-title" style={{ margin: 0 }}>
          Matérias-Primas &amp; Aditivos
        </h2>
        {user.role === "admin" && <Button label="Cadastrar" icon="pi pi-plus" onClick={openAdd} />}
      </div>

      <div className="op-card" style={{ padding: 0 }}>
        <DataTable value={mp} size="small" stripedRows paginator rows={10}>
          <Column
            field="tipo"
            header="Tipo"
            body={(r) => <Tag value={r.tipo} style={{ background: "#e6f1fb", color: "#185fa5" }} />}
          />
          <Column field="nome" header="Nome" body={(r) => <b>{r.nome}</b>} />
          <Column field="unidade" header="Unidade" />
          <Column
            field="estoque"
            header="Estoque"
            body={(r) => (
              <span style={{ fontWeight: 600, color: r.estoque < 100 ? "#a32d2d" : "#3b6d11" }}>
                {r.estoque.toLocaleString("pt-BR")} {r.unidade}
              </span>
            )}
          />
          <Column field="local" header="Local de Armazenamento" />
          {user.role === "admin" && (
            <Column
              header=""
              body={(r) => (
                <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(r)} />
              )}
            />
          )}
        </DataTable>
      </div>

      <Dialog
        header={dialogMode === "add" ? "Cadastrar Matéria-Prima" : "Editar Matéria-Prima"}
        visible={!!dialogMode}
        style={{ width: 420 }}
        onHide={() => setDialogMode(null)}
      >
        <div className="field-block">
          <label className="field-label">Tipo</label>
          <Dropdown
            value={form.tipo}
            options={TIPOS_MP}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.value }))}
            placeholder="Selecione..."
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Nome</label>
          <InputText
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Nome da matéria-prima"
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Unidade</label>
          <Dropdown
            value={form.unidade}
            options={UNIDADES}
            onChange={(e) => setForm((f) => ({ ...f, unidade: e.value }))}
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Local de Armazenamento</label>
          <InputText
            value={form.local}
            onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
            placeholder="Ex: Galpão A - Prateleira 1"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setDialogMode(null)} />
          <Button label="Salvar" onClick={save} />
        </div>
      </Dialog>
    </div>
  );
}
