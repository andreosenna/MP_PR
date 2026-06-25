import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// PrimeReact core + tema + ícones
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { PrimeReactProvider } from "primereact/api";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
);
