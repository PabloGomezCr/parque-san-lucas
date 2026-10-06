import { createRepository } from "../repositories/createRepository";
import { requireActor } from "./sessionAccess";
import { samePark } from "../config/permissions";

const parks = createRepository({ resource: "parks" });
const routes = createRepository({ resource: "parkRoutes" });

export const parkInfoService = {
  async getParkInfo() {
    const actor = await requireActor("park_info.view");
    const [park, parkRoutes] = await Promise.all([
      parks.getById(actor.parkId),
      this.getRoutes(),
    ]);
    return { park, routes: parkRoutes };
  },
  async getRoutes() {
    const actor = await requireActor("routes.view");
    return (await routes.getAll()).filter(
      (route) => samePark(actor, route) && route.active !== false,
    );
  },
};