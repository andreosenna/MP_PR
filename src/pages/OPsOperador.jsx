import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import StatusBadge from "../components/StatusBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { formatDate } from "../utils/helpers.js";

export default function OPsOperador() {
  const { ops, setOps, mp, user, showToast } = useApp();
  const [apontandoOP, setApontandoOP] = useState(null);
  const [apontForm, setApontForm] = useState({ qtd: null, obs: "" });

  const opsDisponiveis = ops.filter((o) => o.status === "Em Andamento" || o.status === "Encerrada");

  function abrirApontamento(op) {
    setApontForm({ qtd: null, obs: "" });
    setApontandoOP(op);
  }

  function registrarApontamento() {
    if (!apontForm.obs) {
      showToast("error", "Erro", "Adicione uma observação");
      return;
    }

    const novo = {
      operador: user.name || user.username,
      horario: new Date().toISOString(),
      obs: apontForm.obs,
      qtd: apontForm.qtd || null,
    };

    setOps((prev) =>
      prev.map((o) =>
        o.id === apontandoOP.id
          ? {
              ...o,
              apontamentos: [...(o.apontamentos || []), novo],
              qtdProduzida: apontForm.qtd ? apontForm.qtd : o.qtdProduzida,
            }
          : o
      )
    );

    showToast("success", "Sucesso", "Apontamento registrado!");
    setApontandoOP(null);
  }

  function encerrar(op) {
    setOps((prev) =>
      prev.map((o) =>
        o.id === op.id ? { ...o, status: "Encerrada", encerradoEm: new Date().toISOString(), encerradoPor: user.username } : o
      )
    );
    showToast("warn", "OP encerrada", `OP ${op.op} encerrada! Aguardando conclusão do admin.`);
  }

  return (
    <div>
      <h2 className="page-title">Ordens de Produção — Operador</h2>

      {opsDisponiveis.length === 0 && (
        <div className="empty-state">
          <i className="pi pi-clipboard" style={{ fontSize: 36, marginBottom: 12, display: "block" }} />
          <div>Nenhuma OP disponível para apontamento no momento.</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>Aguarde o administrador criar e liberar as OPs.</div>
        </div>
      )}

      {opsDisponiveis.map((op) => (
        <div key={op.id} className={`op-card ${op.status === "Em Andamento" ? "highlight" : ""}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span className="op-code" style={{ fontSize: 15 }}>
                  {op.op}
                </span>
                <StatusBadge status={op.status} />
                <Tag value={op.tipo} style={{ background: "#e6f1fb", color: "#185fa5" }} />
              </div>

              <div style={{ fontWeight: 600, fontSize: 16, color: "#1b3a5c", marginBottom: 4 }}>{op.nome}</div>
              {op.descricao && <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{op.descricao}</div>}

              <div style={{ marginBottom: 10 }}>
                {op.itens.map((it, i) => {
                  const m = mp.find((x) => x.id === it.mpId);
                  return (
                    <span key={i} className="op-item-pill">
                      {m?.nome}: <b>{it.qtd} {m?.unidade}</b>
                    </span>
                  );
                })}
              </div>

              {op.qtdProduzida != null && (
                <div style={{ fontSize: 14, color: "#3b6d11", fontWeight: 600, marginBottom: 8 }}>
                  <i className="pi pi-check-circle" style={{ marginRight: 4 }} />
                  Quantidade produzida: {op.qtdProduzida} kg
                </div>
              )}

              {(op.apontamentos || []).length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
                    Histórico de apontamentos:
                  </div>
                  {op.apontamentos.map((a, i) => (
                    <div key={i} className="apontamento-item">
                      <div>
                        <b>{a.operador}</b> — {formatDate(a.horario)}
                      </div>
                      <div style={{ marginTop: 2 }}>{a.obs}</div>
                      {a.qtd && <div style={{ color: "#3b6d11", marginTop: 2 }}>Produzido: {a.qtd} kg</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 16, minWidth: 130 }}>
              {op.status === "Em Andamento" && (
                <>
                  <Button label="Apontamento" icon="pi pi-plus" size="small" onClick={() => abrirApontamento(op)} />
                  <Button label="Encerrar OP" icon="pi pi-lock" size="small" severity="warning" onClick={() => encerrar(op)} />
                </>
              )}
              {op.status === "Encerrada" && (
                <span style={{ fontSize: 12, color: "#888", textAlign: "center" }}>
                  Aguardando
                  <br />
                  conclusão
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      <Dialog
        header={apontandoOP ? `Apontamento — ${apontandoOP.op}` : ""}
        visible={!!apontandoOP}
        style={{ width: 460 }}
        onHide={() => setApontandoOP(null)}
      >
        <Message
          severity="success"
          text={`Registrando como: ${user.name || user.username} em ${new Date().toLocaleString("pt-BR")}`}
          style={{ width: "100%", marginBottom: 16 }}
        />

        <div className="field-block">
          <label className="field-label">Quantidade Produzida (kg)</label>
          <InputNumber
            value={apontForm.qtd}
            onValueChange={(e) => setApontForm((f) => ({ ...f, qtd: e.value }))}
            placeholder="Ex: 250"
            style={{ width: "100%" }}
            inputStyle={{ width: "100%" }}
            min={0}
          />
        </div>

        <div className="field-block">
          <label className="field-label">Observações *</label>
          <InputTextarea
            value={apontForm.obs}
            onChange={(e) => setApontForm((f) => ({ ...f, obs: e.target.value }))}
            placeholder="Descreva o andamento, problemas, etc."
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setApontandoOP(null)} />
          <Button label="Registrar" onClick={registrarApontamento} />
        </div>
      </Dialog>
    </div>
  );
}
