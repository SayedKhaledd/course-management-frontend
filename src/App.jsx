import './styles/App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import ClientDetails from './pages/ClientDetails.jsx';
import SideBar from './components/SideBar.jsx';
import kc, {initOptions} from './keycloak.js';
import {ReactKeycloakProvider} from '@react-keycloak/web';
import PrivateRoute from './components/PrivateRoute.jsx';
import Installments from "./pages/Installments.jsx";
import Sales from "./pages/Sales.jsx";
import Refunds from "./pages/Refunds.jsx";
import Clients from "./pages/Clients.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import useSecurity from "./hooks/useSecurity.js";
import Courses from "./pages/Courses.jsx";
import Users from "./pages/Users.jsx";
import EnrollmentDetails from "./pages/EnrollmentDetails.jsx";


function App() {

    return (
        <ReactKeycloakProvider authClient={kc} initOptions={initOptions}>
            <BrowserRouter>
                <div className="app-container">
                    <SideBar className="sidebar"/>
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<ClientsRoute/>}/>
                            <Route path="/clients" element={<ClientsRoute/>}/>
                            <Route path="/courses" element={<CoursesRoute/>}/>
                            <Route path="/installments" element={<InstallmentsRoute/>}/>
                            <Route path="/sales" element={<SalesRoute/>}/>
                            <Route path="/refunds" element={<RefundsRoute/>}/>
                            <Route path="/client/:id" element={<ClientDetailsRoute/>}/>
                            <Route path="/client/:clientId/course/:courseId" element={<EnrollmentDetailsRoute/>}/>
                            <Route path="/course/:id" element={<CourseDetailsRoute/>}/>
                            <Route path={"/users"} element={<UsersRoute/>}/>

                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </ReactKeycloakProvider>
    );
}

const ClientsRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<Clients/>} roles={Object.values(security.getRoles())}/>;
};

const CoursesRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<Courses/>} roles={Object.values(security.getRoles())}/>;
};

const InstallmentsRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<Installments/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().SALES,
        security.getRoles().CUSTOMER_SERVICE
    ]}/>;
};

const SalesRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<Sales/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().CUSTOMER_SERVICE,
    ]}/>;
};

const RefundsRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<Refunds/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().CUSTOMER_SERVICE
    ]}/>;
};

const ClientDetailsRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<ClientDetails/>} roles={Object.values(security.getRoles())}/>;
};

const EnrollmentDetailsRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<EnrollmentDetails/>} roles={Object.values(security.getRoles())}/>;
};


const CourseDetailsRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<CourseDetails/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().SALES,
        security.getRoles().CUSTOMER_SERVICE
    ]}/>;};

const UsersRoute = () => {
    const security = useSecurity();
    return <PrivateRoute children={<Users/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN
    ]}/>;
}


export default App;