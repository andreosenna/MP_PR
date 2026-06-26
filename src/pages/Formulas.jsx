import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import StatusBadge from "../components/StatusBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { formatDate, validarOP, opJaExiste, calcularTotaisFormula, listarCodigosComuns } from "../utils/helpers.js";

const EMPTY_ITEM = () => ({ modo: "Específico", mpId: null, codigoComum: null, qtdBatelada: null });

export default function Formulas({ tipo }) {
  const { mp, setMp, ops, setOps, movs, setMovs, showToast, user } = useApp();
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ op: "", nome: "", descricao: "", numeroBateladas: 1 });
  const [itens, setItens] = useState([EMPTY_ITEM()]);

  const formulasDoTipo = ops.filter((o) => o.tipo === tipo);
  const mpOptions = mp.map((m) => ({ label: `${m.codigoEspecifico} — ${m.descricaoEspecifica}`, value: m.id }));
  const comuns = listarCodigosComuns(mp);
  const comunsOptions = comuns.map((c) => ({ label: `${c.codigoComum} — ${c.descricaoComum}`, value: c.codigoComum }));

  function abrirModal() {
    setForm({ op: "", nome: "", descricao: "", numeroBateladas: 1 });
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
    setItens((i) =>
      i.map((it, j) => {
        if (j !== idx) return it;
        if (key === "modo") return { ...it, modo: val, mpId: null, codigoComum: null };
        return { ...it, [key]: val };
      })
    );
  }

  function descricaoDoItem(it) {
    if (it.modo === "Específico") {
      const m = mp.find((x) => x.id === it.mpId);
      return m ? { texto: m.descricaoEspecifica, unidade: m.unidade } : { texto: "?", unidade: "" };
    } else {
      const c = comuns.find((x) => x.codigoComum === it.codigoComum);
      return c ? { texto: c.descricaoComum, unidade: c.unidade } : { texto: "?", unidade: "" };
    }
  }

  function criarOP() {
    const erroOP = validarOP(form.op);
    if (erroOP) {
      showToast("error", "Erro", erroOP);
      return;
    }
    if (opJaExiste(ops, form.op)) {
      showToast("error", "Erro", "Já existe uma OP cadastrada com este número");
      return;
    }
    if (!form.nome) {
      showToast("error", "Erro", "Informe o nome da fórmula");
      return;
    }
    if (!form.numeroBateladas || form.numeroBateladas <= 0) {
      showToast("error", "Erro", "Informe o número de bateladas");
      return;
    }
    if (itens.some((i) => (i.modo === "Específico" ? !i.mpId : !i.codigoComum) || !i.qtdBatelada || i.qtdBatelada <= 0)) {
      showToast("error", "Erro", "Preencha todos os itens da fórmula corretamente");
      return;
    }

    const novaOP = {
      id: Date.now(),
      op: form.op.trim().toUpperCase(),
      tipo,
      nome: form.nome,
      descricao: form.descricao,
      numeroBateladas: form.numeroBateladas,
      itens: itens.map((i) => ({
        modo: i.modo,
        mpId: i.modo === "Específico" ? i.mpId : null,
        codigoComum: i.modo === "Comum" ? i.codigoComum : null,
        qtdBatelada: i.qtdBatelada,
      })),
      status: "Aberta",
      criadoPor: user.username,
      criadoEm: new Date().toISOString(),
      apontamentos: [],
      bateladasConcluidas: 0,
    };

    setOps((prev) => [...prev, novaOP]);
    showToast("success", "OP criada", `OP ${novaOP.op} criada com sucesso!`);
    setVisible(false);
  }

  function baixarMP(op) {
    // Baixa total da OP = quantidade por batelada x número de bateladas, sempre no código específico.
    // Para itens definidos por código comum, o admin precisa escolher de qual fornecedor específico sairá no momento da baixa.
    const itensComEspecifico = op.itens.filter((it) => it.modo === "Específico");
    const itensComComum = op.itens.filter((it) => it.modo === "Comum");

    if (itensComComum.length > 0) {
      showToast(
        "warn",
        "Atenção",
        "Esta fórmula possui itens por código comum. A baixa desses itens deve ser feita escolhendo o fornecedor específico na tela de Estoque."
      );
    }

    const totais = calcularTotaisFormula(itensComEspecifico, op.numeroBateladas);

    const problemas = totais
      .map((it) => {
        const m = mp.find((x) => x.id === it.mpId);
        return m && m.estoque < it.qtdTotal
          ? `${m.descricaoEspecifica}: necessário ${it.qtdTotal} ${m.unidade}, disponível ${m.estoque}`
          : null;
      })
      .filter(Boolean);

    if (problemas.length) {
      showToast("error", "Estoque insuficiente", problemas.join("; "));
      return;
    }

    setMp((prev) =>
      prev.map((m) => {
        const it = totais.find((i) => i.mpId === m.id);
        return it ? { ...m, estoque: m.estoque - it.qtdTotal } : m;
      })
    );

    setMovs((prev) => [
      ...prev,
      ...totais.map((it) => ({
        id: Date.now() + it.mpId,
        mpId: it.mpId,
        tipo: "Saída",
        qtd: it.qtdTotal,
        data: new Date().toISOString(),
        responsavel: user.username,
        obs: `Baixa OP ${op.op} (${op.numeroBateladas} bateladas)`,
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

      {formulasDoTipo.length === 0 && <div className="empty-state">Nenhuma fórmula de {tipo} criada ainda.</div>}

      {formulasDoTipo.map((op) => {
        const totais = calcularTotaisFormula(
          op.itens.filter((it) => it.modo === "Específico"),
          op.numeroBateladas
        );
        const totalGeral = op.itens.reduce((sum, it) => sum + (Number(it.qtdBatelada) || 0) * op.numeroBateladas, 0);

        return (
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

            <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 13 }}>
              <span>
                <b>Bateladas:</b> {op.numeroBateladas}
              </span>
              <span>
                <b>Total da fórmula:</b> {totalGeral.toLocaleString("pt-BR")}{" "}
                {op.itens[0]?.modo === "Específico"
                  ? mp.find((m) => m.id === op.itens[0]?.mpId)?.unidade
                  : comuns.find((c) => c.codigoComum === op.itens[0]?.codigoComum)?.unidade}
              </span>
            </div>

            <div>
              {op.itens.map((it, i) => {
                let label, unidade;
                if (it.modo === "Específico") {
                  const m = mp.find((x) => x.id === it.mpId);
                  label = m?.codigoEspecifico || "?";
                  unidade = m?.unidade || "";
                } else {
                  const c = comuns.find((x) => x.codigoComum === it.codigoComum);
                  label = c?.codigoComum || "?";
                  unidade = c?.unidade || "";
                }
                const totalItem = (Number(it.qtdBatelada) || 0) * op.numeroBateladas;
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
                    {label}: <b>{it.qtdBatelada}</b> / batelada → <b>{totalItem} {unidade}</b> total
                  </span>
                );
              })}
            </div>

            <div style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>
              Criado em {formatDate(op.criadoEm)} por {op.criadoPor}
            </div>
          </div>
        );
      })}

      <Dialog header={`Nova Fórmula de ${tipo}`} visible={visible} style={{ width: 640 }} onHide={() => setVisible(false)}>
        <Message
          severity="warn"
          text="O número da OP é gerado em outro sistema. Digite o número exato (11 caracteres) para vincular esta fórmula."
          style={{ width: "100%", marginBottom: 16 }}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <div className="field-block" style={{ flex: 1 }}>
            <label className="field-label">Número da OP (11 caracteres) *</label>
            <InputText
              value={form.op}
              onChange={(e) => setForm((f) => ({ ...f, op: e.target.value.toUpperCase() }))}
              placeholder="Ex: OP12345678X"
              maxLength={11}
              style={{ width: "100%", fontFamily: "monospace" }}
            />
            <small style={{ color: form.op.length === 11 ? "#3b6d11" : "#a32d2d" }}>
              {form.op.length}/11 caracteres
            </small>
          </div>
          <div className="field-block" style={{ flex: 1 }}>
            <label className="field-label">Número de Bateladas *</label>
            <InputNumber
              value={form.numeroBateladas}
              onValueChange={(e) => setForm((f) => ({ ...f, numeroBateladas: e.value }))}
              min={1}
              style={{ width: "100%" }}
              inputStyle={{ width: "100%" }}
            />
          </div>
        </div>

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

        <div style={{ fontWeight: 600, fontSize: 14, color: "#1b3a5c", marginBottom: 4 }}>Composição (por batelada)</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
          Informe a quantidade de cada matéria-prima necessária para <b>uma única batelada</b>. O total da OP será
          calculado automaticamente (qtd/batelada × {form.numeroBateladas || 0} bateladas).
        </div>

        {itens.map((it, idx) => {
          const { texto, unidade } = descricaoDoItem(it);
          const total = (Number(it.qtdBatelada) || 0) * (Number(form.numeroBateladas) || 0);
          return (
            <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <SelectButton
                  value={it.modo}
                  options={["Específico", "Comum"]}
                  onChange={(e) => e.value && updateItem(idx, "modo", e.value)}
                  style={{ flexShrink: 0 }}
                />
                <Button icon="pi pi-times" severity="danger" text onClick={() => removeItem(idx)} style={{ marginLeft: "auto" }} />
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {it.modo === "Específico" ? (
                  <Dropdown
                    value={it.mpId}
                    options={mpOptions}
                    onChange={(e) => updateItem(idx, "mpId", e.value)}
                    placeholder="Selecione o código específico..."
                    style={{ flex: 2 }}
                    filter
                  />
                ) : (
                  <Dropdown
                    value={it.codigoComum}
                    options={comunsOptions}
                    onChange={(e) => updateItem(idx, "codigoComum", e.value)}
                    placeholder="Selecione o código comum..."
                    style={{ flex: 2 }}
                    filter
                  />
                )}
                <InputNumber
                  value={it.qtdBatelada}
                  onValueChange={(e) => updateItem(idx, "qtdBatelada", e.value)}
                  placeholder="Qtd/batelada"
                  style={{ flex: 1 }}
                  inputStyle={{ width: "100%" }}
                  min={0}
                />
              </div>

              {(it.mpId || it.codigoComum) && (
                <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
                  {texto} — <b>{it.qtdBatelada || 0}</b> {unidade}/batelada × {form.numeroBateladas || 0} ={" "}
                  <b>{total}</b> {unidade} total
                </div>
              )}
            </div>
          );
        })}

        <Button label="Adicionar Item" icon="pi pi-plus" size="small" outlined onClick={addItem} style={{ marginBottom: 16 }} />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setVisible(false)} />
          <Button label="Criar OP" onClick={criarOP} />
        </div>
      </Dialog>
    </div>
  );
}
