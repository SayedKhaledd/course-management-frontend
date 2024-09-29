import './styles/App.css'
import {Route, Routes} from "react-router-dom";
import Clients from "./pages/Clients.jsx";
import Courses from "./pages/Courses.jsx";
import SideBar from "./components/SideBar.jsx";

function App() {

    return (
        <>
            <div className="app-container">
            <SideBar className="sidebar"></SideBar>
            <Routes className="main-content">
                <Route path="/" element={<Clients/>}/>
                <Route path="/clients" element={<Clients/>}/>
                <Route path="/courses" element={<Courses/>}/>
            </Routes>
            </div>

        </>
    )
}

export default App
