import { useApp } from "../context/AppContext.jsx";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDateShort } from "../utils/helpers.js";

export default function Dashboard() {
  const { mp, ops } = useApp();

  const totalMP = mp.length;
  const mpBaixo = mp.filter((m) => m.estoque < 100).length;
  const opsAbertas = ops.filter((o) => o.status === "Aberta").length;
  const opsAndamento = ops.filter((o) => o.status === "Em Andamento").length;
  const opsEncerradas = ops.filter((o) => o.status === "Encerrada").length;

  const cards = [
    { label: "Matérias-Primas", val: totalMP, icon: "pi pi-box", color: "#185fa5" },
    { label: "Estoque Crítico", val: mpBaixo, icon: "pi pi-exclamation-triangle", color: "#a32d2d" },
    { label: "OPs Abertas", val: opsAbertas, icon: "pi pi-folder-open", color: "#3b6d11" },
    { label: "Em Andamento", val: opsAndamento, icon: "pi pi-cog", color: "#854f0b" },
    { label: "Encerradas", val: opsEncerradas, icon: "pi pi-check-circle", color: "#5f5e5a" },
  ];

  const ultimasOps = [...ops].reverse().slice(0, 5);

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {cards.map((c, i) => (
          <div key={i} className="metric-card">
            <i className={c.icon} style={{ fontSize: 22, color: c.color }} />
            <div className="metric-value" style={{ color: c.color }}>
              {c.val}
            </div>
            <div className="metric-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="op-card">
        <h3 style={{ margin: "0 0 16px", color: "#1b3a5c", fontSize: 16 }}>Últimas OPs</h3>
        {ops.length === 0 ? (
          <p style={{ color: "#888", fontSize: 14 }}>Nenhuma OP criada ainda.</p>
        ) : (
          <DataTable value={ultimasOps} size="small" stripedRows>
            <Column field="op" header="OP" body={(r) => <span className="op-code">{r.op}</span>} />
            <Column field="tipo" header="Tipo" />
            <Column
              header="Bateladas"
              body={(r) => `${r.bateladasConcluidas || 0}/${r.numeroBateladas}`}
            />
            <Column field="criadoPor" header="Responsável" />
            <Column field="status" header="Status" body={(r) => <StatusBadge status={r.status} />} />
            <Column field="criadoEm" header="Data" body={(r) => formatDateShort(r.criadoEm)} />
          </DataTable>
        )}
      </div>
    </div>
  );
}
