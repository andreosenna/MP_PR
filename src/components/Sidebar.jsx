import { useApp } from "../context/AppContext.jsx";
import { Button } from "primereact/button";

const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", icon: "pi pi-chart-bar" },
  { id: "materias-primas", label: "Matérias-Primas", icon: "pi pi-box" },
  { id: "fornecedores", label: "Fornecedores", icon: "pi pi-truck" },
  { id: "estoque", label: "Movimentação Estoque", icon: "pi pi-sync" },
  { id: "relatorio-inspecao", label: "Relatório de Inspeção", icon: "pi pi-chart-line" },
  { id: "formulas-extrusao", label: "Fórmulas Extrusão", icon: "pi pi-cog" },
  { id: "formulas-mistura", label: "Fórmulas Mistura", icon: "pi pi-blender" },
  { id: "ops-admin", label: "Ordens de Produção", icon: "pi pi-list-check" },
];

const OPERADOR_NAV = [{ id: "ops-operador", label: "Minhas OPs", icon: "pi pi-list-check" }];

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useApp();
  const nav = user.role === "admin" ? ADMIN_NAV : OPERADOR_NAV;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">MATÉRIA-PRIMA</div>
        <div className="sidebar-sub">Sistema de Gestão</div>
      </div>

      <nav className="sidebar-nav">
        {nav.map((n) => (
          <button
            key={n.id}
            className={`sidebar-link ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <i className={n.icon} style={{ fontSize: 15 }} />
            {n.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">{user.name}</div>
        <div className="sidebar-role">{user.role === "admin" ? "Administrador" : "Operador"}</div>
        <Button
          label="Sair"
          icon="pi pi-sign-out"
          severity="secondary"
          outlined
          size="small"
          style={{ width: "100%", color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}
          onClick={logout}
        />
      </div>
    </aside>
  );
}
