import { Tag } from "primereact/tag";

const STATUS_SEVERITY = {
  Aberta: "info",
  "Em Andamento": "success",
  Encerrada: "warning",
  Concluída: "secondary",
};

export default function StatusBadge({ status }) {
  return <Tag value={status} severity={STATUS_SEVERITY[status] || "secondary"} />;
}
