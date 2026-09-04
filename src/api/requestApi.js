import { requestsApi as core, normalizeSolicitud, denormalizeSolicitud } from "../utils/api";

export const requestsApi = {
    list: core.list,
    getOne: core.get,
    create: core.create,
    update: core.update,
    remove: core.remove
};

export { normalizeSolicitud, denormalizeSolicitud };

export default requestsApi;