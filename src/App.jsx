import './styles/App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import SideBar from './components/SideBar.jsx';
import kc, {initOptions} from './keycloak.js';
import {ReactKeycloakProvider} from '@react-keycloak/web';
import PrivateRoute from './components/PrivateRoute.jsx';
import useSecurity from "./hooks/useSecurity.js";
import {lazy} from "react";

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
                            <Route path="/clients/upload-csv" element={<ClientsUploadCsvRoute/>}/>
                            <Route path="/courses" element={<CoursesRoute/>}/>
                            <Route path="/installments" element={<InstallmentsRoute/>}/>
                            <Route path="/sales" element={<SalesRoute/>}/>
                            <Route path="/refunds" element={<RefundsRoute/>}/>
                            <Route path="/evaluations" element={<EvaluationsRoute/>}/>
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
    const Clients = lazy(() => import('./pages/Clients.jsx'));
    return <PrivateRoute children={<Clients/>} roles={Object.values(security.getRoles())}/>;
};

const ClientsUploadCsvRoute = () => {
    const security = useSecurity();
    const ClientsUploadCsv = lazy(() => import('./pages/ClientsUploadCsv.jsx'));
    return <PrivateRoute children={<ClientsUploadCsv/>} roles={Object.values(security.getRoles())}/>;
}


const CoursesRoute = () => {
    const security = useSecurity();
    const Courses = lazy(() => import('./pages/Courses.jsx'));
    return <PrivateRoute children={<Courses/>} roles={Object.values(security.getRoles())}/>;
};

const InstallmentsRoute = () => {
    const security = useSecurity();
    const InstallmentsPage = lazy(() => import('./pages/InstallmentsPage.jsx'));
    return <PrivateRoute children={<InstallmentsPage/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().SALES,
        security.getRoles().CUSTOMER_SERVICE
    ]}/>;
};

const SalesRoute = () => {
    const security = useSecurity();
    const Sales = lazy(() => import('./pages/Sales.jsx'));
    return <PrivateRoute children={<Sales/>} roles={Object.values(security.getRoles())}/>;
};

const RefundsRoute = () => {
    const security = useSecurity();
    const Refunds = lazy(() => import('./pages/Refunds.jsx'));
    return <PrivateRoute children={<Refunds/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().CUSTOMER_SERVICE
    ]}/>;
};

const EvaluationsRoute = () => {
    const security = useSecurity();
    const Evaluations = lazy(() => import('./pages/Evaluations.jsx'));
    return <PrivateRoute children={<Evaluations/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().CUSTOMER_SERVICE
    ]}/>;
}

const ClientDetailsRoute = () => {
    const security = useSecurity();
    const ClientDetails = lazy(() => import('./pages/ClientDetails.jsx'));
    return <PrivateRoute children={<ClientDetails/>} roles={Object.values(security.getRoles())}/>;
};

const EnrollmentDetailsRoute = () => {
    const security = useSecurity();
    const EnrollmentDetails = lazy(() => import('./pages/EnrollmentDetails.jsx'));
    return <PrivateRoute children={<EnrollmentDetails/>} roles={Object.values(security.getRoles())}/>;
};


const CourseDetailsRoute = () => {
    const security = useSecurity();
    const CourseDetails = lazy(() => import('./pages/CourseDetails.jsx'));
    return <PrivateRoute children={<CourseDetails/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN,
        security.getRoles().ACCOUNTANT,
        security.getRoles().SALES,
        security.getRoles().CUSTOMER_SERVICE
    ]}/>;
};

const UsersRoute = () => {
    const security = useSecurity();
    const Users = lazy(() => import('./pages/Users.jsx'));
    return <PrivateRoute children={<Users/>} roles={[
        security.getRoles().ADMIN,
        security.getRoles().SUPER_ADMIN
    ]}/>;
}


export default App;