export function UnreadBadge({ count }) {
  return count > 0 ? (
    <span className="badge" aria-label={`${count} mensajes sin leer`}>
      {count}
    </span>
  ) : null;
}
