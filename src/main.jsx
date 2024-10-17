import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import {StrictMode} from "react";

createRoot(document.getElementById('root')).render(
    //TODO: MAY ADD <StrictMode> LATER

    // <StrictMode>
    <App/>
    // </StrictMode>
)
