export const HOME = '/';
export const IMAGES_PATH = 'src/assets/images/';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
const VITE_KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
console.log("base url", VITE_BASE_URL)
console.log("keycloak url", VITE_KEYCLOAK_URL)

export const BASE_URL = VITE_BASE_URL || 'http://localhost:8090/api';
export const KEYCLOAK_URL = VITE_KEYCLOAK_URL || 'http://localhost:8080/';

export const PAGINATION_RESPONSE = [
    "pageNumber",
    "pageSize",
    "totalNumberOfPages",
    "totalNumberOfElements",
    "isFirst",
    "isLast"
]
export const PAGINATION_REQUEST = [
    "pageNumber",
    "pageSize",

    "deletedRecords",
    "sortBy",
    "sortDesc"
]