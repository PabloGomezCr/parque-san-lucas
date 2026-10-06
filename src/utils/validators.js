export function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function validateLoginForm({ email, password }) {
  const errors = {};

  if (!isValidEmail(email)) {
    errors.email = "Correo inválido.";
  }

  if (!password || password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  return errors;
}
