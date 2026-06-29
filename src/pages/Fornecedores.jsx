import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { useApp } from "../context/AppContext.jsx";
import { gerarRelatorioInspecao, corClassificacao } from "../utils/helpers.js";

const EMPTY_FORM = { nome: "", cnpj: "", contato: "" };

export default function Fornecedores() {
  const { fornecedores, setFornecedores, movs, mp, showToast, user } = useApp();
  const [dialogMode, setDialogMode] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const relatorio = gerarRelatorioInspecao(movs, mp, fornecedores);

  function classificacaoDoFornecedor(fornecedorId) {
    return relatorio.porFornecedor.find((r) => r.fornecedorId === fornecedorId);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setDialogMode("add");
  }

  function openEdit(f) {
    setForm({ ...f });
    setDialogMode("edit");
  }

  function save() {
    if (!form.nome || !form.cnpj) {
      showToast("error", "Erro", "Preencha nome e CNPJ");
      return;
    }
    if (dialogMode === "add") {
      setFornecedores((prev) => [...prev, { ...form, id: Date.now() }]);
      showToast("success", "Sucesso", "Fornecedor cadastrado!");
    } else {
      setFornecedores((prev) => prev.map((f) => (f.id === form.id ? { ...form } : f)));
      showToast("success", "Sucesso", "Fornecedor atualizado!");
    }
    setDialogMode(null);
  }

  return (
    <div>
      <div className="section-flex-header">
        <h2 className="page-title" style={{ margin: 0 }}>
          Fornecedores
        </h2>
        {user.role === "admin" && <Button label="Cadastrar" icon="pi pi-plus" onClick={openAdd} />}
      </div>

      <div className="op-card" style={{ padding: 0 }}>
        <DataTable value={fornecedores} size="small" stripedRows paginator rows={10}>
          <Column field="nome" header="Nome" body={(r) => <b>{r.nome}</b>} />
          <Column field="cnpj" header="CNPJ" />
          <Column field="contato" header="Contato" />
          <Column
            header="Avaliações"
            body={(r) => {
              const c = classificacaoDoFornecedor(r.id);
              return c ? c.totalAvaliacoes : 0;
            }}
          />
          <Column
            header="Média (1-5)"
            body={(r) => {
              const c = classificacaoDoFornecedor(r.id);
              return c?.mediaGeral != null ? (
                <Rating value={Math.round(c.mediaGeral)} readOnly cancel={false} />
              ) : (
                <span style={{ color: "#aaa", fontSize: 12 }}>Sem avaliação</span>
              );
            }}
          />
          <Column
            header="Classificação"
            body={(r) => {
              const c = classificacaoDoFornecedor(r.id);
              const classificacao = c?.classificacao || "Sem avaliação";
              const cor = corClassificacao(classificacao);
              return <Tag value={classificacao} style={{ background: cor.bg, color: cor.color }} />;
            }}
          />
          {user.role === "admin" && (
            <Column header="" body={(r) => <Button icon="pi pi-pencil" text size="small" onClick={() => openEdit(r)} />} />
          )}
        </DataTable>
      </div>

      <Dialog
        header={dialogMode === "add" ? "Cadastrar Fornecedor" : "Editar Fornecedor"}
        visible={!!dialogMode}
        style={{ width: 440 }}
        onHide={() => setDialogMode(null)}
      >
        <div className="field-block">
          <label className="field-label">Nome</label>
          <InputText value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} style={{ width: "100%" }} />
        </div>
        <div className="field-block">
          <label className="field-label">CNPJ</label>
          <InputText value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))} style={{ width: "100%" }} placeholder="00.000.000/0000-00" />
        </div>
        <div className="field-block">
          <label className="field-label">Contato</label>
          <InputText value={form.contato} onChange={(e) => setForm((f) => ({ ...f, contato: e.target.value }))} style={{ width: "100%" }} placeholder="E-mail ou telefone" />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setDialogMode(null)} />
          <Button label="Salvar" onClick={save} />
        </div>
      </Dialog>
    </div>
  );
}
