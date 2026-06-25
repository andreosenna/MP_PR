import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MateriasPrimas from "./pages/MateriasPrimas.jsx";
import Estoque from "./pages/Estoque.jsx";
import Formulas from "./pages/Formulas.jsx";
import OPsAdmin from "./pages/OPsAdmin.jsx";
import OPsOperador from "./pages/OPsOperador.jsx";

function Shell() {
  const { user } = useApp();
  const [page, setPage] = useState(user.role === "admin" ? "dashboard" : "ops-operador");

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="main-content">
        {page === "dashboard" && <Dashboard />}
        {page === "materias-primas" && <MateriasPrimas />}
        {page === "estoque" && <Estoque />}
        {page === "formulas-extrusao" && <Formulas tipo="Extrusão" />}
        {page === "formulas-mistura" && <Formulas tipo="Mistura" />}
        {page === "ops-admin" && <OPsAdmin />}
        {page === "ops-operador" && <OPsOperador />}
      </main>
    </div>
  );
}

function Root() {
  const { user } = useApp();
  return user ? <Shell /> : <LoginPage />;
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
