import { describe, it, expect } from "vitest";
import {
  hasPermission,
  masterAdminPermissions,
  isActiveUser,
} from "./permissions";
import { getNavigation } from "./navigation";
import { masterActor, parkWorker } from "../test/fixtures/admin";
import { READ_ONLY, TOUR_GUIDE, roleLabel } from "./roles";
import {
  readOnlyOptionalPermissions,
  readOnlyPermissions,
  tourGuidePermissions,
} from "./permissions";
import { readOnlyActor } from "../test/fixtures/admin";
describe("RBAC centralizado", () => {
  it("configura exactamente los permisos solicitados de MASTER_ADMIN", () => {
    expect(masterAdminPermissions).toHaveLength(35);
    for (const permission of masterAdminPermissions)
      expect(hasPermission(masterActor, permission)).toBe(true);
    expect(hasPermission(masterActor, "task.delete")).toBe(false);
    expect(hasPermission(masterActor, "well.create")).toBe(false);
  });
  it("muestra los once módulos del administrador y preserva navegación del Supervisor", () => {
    expect(
      getNavigation((permission) => hasPermission(masterActor, permission)).map(
        (item) => item.path,
      ),
    ).toEqual([
      "/dashboard",
      "/tasks",
      "/tourists",
      "/maintenance",
      "/heritage",
      "/species",
      "/well-monitoring",
      "/reports",
      "/users",
      "/chat",
      "/profile",
    ]);
    const existing = getNavigation((permission) =>
      hasPermission(parkWorker, permission),
    ).map((item) => item.path);
    expect(existing).toHaveLength(9);
    expect(existing).not.toContain("/users");
    expect(existing).not.toContain("/chat");
    expect(hasPermission(parkWorker, "task.delete")).toBe(true);
    expect(hasPermission(parkWorker, "task.delegate")).toBe(false);
  });
  it("deniega usuarios inactivos, sin parque y roles desconocidos", () => {
    for (const user of [
      { ...masterActor, active: false },
      { ...masterActor, parkId: null },
      { ...masterActor, role: "UNKNOWN" },
      null,
    ])
      expect(hasPermission(user, "users.view")).toBe(false);
    expect(isActiveUser({ ...masterActor, active: false })).toBe(false);
  });
  it("limita TOUR_GUIDE a su matriz interpretativa y de asistencia", () => {
    const guide = { ...parkWorker, id: "guide-1", role: TOUR_GUIDE };
    expect(roleLabel(TOUR_GUIDE)).toBe("Guía Turístico");
    for (const permission of tourGuidePermissions)
      expect(hasPermission(guide, permission)).toBe(true);
    for (const permission of [
      "task.create",
      "task.edit",
      "task.delegate",
      "maintenance.edit",
      "maintenance.delegate",
      "heritage.edit",
      "species.edit",
      "species.observation.create",
      "users.view",
      "users.edit",
      "users.assign_role",
      "reports.export",
      "chat.direct_admin",
    ])
      expect(hasPermission(guide, permission)).toBe(false);
  });
  it("limita READ_ONLY a consulta y deja chat grupal bajo asignación explícita", () => {
    expect(roleLabel(READ_ONLY)).toBe("Usuario de Consulta");
    for (const permission of readOnlyPermissions)
      expect(hasPermission(readOnlyActor, permission)).toBe(true);
    for (const permission of [
      "task.create",
      "task.edit",
      "task.delete",
      "task.delegate",
      "task.complete",
      "maintenance.create",
      "maintenance.edit",
      "maintenance.delete",
      "maintenance.delegate",
      "heritage.create",
      "heritage.edit",
      "heritage.delete",
      "species.create",
      "species.edit",
      "species.delete",
      "species.observation.create",
      "reports.export",
      "users.view",
      "users.edit",
      "users.assign_role",
      "incident.create",
      "incident.manage",
      "profile.edit",
    ])
      expect(hasPermission(readOnlyActor, permission)).toBe(false);
    expect(readOnlyOptionalPermissions).toEqual([
      "chat.group",
      "projection.weather.view",
    ]);
    expect(hasPermission(readOnlyActor, "chat.group")).toBe(false);
    expect(
      hasPermission(
        { ...readOnlyActor, optionalPermissions: ["chat.group"] },
        "chat.group",
      ),
    ).toBe(true);
    expect(
      getNavigation((permission) =>
        hasPermission(readOnlyActor, permission),
      ).map((item) => item.path),
    ).toEqual([
      "/dashboard",
      "/tasks",
      "/maintenance",
      "/heritage",
      "/species",
      "/reports",
      "/profile",
    ]);
  });
});

