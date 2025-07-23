import {useKeycloak} from '@react-keycloak/web';
import {Suspense} from "react";

const PrivateRoute = ({children, roles}) => {
    const {keycloak, initialized} = useKeycloak();

    if (!initialized) {
        return <div>Loading...</div>;
    }

    if (keycloak.authenticated && roles.some(role => keycloak.hasRealmRole(role))) {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                {children}
            </Suspense>
        );
    }
    return (
        <div>
            <h1>Access Denied</h1>
            <p>You are not allowed to view this page</p>
        </div>
    );
};

export default PrivateRoute;
