import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import StatusBadge from "../components/StatusBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { gerarOP, formatDate } from "../utils/helpers.js";

const EMPTY_ITEM = () => ({ mpId: null, qtd: null });

export default function Formulas({ tipo }) {
  const { mp, setMp, ops, setOps, movs, setMovs, showToast, user } = useApp();
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [itens, setItens] = useState([EMPTY_ITEM()]);

  const formulasDoTipo = ops.filter((o) => o.tipo === tipo);
  const mpOptions = mp.map((m) => ({ label: m.nome, value: m.id }));

  function abrirModal() {
    setForm({ nome: "", descricao: "" });
    setItens([EMPTY_ITEM()]);
    setVisible(true);
  }

  function addItem() {
    setItens((i) => [...i, EMPTY_ITEM()]);
  }

  function removeItem(idx) {
    setItens((i) => i.filter((_, j) => j !== idx));
  }

  function updateItem(idx, key, val) {
    setItens((i) => i.map((it, j) => (j === idx ? { ...it, [key]: val } : it)));
  }

  function criarOP() {
    if (!form.nome) {
      showToast("error", "Erro", "Informe o nome da fórmula");
      return;
    }
    if (itens.some((i) => !i.mpId || !i.qtd || i.qtd <= 0)) {
      showToast("error", "Erro", "Preencha todos os itens da fórmula");
      return;
    }

    const novaOP = {
      id: Date.now(),
      op: gerarOP(),
      tipo,
      nome: form.nome,
      descricao: form.descricao,
      itens: itens.map((i) => ({ mpId: i.mpId, qtd: i.qtd })),
      status: "Aberta",
      criadoPor: user.username,
      criadoEm: new Date().toISOString(),
      apontamentos: [],
      qtdProduzida: null,
    };

    setOps((prev) => [...prev, novaOP]);
    showToast("success", "OP criada", `OP ${novaOP.op} criada com sucesso!`);
    setVisible(false);
  }

  function baixarMP(op) {
    const problemas = op.itens
      .map((it) => {
        const m = mp.find((x) => x.id === it.mpId);
        return m && m.estoque < it.qtd
          ? `${m.nome}: necessário ${it.qtd} ${m.unidade}, disponível ${m.estoque}`
          : null;
      })
      .filter(Boolean);

    if (problemas.length) {
      showToast("error", "Estoque insuficiente", problemas.join("; "));
      return;
    }

    setMp((prev) =>
      prev.map((m) => {
        const it = op.itens.find((i) => i.mpId === m.id);
        return it ? { ...m, estoque: m.estoque - it.qtd } : m;
      })
    );

    setMovs((prev) => [
      ...prev,
      ...op.itens.map((it) => ({
        id: Date.now() + it.mpId,
        mpId: it.mpId,
        tipo: "Saída",
        qtd: it.qtd,
        data: new Date().toISOString(),
        responsavel: user.username,
        obs: `Baixa OP ${op.op}`,
      })),
    ]);

    setOps((prev) =>
      prev.map((o) => (o.id === op.id ? { ...o, status: "Em Andamento", baixaEm: new Date().toISOString() } : o))
    );

    showToast("success", "Baixa realizada", `Baixa de MP realizada para OP ${op.op}`);
  }

  const tipoIcon = tipo === "Extrusão" ? "pi pi-cog" : "pi pi-blender";

  return (
    <div>
      <div className="section-flex-header">
        <h2 className="page-title" style={{ margin: 0 }}>
          Fórmulas de {tipo}
        </h2>
        <Button label="Nova Fórmula / OP" icon="pi pi-plus" onClick={abrirModal} />
      </div>

      {formulasDoTipo.length === 0 && (
        <div className="empty-state">Nenhuma fórmula de {tipo} criada ainda.</div>
      )}

      {formulasDoTipo.map((op) => (
        <div key={op.id} className="op-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div className="op-code" style={{ marginBottom: 4 }}>
                {op.op}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, color: "#1b3a5c" }}>
                <i className={tipoIcon} style={{ marginRight: 6, fontSize: 14 }} />
                {op.nome}
              </div>
              {op.descricao && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{op.descricao}</div>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <StatusBadge status={op.status} />
              {op.status === "Aberta" && (
                <Button label="Baixar MP" icon="pi pi-arrow-down" severity="warning" size="small" onClick={() => baixarMP(op)} />
              )}
            </div>
          </div>

          <div>
            {op.itens.map((it, i) => {
              const m = mp.find((x) => x.id === it.mpId);
              return (
                <span key={i} className="op-item-pill">
                  {m?.nome || "?"}: <b>{it.qtd} {m?.unidade}</b>
                </span>
              );
            })}
          </div>

          <div style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>
            Criado em {formatDate(op.criadoEm)} por {op.criadoPor}
          </div>
        </div>
      ))}

      <Dialog header={`Nova Fórmula de ${tipo}`} visible={visible} style={{ width: 560 }} onHide={() => setVisible(false)}>
        <Message
          severity="info"
          text="A OP será gerada automaticamente com 11 caracteres."
          style={{ width: "100%", marginBottom: 16 }}
        />

        <div className="field-block">
          <label className="field-label">Nome da Fórmula</label>
          <InputText
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder={tipo === "Extrusão" ? "Ex: Composto PP-01" : "Ex: Mistura Injeção M-02"}
            style={{ width: "100%" }}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Descrição (opcional)</label>
          <InputTextarea
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            rows={2}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ fontWeight: 600, fontSize: 14, color: "#1b3a5c", marginBottom: 8 }}>Composição</div>

        {itens.map((it, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <Dropdown
              value={it.mpId}
              options={mpOptions}
              onChange={(e) => updateItem(idx, "mpId", e.value)}
              placeholder="Selecione a MP..."
              style={{ flex: 2 }}
              filter
            />
            <InputNumber
              value={it.qtd}
              onValueChange={(e) => updateItem(idx, "qtd", e.value)}
              placeholder="Qtd"
              style={{ flex: 1 }}
              inputStyle={{ width: "100%" }}
              min={0}
            />
            <Button icon="pi pi-times" severity="danger" text onClick={() => removeItem(idx)} />
          </div>
        ))}

        <Button label="Adicionar Item" icon="pi pi-plus" size="small" outlined onClick={addItem} style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setVisible(false)} />
          <Button label="Criar OP" onClick={criarOP} />
        </div>
      </Dialog>
    </div>
  );
}
