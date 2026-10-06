import { hasPermission } from "../config/permissions";
import { readStorage } from "../utils/storage";
import { sessionKey } from "./sessionAccess";
export const reportReadPermissions = {
  tasks: "task.view",
  tourists: "tourist.view",
  maintenance: "maintenance.view",
  heritage: "heritage.view",
  species: "species.view",
  wellReadings: "well.view",
};
import { taskService } from "./taskService";
import { touristService } from "./touristService";
import { maintenanceService } from "./maintenanceService";
import { heritageService } from "./heritageService";
import { speciesService } from "./speciesService";
import { wellService } from "./wellService";
export const reportService = {
  async getDashboardData(user = readStorage(sessionKey)) {
    const read = (key, loader) =>
      hasPermission(user, reportReadPermissions[key])
        ? loader()
        : Promise.resolve([]);
    const [tasks, tourists, maintenance, heritage, species, wellReadings] =
      await Promise.all([
        read("tasks", taskService.getTasks),
        read("tourists", touristService.getTourists),
        read("maintenance", maintenanceService.getMaintenance),
        read("heritage", heritageService.getHeritage),
        read("species", speciesService.getSpecies),
        read("wellReadings", wellService.getReadings),
      ]);
    return { tasks, tourists, maintenance, heritage, species, wellReadings };
  },
};