import { adminBasePermissions, adminOptionalPermissions } from "./permissions";
import { adminActor } from "../test/fixtures/admin";
describe("ADMIN: base y permisos opcionales", () => {
  it("tiene los 18 permisos base y difiere del Administrador Maestro", () => {
    expect(adminBasePermissions).toHaveLength(18);
    for (const permission of adminBasePermissions)
      expect(hasPermission(adminActor, permission)).toBe(true);
    for (const permission of [
      ...adminOptionalPermissions,
      "users.assign_role",
      "users.create",
      "task.complete",
      "task.reassign",
      "well.view",
      "heritage.edit",
      "species.create",
      "tourist.edit",
      "delegation.view_history",
    ])
      expect(hasPermission(adminActor, permission)).toBe(false);
  });
  it("acepta solamente los cinco opcionales permitidos sin extender otros roles", () => {
    const assigned = {
      ...adminActor,
      optionalPermissions: [
        ...adminOptionalPermissions,
        "users.assign_role",
        "task.reassign",
      ],
    };
    for (const permission of adminOptionalPermissions)
      expect(hasPermission(assigned, permission)).toBe(true);
    expect(hasPermission(assigned, "users.assign_role")).toBe(false);
    expect(hasPermission(assigned, "task.reassign")).toBe(false);
    expect(
      hasPermission(
        { ...parkWorker, optionalPermissions: ["task.delegate"] },
        "task.delegate",
      ),
    ).toBe(false);
  });
  it("cambia navegación al conceder y retirar users.view", () => {
    const paths = (user) =>
      getNavigation((permission) => hasPermission(user, permission)).map(
        (item) => item.path,
      );
    expect(paths(adminActor)).toEqual([
      "/dashboard",
      "/tasks",
      "/tourists",
      "/maintenance",
      "/heritage",
      "/species",
      "/reports",
      "/chat",
      "/profile",
    ]);
    expect(
      paths({ ...adminActor, optionalPermissions: ["users.view"] }),
    ).toContain("/users");
    expect(paths(adminActor)).not.toContain("/users");
    expect(
      paths({
        ...adminActor,
        active: false,
        optionalPermissions: adminOptionalPermissions,
      }),
    ).toEqual([]);
  });
});

import {
  parkRangerBasePermissions,
  parkRangerOptionalPermissions,
} from "./permissions";
import { rangerActor } from "../test/fixtures/admin";
describe("PARK_RANGER: campo sin administración implícita", () => {
  it("configura exactamente los 24 permisos base de campo", () => {
    expect(parkRangerBasePermissions).toHaveLength(24);
    for (const permission of parkRangerBasePermissions)
      expect(hasPermission(rangerActor, permission)).toBe(true);
    for (const permission of [
      ...parkRangerOptionalPermissions,
      "users.view",
      "users.edit",
      "users.assign_role",
      "reports.export",
      "heritage.edit",
      "tourist.edit",
      "well.create",
    ])
      expect(hasPermission(rangerActor, permission)).toBe(false);
  });
  it("habilita únicamente delegación y directo administrativo como opcionales", () => {
    const granted = {
      ...rangerActor,
      optionalPermissions: [
        ...parkRangerOptionalPermissions,
        "users.assign_role",
        "users.view",
      ],
    };
    for (const permission of parkRangerOptionalPermissions)
      expect(hasPermission(granted, permission)).toBe(true);
    expect(hasPermission(granted, "users.assign_role")).toBe(false);
    expect(hasPermission(granted, "users.view")).toBe(false);
  });
  it("muestra incidencias y los módulos de campo sin Usuarios", () => {
    const paths = getNavigation((permission) =>
      hasPermission(rangerActor, permission),
    ).map((item) => item.path);
    expect(paths).toContain("/incidents");
    expect(paths).toContain("/chat");
    expect(paths).toContain("/well-monitoring");
    expect(paths).not.toContain("/users");
  });
});
