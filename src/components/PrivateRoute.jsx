import {useKeycloak} from '@react-keycloak/web';

const PrivateRoute = ({children}) => {
    const {keycloak, initialized} = useKeycloak();

    return keycloak.authenticated && initialized ? children : null;
};

export default PrivateRoute;
