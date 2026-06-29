import { createContext, useContext, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { USERS, INITIAL_MP, INITIAL_MOVS, INITIAL_OPS, INITIAL_FORNECEDORES } from "../utils/data.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mp, setMp] = useState(INITIAL_MP);
  const [movs, setMovs] = useState(INITIAL_MOVS);
  const [ops, setOps] = useState(INITIAL_OPS);
  const [fornecedores, setFornecedores] = useState(INITIAL_FORNECEDORES);
  const toastRef = useRef(null);

  function login(username, password) {
    const found = USERS.find((u) => u.username === username && u.password === password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
  }

  function showToast(severity, summary, detail) {
    toastRef.current?.show({ severity, summary, detail, life: 3500 });
  }

  const value = {
    user,
    login,
    logout,
    mp,
    setMp,
    movs,
    setMovs,
    ops,
    setOps,
    fornecedores,
    setFornecedores,
    showToast,
  };

  return (
    <AppContext.Provider value={value}>
      <Toast ref={toastRef} position="bottom-right" />
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
