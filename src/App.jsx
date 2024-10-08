import './styles/App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Clients from './pages/Clients.jsx';
import Courses from './pages/Courses.jsx';
import SideBar from './components/SideBar.jsx';
import kc, {initOptions} from './keycloak.js';
import {ReactKeycloakProvider} from '@react-keycloak/web';
import PrivateRoute from './components/PrivateRoute.jsx';


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
                        </Routes>
                    </div>
                </div>

            </BrowserRouter>
        </ReactKeycloakProvider>
    );
}

export default App;
