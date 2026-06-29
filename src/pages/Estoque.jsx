import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Rating } from "primereact/rating";
import { Tag } from "primereact/tag";
import { TabView, TabPanel } from "primereact/tabview";
import { Message } from "primereact/message";
import { useApp } from "../context/AppContext.jsx";
import { formatDate, listarCodigosComuns, mediaInspecao } from "../utils/helpers.js";
import { CRITERIOS_INSPECAO } from "../utils/data.js";

const EMPTY_INSPECAO = { qualidade: 0, preco: 0, quantidade: 0, prazo: 0, validade: 0, fluidez: 0 };
const EMPTY_FORM = {
  mpId: null,
  tipo: "Entrada",
  qtd: null,
  obs: "",
  lote: "",
  nf: "",
  validade: null,
  fluidez: "",
  inspecao: { ...EMPTY_INSPECAO },
};

export default function Estoque() {
  const { mp, setMp, movs, setMovs, fornecedores, showToast, user } = useApp();
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const mpOptions = mp.map((m) => ({
    label: `${m.codigoEspecifico} — ${m.descricaoEspecifica} (Estoque: ${m.estoque} ${m.unidade})`,
    value: m.id,
  }));

  const comuns = listarCodigosComuns(mp);
  const isEntrada = form.tipo === "Entrada";

  function nomeFornecedor(mpId) {
    const item = mp.find((m) => m.id === mpId);
    return fornecedores.find((f) => f.id === item?.fornecedorId)?.nome || "-";
  }

  function abrirModal() {
    setForm(EMPTY_FORM);
    setVisible(true);
  }

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

    if (isEntrada) {
      const algumCriterioZerado = CRITERIOS_INSPECAO.some((c) => !form.inspecao[c.key] || form.inspecao[c.key] < 1);
      if (algumCriterioZerado) {
        showToast("error", "Erro", "Avalie todos os critérios da inspeção (1 a 5)");
        return;
      }
      if (!form.lote || !form.nf) {
        showToast("error", "Erro", "Informe lote e número da NF");
        return;
      }
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
        ...(isEntrada
          ? {
              lote: form.lote,
              nf: form.nf,
              validade: form.validade ? form.validade.toISOString().slice(0, 10) : null,
              fluidez: form.fluidez,
              inspecao: { ...form.inspecao },
            }
          : {}),
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
        {user.role === "admin" && <Button label="Movimentação" icon="pi pi-plus" onClick={abrirModal} />}
      </div>

      <TabView>
        <TabPanel header="Por código específico">
          <div className="op-card" style={{ padding: 0 }}>
            <DataTable value={mp} size="small" stripedRows paginator rows={10}>
              <Column
                header="Código Específico"
                body={(r) => <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#854f0b" }}>{r.codigoEspecifico}</span>}
              />
              <Column field="descricaoEspecifica" header="Descrição Específica" />
              <Column header="Fornecedor" body={(r) => nomeFornecedor(r.id)} />
              <Column header="Código Comum" body={(r) => <span style={{ fontFamily: "monospace" }}>{r.codigoComum}</span>} />
              <Column field="origem" header="Origem" body={(r) => <Tag value={r.origem} style={{ background: r.origem === "Extrusão" ? "#e1ecfb" : "#f0f4f8", color: r.origem === "Extrusão" ? "#185fa5" : "#555" }} />} />
              <Column
                field="estoque"
                header="Estoque"
                body={(r) => (
                  <span style={{ fontWeight: 600, color: r.estoque < 100 ? "#a32d2d" : "#3b6d11" }}>
                    {r.estoque.toLocaleString("pt-BR")} {r.unidade}
                  </span>
                )}
              />
            </DataTable>
          </div>
        </TabPanel>

        <TabPanel header="Por código comum (agregado)">
          <div className="op-card" style={{ padding: 0 }}>
            <DataTable value={comuns} size="small" stripedRows>
              <Column header="Código Comum" body={(r) => <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{r.codigoComum}</span>} />
              <Column field="descricaoComum" header="Descrição Comum" />
              <Column
                header="Fornecedores"
                body={(r) => (
                  <div>
                    {r.especificos.map((e) => (
                      <Tag
                        key={e.id}
                        value={`${nomeFornecedor(e.id)}: ${e.estoque} ${e.unidade}`}
                        style={{ background: "#f0f4f8", color: "#374151", marginRight: 4, marginBottom: 4 }}
                      />
                    ))}
                  </div>
                )}
              />
              <Column
                header="Estoque Total Agregado"
                body={(r) => (
                  <span style={{ fontWeight: 700, color: r.estoqueTotal < 100 ? "#a32d2d" : "#3b6d11" }}>
                    {r.estoqueTotal.toLocaleString("pt-BR")} {r.unidade}
                  </span>
                )}
              />
            </DataTable>
          </div>
        </TabPanel>

        <TabPanel header="Histórico">
          <div className="op-card" style={{ padding: 0 }}>
            <DataTable value={movsOrdenadas} size="small" stripedRows paginator rows={10}>
              <Column field="data" header="Data" body={(r) => formatDate(r.data)} />
              <Column
                header="Código Específico"
                body={(r) => {
                  const item = mp.find((x) => x.id === r.mpId);
                  return <span style={{ fontFamily: "monospace" }}>{item?.codigoEspecifico || "-"}</span>;
                }}
              />
              <Column
                header="Descrição"
                body={(r) => {
                  const item = mp.find((x) => x.id === r.mpId);
                  return item?.descricaoEspecifica || "-";
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
              <Column field="lote" header="Lote" body={(r) => r.lote || "-"} />
              <Column field="nf" header="NF" body={(r) => r.nf || "-"} />
              <Column
                header="Inspeção (média)"
                body={(r) => {
                  if (!r.inspecao) return "-";
                  const m = mediaInspecao(r.inspecao);
                  return <Rating value={Math.round(m)} readOnly cancel={false} />;
                }}
              />
              <Column field="responsavel" header="Responsável" />
            </DataTable>
          </div>
        </TabPanel>
      </TabView>

      <Dialog header="Registrar Movimentação" visible={visible} style={{ width: 560 }} onHide={() => setVisible(false)}>
        <div className="field-block">
          <label className="field-label">Código Específico (a movimentação sempre debita/credita o item específico)</label>
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

        {isEntrada && (
          <>
            <Message
              severity="info"
              text="Entrada de matéria-prima requer inspeção de recebimento e dados complementares."
              style={{ width: "100%", marginBottom: 16 }}
            />

            <div style={{ display: "flex", gap: 12 }}>
              <div className="field-block" style={{ flex: 1 }}>
                <label className="field-label">Lote *</label>
                <InputText value={form.lote} onChange={(e) => setForm((f) => ({ ...f, lote: e.target.value }))} style={{ width: "100%" }} placeholder="Ex: L2025-0601" />
              </div>
              <div className="field-block" style={{ flex: 1 }}>
                <label className="field-label">NF *</label>
                <InputText value={form.nf} onChange={(e) => setForm((f) => ({ ...f, nf: e.target.value }))} style={{ width: "100%" }} placeholder="Número da nota fiscal" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div className="field-block" style={{ flex: 1 }}>
                <label className="field-label">Data de Validade</label>
                <Calendar
                  value={form.validade}
                  onChange={(e) => setForm((f) => ({ ...f, validade: e.value }))}
                  dateFormat="dd/mm/yy"
                  showIcon
                  style={{ width: "100%" }}
                />
              </div>
              <div className="field-block" style={{ flex: 1 }}>
                <label className="field-label">Fluidez (índice)</label>
                <InputText
                  value={form.fluidez}
                  onChange={(e) => setForm((f) => ({ ...f, fluidez: e.target.value }))}
                  style={{ width: "100%" }}
                  placeholder="Ex: 3.5 g/10min"
                />
              </div>
            </div>

            <div style={{ fontWeight: 600, fontSize: 14, color: "#1b3a5c", marginTop: 4, marginBottom: 8 }}>
              Inspeção de Recebimento (1 = péssimo, 5 = ótimo)
            </div>
            {CRITERIOS_INSPECAO.map((c) => (
              <div key={c.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{c.label}</span>
                <Rating
                  value={form.inspecao[c.key]}
                  onChange={(e) => setForm((f) => ({ ...f, inspecao: { ...f.inspecao, [c.key]: e.value } }))}
                  cancel={false}
                />
              </div>
            ))}
          </>
        )}

        <div className="field-block" style={{ marginTop: 8 }}>
          <label className="field-label">Observação</label>
          <InputTextarea
            value={form.obs}
            onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
            placeholder="Outras observações"
            rows={2}
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
