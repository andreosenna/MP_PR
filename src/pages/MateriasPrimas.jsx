import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { useApp } from "../context/AppContext.jsx";
import { TIPOS_MP, UNIDADES } from "../utils/data.js";

const EMPTY_FORM = {
  tipo: "",
  codigoComum: "",
  descricaoComum: "",
  codigoEspecifico: "",
  descricaoEspecifica: "",
  fornecedorId: null,
  unidade: "kg",
  local: "",
};

export default function MateriasPrimas() {
  const { mp, setMp, fornecedores, showToast, user } = useApp();
  const [dialogMode, setDialogMode] = useState(null); // "add" | "edit" | null
  const [form, setForm] = useState(EMPTY_FORM);

  // Sugestões de código comum já cadastrados, para reaproveitar entre fornecedores diferentes
  const codigosComunsExistentes = [...new Map(mp.map((m) => [m.codigoComum, m])).values()];
  const fornecedorOptions = fornecedores.map((f) => ({ label: f.nome, value: f.id }));

  function nomeFornecedor(fornecedorId) {
    return fornecedores.find((f) => f.id === fornecedorId)?.nome || "-";
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setDialogMode("add");
  }

  function openEdit(item) {
    setForm({ ...item });
    setDialogMode("edit");
  }

  function selecionarComumExistente(codigoComum) {
    const existente = mp.find((m) => m.codigoComum === codigoComum);
    if (existente) {
      setForm((f) => ({
        ...f,
        codigoComum: existente.codigoComum,
        descricaoComum: existente.descricaoComum,
        tipo: existente.tipo,
        unidade: existente.unidade,
      }));
    } else {
      setForm((f) => ({ ...f, codigoComum }));
    }
  }

  function save() {
    if (!form.tipo || !form.codigoComum || !form.descricaoComum || !form.codigoEspecifico || !form.descricaoEspecifica || !form.fornecedorId || !form.local) {
      showToast("error", "Erro", "Preencha todos os campos obrigatórios, incluindo o fornecedor");
      return;
    }

    const duplicado = mp.some((m) => m.codigoEspecifico === form.codigoEspecifico && m.id !== form.id);
    if (duplicado) {
      showToast("error", "Erro", "Já existe um item com este código específico");
      return;
    }

    if (dialogMode === "add") {
      setMp((prev) => [...prev, { ...form, id: Date.now(), estoque: 0, origem: "Compra" }]);
      showToast("success", "Sucesso", "Matéria-prima cadastrada!");
    } else {
      setMp((prev) => prev.map((m) => (m.id === form.id ? { ...m, ...form } : m)));
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
          <Column
            header="Código Comum"
            body={(r) => <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{r.codigoComum}</span>}
          />
          <Column field="descricaoComum" header="Descrição Comum" />
          <Column
            header="Código Específico"
            body={(r) => <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#854f0b" }}>{r.codigoEspecifico}</span>}
          />
          <Column field="descricaoEspecifica" header="Descrição Específica" />
          <Column
            header="Fornecedor"
            body={(r) => (r.fornecedorId ? nomeFornecedor(r.fornecedorId) : <span style={{ color: "#aaa" }}>Interno</span>)}
          />
          <Column
            field="origem"
            header="Origem"
            body={(r) => (
              <Tag
                value={r.origem || "Compra"}
                style={{ background: r.origem === "Extrusão" ? "#e1ecfb" : "#f0f4f8", color: r.origem === "Extrusão" ? "#185fa5" : "#555" }}
              />
            )}
          />
          <Column
            field="estoque"
            header="Estoque (específico)"
            body={(r) => (
              <span style={{ fontWeight: 600, color: r.estoque < 100 ? "#a32d2d" : "#3b6d11" }}>
                {r.estoque.toLocaleString("pt-BR")} {r.unidade}
              </span>
            )}
          />
          <Column field="local" header="Local" />
          {user.role === "admin" && (
            <Column header="" body={(r) => <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(r)} />} />
          )}
        </DataTable>
      </div>

      <Dialog
        header={dialogMode === "add" ? "Cadastrar Matéria-Prima" : "Editar Matéria-Prima"}
        visible={!!dialogMode}
        style={{ width: 520 }}
        onHide={() => setDialogMode(null)}
      >
        <Message
          severity="info"
          text="O código comum agrega o estoque de itens equivalentes de fornecedores diferentes. O código específico identifica o item de um fornecedor e controla o estoque real."
          style={{ width: "100%", marginBottom: 16 }}
        />

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

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field-block" style={{ flex: 1 }}>
            <label className="field-label">Código Comum</label>
            <Dropdown
              value={form.codigoComum}
              options={codigosComunsExistentes.map((m) => ({ label: m.codigoComum, value: m.codigoComum }))}
              onChange={(e) => selecionarComumExistente(e.value)}
              editable
              onInput={(e) => setForm((f) => ({ ...f, codigoComum: e.target.value }))}
              placeholder="Ex: PP-001"
              style={{ width: "100%" }}
            />
          </div>
          <div className="field-block" style={{ flex: 1 }}>
            <label className="field-label">Código Específico</label>
            <InputText
              value={form.codigoEspecifico}
              onChange={(e) => setForm((f) => ({ ...f, codigoEspecifico: e.target.value }))}
              placeholder="Ex: PP-001-BRA"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="field-block">
          <label className="field-label">Descrição Comum</label>
          <InputText
            value={form.descricaoComum}
            onChange={(e) => setForm((f) => ({ ...f, descricaoComum: e.target.value }))}
            placeholder="Ex: PP Homopolímero"
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Descrição Específica</label>
          <InputText
            value={form.descricaoEspecifica}
            onChange={(e) => setForm((f) => ({ ...f, descricaoEspecifica: e.target.value }))}
            placeholder="Ex: PP Homopolímero - Braskem H503"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field-block" style={{ flex: 1 }}>
            <label className="field-label">Fornecedor</label>
            <Dropdown
              value={form.fornecedorId}
              options={fornecedorOptions}
              onChange={(e) => setForm((f) => ({ ...f, fornecedorId: e.value }))}
              placeholder="Selecione..."
              style={{ width: "100%" }}
              filter
            />
          </div>
          <div className="field-block" style={{ flex: 1 }}>
            <label className="field-label">Unidade</label>
            <Dropdown
              value={form.unidade}
              options={UNIDADES}
              onChange={(e) => setForm((f) => ({ ...f, unidade: e.value }))}
              style={{ width: "100%" }}
            />
          </div>
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
