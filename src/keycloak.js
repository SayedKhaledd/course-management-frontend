import Keycloak from "keycloak-js";
import {KEYCLOAK_URL} from "./constants";


const kc = new Keycloak({
    url: KEYCLOAK_URL,
    realm: "course-management",
    clientId: "course-management-frontend",
});


const initOptions = {
    onLoad: 'login-required',
    pkceMethod: 'S256',
    responseMode: 'query',
    enableLogging: true,
    checkLoginIframe: false,
};


export default kc;
export {initOptions};