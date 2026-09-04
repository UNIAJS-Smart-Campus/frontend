import {
    reservationsApi as core,
    denormalizeReserva,
    normalizeReserva
} from "../utils/api";

export const reservationsApi = {
    list: core.list,
    getOne: core.get,
    create: core.create,
    update: core.update,
    remove: core.remove
};

export { denormalizeReserva, normalizeReserva };

export default reservationsApi;