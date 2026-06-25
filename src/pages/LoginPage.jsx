import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useApp } from "../context/AppContext.jsx";

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!login(username, password)) {
      setError("Usuário ou senha inválidos");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <i className="pi pi-building login-icon" />
          <div className="login-title">Gestão de Matéria-Prima</div>
          <div className="login-sub">Acesse com suas credenciais</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-block">
            <label className="field-label">Usuário</label>
            <InputText
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin ou operador"
              style={{ width: "100%" }}
            />
          </div>

          <div className="field-block">
            <label className="field-label">Senha</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              feedback={false}
              toggleMask
              style={{ width: "100%" }}
              inputStyle={{ width: "100%" }}
            />
          </div>

          {error && <Message severity="error" text={error} style={{ width: "100%", marginBottom: 12 }} />}

          <Button label="Entrar" icon="pi pi-sign-in" type="submit" style={{ width: "100%", marginTop: 8 }} />
        </form>

        <div className="login-hint">
          <b>Admin:</b> admin / admin123
          <br />
          <b>Operador:</b> operador / op123
        </div>
      </div>
    </div>
  );
}
