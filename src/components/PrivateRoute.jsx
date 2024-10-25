import {useKeycloak} from '@react-keycloak/web';

const PrivateRoute = ({children, roles}) => {

    const {keycloak, initialized} = useKeycloak();

    if (!initialized)
        return <div>Loading...</div>;

    return keycloak.authenticated  && roles.some(role => keycloak.hasRealmRole(role)) ? children :
        <div>
            <h1>Access Denied</h1>
            <p>You are not allowed to view this page</p>
        </div>
        ;
};

export default PrivateRoute;
