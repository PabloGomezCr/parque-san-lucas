import { Search } from "lucide-react";
export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar registros…",
}) {
  return (
    <div className="search-bar">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
