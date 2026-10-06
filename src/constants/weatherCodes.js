export function weatherCondition(code) {
  if (code === 0) return "Despejado";
  if (code <= 3) return "Parcialmente nublado";
  if ([45, 48].includes(code)) return "Niebla";
  if (code >= 95) return "Tormenta eléctrica";
  if ([65, 67, 82].includes(code)) return "Lluvia intensa";
  if ((code >= 71 && code <= 77) || [85, 86].includes(code)) return "Nieve";
  if (code >= 51) return "Lluvia";
  return "Condición sin clasificar";
}
