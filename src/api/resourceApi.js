import { resourcesApi as core, normalizeRecurso } from "../utils/api";

export const resourcesApi = {
    list: core.list,
    getOne: core.get,
    create: core.create,
    update: core.update,
    remove: core.remove
};

export { normalizeRecurso };

export default resourcesApi;