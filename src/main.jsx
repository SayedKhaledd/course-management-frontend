import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
    //TODO: MAY ADD <StrictMode> LATER
    <App/>
)
