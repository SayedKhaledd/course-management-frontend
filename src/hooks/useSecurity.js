import {useKeycloak} from '@react-keycloak/web';

const useSecurity = () => {
    const {keycloak, initialized} = useKeycloak();

    const roles = {
        SUPER_ADMIN: "SUPER_ADMIN",
        ADMIN: "ADMIN",
        ACCOUNTANT: "ACCOUNTANT",
        CUSTOMER_SERVICE: "CUSTOMER_SERVICE",
        SALES: "SALES",
        MARKETING: "MARKETING",
    };

    const isAuthorizedToDelete = () => {
        if (!initialized) return false;
        const roleList = ["SUPER_ADMIN", "ADMIN", "CUSTOMER_SERVICE", "SALES", "MARKETING"];
        return roleList.some(role => keycloak.hasRealmRole(role));
    };

    const getRoles = () => {
        return roles;
    };

    return {
        isAuthorizedToDelete,
        getRoles,
    };
};

export default useSecurity;