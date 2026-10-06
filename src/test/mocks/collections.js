import { modules } from "../../config/modules";
import { wellService } from "../../services/wellService";
import { emptyCollections } from "../fixtures/records";
export function mockCollections(data = emptyCollections()) {
  for (const [key, config] of Object.entries(modules))
    config.getAll.mockResolvedValue(data[key]);
  wellService.getReadings.mockResolvedValue(data.wellReadings);
  return data;
}
