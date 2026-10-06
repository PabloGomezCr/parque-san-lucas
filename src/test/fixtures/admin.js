export const masterActor = {
  id: "admin-mock",
  name: "Administrador Ficticio",
  email: "admin@example.test",
  password: "clave-mock",
  role: "MASTER_ADMIN",
  parkId: "1",
  active: true,
  department: "Pruebas",
};
export const parkWorker = {
  id: "worker-mock",
  name: "Persona del Parque",
  email: "worker@example.test",
  password: "clave-mock",
  role: "Supervisor",
  parkId: "1",
  active: true,
};
export const foreignWorker = {
  ...parkWorker,
  id: "foreign-mock",
  name: "Persona de Otro Parque",
  email: "foreign@example.test",
  parkId: "2",
};
export const inactiveWorker = {
  ...parkWorker,
  id: "inactive-mock",
  name: "Persona Inactiva",
  email: "inactive@example.test",
  active: false,
};

export const adminActor = {
  ...masterActor,
  id: "operations-mock",
  name: "Administrador de Operaciones Ficticio",
  email: "operations@example.test",
  role: "ADMIN",
  optionalPermissions: [],
};

export const rangerActor = {
  ...adminActor,
  id: "ranger-mock",
  name: "Guardaparque Ficticio",
  email: "ranger@example.test",
  role: "PARK_RANGER",
  optionalPermissions: [],
};

export const guideActor = {
  ...parkWorker,
  id: "guide-mock",
  name: "Guía Ficticio",
  email: "guide@example.test",
  role: "TOUR_GUIDE",
};

export const readOnlyActor = {
  ...parkWorker,
  id: "read-only-mock",
  name: "Usuario de Consulta Ficticio",
  email: "readonly@example.test",
  role: "READ_ONLY",
  optionalPermissions: [],
};
