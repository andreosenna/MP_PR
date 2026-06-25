import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { useApp } from "../context/AppContext.jsx";
import { formatDate } from "../utils/helpers.js";

const EMPTY_FORM = { mpId: null, tipo: "Entrada", qtd: null, obs: "" };

export default function Estoque() {
  const { mp, setMp, movs, setMovs, showToast, user } = useApp();
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const mpOptions = mp.map((m) => ({ label: `${m.nome} (Estoque: ${m.estoque} ${m.unidade})`, value: m.id }));

  function salvar() {
    if (!form.mpId || !form.qtd || form.qtd <= 0) {
      showToast("error", "Erro", "Preencha todos os campos corretamente");
      return;
    }
    const mpItem = mp.find((m) => m.id === form.mpId);
    if (form.tipo === "Saída" && form.qtd > mpItem.estoque) {
      showToast("error", "Erro", "Estoque insuficiente para esta saída");
      return;
    }

    setMp((prev) =>
      prev.map((m) =>
        m.id === form.mpId ? { ...m, estoque: m.estoque + (form.tipo === "Entrada" ? form.qtd : -form.qtd) } : m
      )
    );

    setMovs((prev) => [
      ...prev,
      {
        id: Date.now(),
        mpId: form.mpId,
        tipo: form.tipo,
        qtd: form.qtd,
        data: new Date().toISOString(),
        responsavel: user.username,
        obs: form.obs,
      },
    ]);

    showToast("success", "Sucesso", `${form.tipo} registrada com sucesso!`);
    setVisible(false);
    setForm(EMPTY_FORM);
  }

  const movsOrdenadas = [...movs].reverse();

  return (
    <div>
      <div className="section-flex-header">
        <h2 className="page-title" style={{ margin: 0 }}>
          Movimentação de Estoque
        </h2>
        {user.role === "admin" && (
          <Button label="Movimentação" icon="pi pi-plus" onClick={() => setVisible(true)} />
        )}
      </div>

      <div className="op-card" style={{ padding: 0 }}>
        <DataTable value={movsOrdenadas} size="small" stripedRows paginator rows={10}>
          <Column field="data" header="Data" body={(r) => formatDate(r.data)} />
          <Column
            header="Matéria-Prima"
            body={(r) => {
              const item = mp.find((x) => x.id === r.mpId);
              return <b>{item?.nome || "-"}</b>;
            }}
          />
          <Column
            field="tipo"
            header="Tipo"
            body={(r) => (
              <Tag
                value={r.tipo}
                style={{
                  background: r.tipo === "Entrada" ? "#eaf3de" : "#fcebeb",
                  color: r.tipo === "Entrada" ? "#3b6d11" : "#a32d2d",
                }}
              />
            )}
          />
          <Column
            header="Quantidade"
            body={(r) => {
              const item = mp.find((x) => x.id === r.mpId);
              return (
                <span style={{ fontWeight: 600, color: r.tipo === "Entrada" ? "#3b6d11" : "#a32d2d" }}>
                  {r.tipo === "Entrada" ? "+" : "-"}
                  {r.qtd} {item?.unidade}
                </span>
              );
            }}
          />
          <Column field="responsavel" header="Responsável" />
          <Column field="obs" header="Observação" body={(r) => r.obs || "-"} />
        </DataTable>
      </div>

      <Dialog header="Registrar Movimentação" visible={visible} style={{ width: 440 }} onHide={() => setVisible(false)}>
        <div className="field-block">
          <label className="field-label">Matéria-Prima</label>
          <Dropdown
            value={form.mpId}
            options={mpOptions}
            onChange={(e) => setForm((f) => ({ ...f, mpId: e.value }))}
            placeholder="Selecione..."
            style={{ width: "100%" }}
            filter
          />
        </div>

        <div className="field-block">
          <label className="field-label">Tipo</label>
          <Dropdown
            value={form.tipo}
            options={["Entrada", "Saída"]}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.value }))}
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Quantidade</label>
          <InputNumber
            value={form.qtd}
            onValueChange={(e) => setForm((f) => ({ ...f, qtd: e.value }))}
            placeholder="0"
            style={{ width: "100%" }}
            inputStyle={{ width: "100%" }}
            min={0}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Observação</label>
          <InputTextarea
            value={form.obs}
            onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
            placeholder="NF, motivo, etc."
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setVisible(false)} />
          <Button label="Registrar" onClick={salvar} />
        </div>
      </Dialog>
    </div>
  );
}
