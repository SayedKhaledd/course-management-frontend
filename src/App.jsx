import './styles/App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Courses from './pages/Courses.jsx';
import ClientDetails from './pages/ClientDetails.jsx';
import SideBar from './components/SideBar.jsx';
import kc, {initOptions} from './keycloak.js';
import {ReactKeycloakProvider} from '@react-keycloak/web';
import PrivateRoute from './components/PrivateRoute.jsx';
import Installments from "./pages/Installments.jsx";
import Sales from "./pages/Sales.jsx";
import Refunds from "./pages/Refunds.jsx";
import Clients from "./pages/Clients.jsx";


function App() {
    return (
        <ReactKeycloakProvider authClient={kc} initOptions={initOptions}>
            <BrowserRouter>
                <div className="app-container">

                    <SideBar className="sidebar"/>
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<PrivateRoute><Clients/> </PrivateRoute>}/>
                            <Route path="/clients" element={<PrivateRoute><Clients/> </PrivateRoute>}/>
                            <Route path="/courses" element={<PrivateRoute><Courses/> </PrivateRoute>}/>
                            <Route path="/installments" element={<PrivateRoute><Installments/> </PrivateRoute>}/>
                            <Route path="/sales" element={<PrivateRoute><Sales/> </PrivateRoute>}/>
                            <Route path="/refunds" element={<PrivateRoute><Refunds/> </PrivateRoute>}/>
                            <Route path="/client/:id" element={<PrivateRoute><ClientDetails/> </PrivateRoute>}/>
                        </Routes>
                    </div>
                </div>

            </BrowserRouter>
        </ReactKeycloakProvider>
    );
}

export default App;
