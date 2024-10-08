// import React, {useEffect} from 'react';
// import {useKeycloak} from '@react-keycloak/web';
// import {useLocation, useNavigate} from 'react-router-dom';
//
// const LoginPage = () => {
//     const {keycloak} = useKeycloak();
//     const location = useLocation();
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         if (!keycloak.authenticated) {
//             console.log('User is not authenticated');
//             keycloak.login();
//         } else {
//             console.log('User is authenticated');
//             const {from} = location.state || {from: {pathname: '/'}};
//             if (window.location.href.indexOf('code=') !== -1 || window.location.href.indexOf('state=') !== -1) {
//                 window.history.replaceState(null, null, window.location.pathname);  // Clear URL query string
//             }
//             navigate(from);
//         }
//     }, [keycloak, location, navigate]);
//
//     return <div>Logging in...</div>;
// };
//
// export default LoginPage;
