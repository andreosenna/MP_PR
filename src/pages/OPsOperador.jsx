import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import StatusBadge from "../components/StatusBadge.jsx";
import { useApp } from "../context/AppContext.jsx";
import { formatDate } from "../utils/helpers.js";

export default function OPsOperador() {
  const { ops, setOps, mp, setMp, movs, setMovs, user, showToast } = useApp();
  const [apontandoOP, setApontandoOP] = useState(null);
  const [escolhaEspecifico, setEscolhaEspecifico] = useState({}); // { itemIdx: mpId } para itens "Comum"
  const [obs, setObs] = useState("");

  const opsDisponiveis = ops.filter((o) => o.status === "Em Andamento" || o.status === "Encerrada");

  function abrirApontamento(op) {
    setObs("");
    // pré-seleciona, para itens "Comum", o primeiro código específico disponível daquele comum
    const escolha = {};
    op.itens.forEach((it, idx) => {
      if (it.modo === "Comum") {
        const opcoes = mp.filter((m) => m.codigoComum === it.codigoComum);
        escolha[idx] = opcoes[0]?.id || null;
      }
    });
    setEscolhaEspecifico(escolha);
    setApontandoOP(op);
  }

  function opcoesEspecificoPara(codigoComum) {
    return mp
      .filter((m) => m.codigoComum === codigoComum)
      .map((m) => ({ label: `${m.codigoEspecifico} — ${m.fornecedor} (Estoque: ${m.estoque} ${m.unidade})`, value: m.id }));
  }

  function registrarApontamento() {
    if (!obs) {
      showToast("error", "Erro", "Adicione uma observação");
      return;
    }

    const op = apontandoOP;
    const bateladaAtual = (op.bateladasConcluidas || 0) + 1;

    if (bateladaAtual > op.numeroBateladas) {
      showToast("error", "Erro", "Todas as bateladas desta OP já foram apontadas");
      return;
    }

    // Resolve, para cada item da fórmula, qual código específico será debitado nesta batelada
    const baixas = op.itens.map((it, idx) => {
      const mpId = it.modo === "Específico" ? it.mpId : escolhaEspecifico[idx];
      return { mpId, qtd: it.qtdBatelada };
    });

    if (baixas.some((b) => !b.mpId)) {
      showToast("error", "Erro", "Selecione o código específico para todos os itens de código comum");
      return;
    }

    const problemas = baixas
      .map((b) => {
        const m = mp.find((x) => x.id === b.mpId);
        return m && m.estoque < b.qtd ? `${m.descricaoEspecifica}: necessário ${b.qtd} ${m.unidade}, disponível ${m.estoque}` : null;
      })
      .filter(Boolean);

    if (problemas.length) {
      showToast("error", "Estoque insuficiente", problemas.join("; "));
      return;
    }

    // Debita o estoque do código específico de cada item, referente a esta batelada
    setMp((prev) =>
      prev.map((m) => {
        const b = baixas.find((x) => x.mpId === m.id);
        return b ? { ...m, estoque: m.estoque - b.qtd } : m;
      })
    );

    setMovs((prev) => [
      ...prev,
      ...baixas.map((b, i) => ({
        id: Date.now() + i,
        mpId: b.mpId,
        tipo: "Saída",
        qtd: b.qtd,
        data: new Date().toISOString(),
        responsavel: user.username,
        obs: `Apontamento OP ${op.op} — Batelada ${bateladaAtual}/${op.numeroBateladas}`,
      })),
    ]);

    const novoApontamento = {
      operador: user.name || user.username,
      horario: new Date().toISOString(),
      obs,
      batelada: bateladaAtual,
      baixas: baixas.map((b) => {
        const m = mp.find((x) => x.id === b.mpId);
        return { mpId: b.mpId, codigoEspecifico: m?.codigoEspecifico, qtd: b.qtd, unidade: m?.unidade };
      }),
    };

    setOps((prev) =>
      prev.map((o) =>
        o.id === op.id
          ? {
              ...o,
              apontamentos: [...(o.apontamentos || []), novoApontamento],
              bateladasConcluidas: bateladaAtual,
            }
          : o
      )
    );

    showToast("success", "Sucesso", `Batelada ${bateladaAtual}/${op.numeroBateladas} apontada e MP debitada!`);
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

      {opsDisponiveis.map((op) => {
        const bateladasConcluidas = op.bateladasConcluidas || 0;
        const todasConcluidas = bateladasConcluidas >= op.numeroBateladas;

        return (
          <div key={op.id} className={`op-card ${op.status === "Em Andamento" ? "highlight" : ""}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span className="op-code" style={{ fontSize: 15 }}>
                    {op.op}
                  </span>
                  <StatusBadge status={op.status} />
                  <Tag value={op.tipo} style={{ background: "#e6f1fb", color: "#185fa5" }} />
                  <Tag
                    value={`Batelada ${bateladasConcluidas}/${op.numeroBateladas}`}
                    style={{ background: todasConcluidas ? "#eaf3de" : "#fae8da", color: todasConcluidas ? "#3b6d11" : "#854f0b" }}
                  />
                </div>

                <div style={{ fontWeight: 600, fontSize: 16, color: "#1b3a5c", marginBottom: 4 }}>{op.nome}</div>
                {op.descricao && <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{op.descricao}</div>}

                <div style={{ marginBottom: 10 }}>
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
                        {label}: <b>{it.qtdBatelada} {unidade}</b>/batelada
                      </span>
                    );
                  })}
                </div>

                {(op.apontamentos || []).length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
                      Histórico de apontamentos:
                    </div>
                    {op.apontamentos.map((a, i) => (
                      <div key={i} className="apontamento-item">
                        <div>
                          <b>{a.operador}</b> — {formatDate(a.horario)} — Batelada {a.batelada}/{op.numeroBateladas}
                        </div>
                        <div style={{ marginTop: 2 }}>{a.obs}</div>
                        {a.baixas?.length > 0 && (
                          <div style={{ marginTop: 4, color: "#854f0b" }}>
                            Baixa: {a.baixas.map((b) => `${b.codigoEspecifico} (${b.qtd} ${b.unidade})`).join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 16, minWidth: 150 }}>
                {op.status === "Em Andamento" && (
                  <>
                    <Button
                      label={`Apontar Batelada ${bateladasConcluidas + 1}`}
                      icon="pi pi-plus"
                      size="small"
                      disabled={todasConcluidas}
                      onClick={() => abrirApontamento(op)}
                    />
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
        );
      })}

      <Dialog
        header={apontandoOP ? `Apontamento — ${apontandoOP.op} — Batelada ${(apontandoOP.bateladasConcluidas || 0) + 1}/${apontandoOP.numeroBateladas}` : ""}
        visible={!!apontandoOP}
        style={{ width: 540 }}
        onHide={() => setApontandoOP(null)}
      >
        <Message
          severity="success"
          text={`Registrando como: ${user.name || user.username} em ${new Date().toLocaleString("pt-BR")}`}
          style={{ width: "100%", marginBottom: 16 }}
        />

        <Message
          severity="info"
          text="A baixa de matéria-prima é feita por batelada, conforme a quantidade definida na fórmula, sempre no código específico."
          style={{ width: "100%", marginBottom: 16 }}
        />

        {apontandoOP &&
          apontandoOP.itens.map((it, idx) => {
            if (it.modo === "Específico") {
              const m = mp.find((x) => x.id === it.mpId);
              return (
                <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 13 }}>
                    <Tag value="Específico" style={{ background: "#fae8da", color: "#854f0b", fontSize: 10, marginRight: 6 }} />
                    <b>{m?.codigoEspecifico}</b> — {m?.descricaoEspecifica}
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                    Será debitado: <b>{it.qtdBatelada} {m?.unidade}</b>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    <Tag value="Comum" style={{ background: "#e1ecfb", color: "#185fa5", fontSize: 10, marginRight: 6 }} />
                    Código comum: <b>{it.codigoComum}</b> — escolha o fornecedor/código específico para esta batelada:
                  </div>
                  <Dropdown
                    value={escolhaEspecifico[idx]}
                    options={opcoesEspecificoPara(it.codigoComum)}
                    onChange={(e) => setEscolhaEspecifico((prev) => ({ ...prev, [idx]: e.value }))}
                    placeholder="Selecione o código específico..."
                    style={{ width: "100%" }}
                  />
                  <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
                    Será debitado: <b>{it.qtdBatelada}</b> do código específico escolhido
                  </div>
                </div>
              );
            }
          })}

        <div className="field-block" style={{ marginTop: 12 }}>
          <label className="field-label">Observações *</label>
          <InputTextarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Descreva o andamento, problemas, etc."
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={() => setApontandoOP(null)} />
          <Button label="Registrar e Debitar MP" onClick={registrarApontamento} />
        </div>
      </Dialog>
    </div>
  );
}
