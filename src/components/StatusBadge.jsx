import { getNewsStatusClass, getNewsStatusLabel } from "../constants/newsStatus";

export default function StatusBadge({ status }) {
  if (!status) return null;

  return (
    <span className={getNewsStatusClass(status)}>
      {getNewsStatusLabel(status)}
    </span>
  );
}
