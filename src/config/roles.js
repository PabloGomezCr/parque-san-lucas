export const PARK_RANGER = "PARK_RANGER";
export const ADMIN = "ADMIN";
export const MASTER_ADMIN = "MASTER_ADMIN";
export const TOUR_GUIDE = "TOUR_GUIDE";
export const READ_ONLY = "READ_ONLY";
// Supervisor is the existing demo role. Its behavior is preserved.
export const roles = {
  [PARK_RANGER]: { label: "Guardaparque" },
  [ADMIN]: { label: "Administrador" },
  [MASTER_ADMIN]: { label: "Administrador Maestro" },
  [TOUR_GUIDE]: { label: "Guía Turístico" },
  [READ_ONLY]: { label: "Usuario de Consulta" },
  Supervisor: { label: "Supervisor" },
};
export const assignableRoles = Object.keys(roles);
export const roleLabel = (role) => roles[role]?.label || role;
