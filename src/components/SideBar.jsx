"use client";

import '../styles/colors.css'; // Import custom CSS file
import {useNavigate} from 'react-router-dom';
import {PanelMenu} from 'primereact/panelmenu';
import 'primeicons/primeicons.css'; // For using icons
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import "../styles/sidebar.css"
import {useKeycloak} from "@react-keycloak/web";
import {useState} from "react";
import Notification from "./Notification.jsx";


const SideBar = () => {
    const nav = useNavigate();
    const {keycloak, initialized} = useKeycloak();
    const [notification, setNotification] = useState({message: '', type: ''});

    const command = (title) => {
        nav('/' + title.toLowerCase());
    };

    const Menus = [
        {label: "Clients", icon: "pi pi-users", command: () => command("Clients")},
        {label: "Courses", icon: "pi pi-book", command: () => command("Courses")},
        {label: "Installments", icon: "pi pi-money-bill", command: () => command("Installments")},
        {label: "Sales", icon: "pi pi-wallet", command: () => command("Sales")},
        {label: "Refunds", icon: "pi pi-refresh", command: () => command("Refunds")},
        {label: "Users", icon: "pi pi-id-card", command: () => command("Users")},

        {
            label: "Logout", icon: "pi pi-sign-out", command: () => {
                keycloak.logout().then(r =>
                    setNotification({message: 'Logout successful', type: 'success'}));
                nav('/login');
            }
        }


    ];

    return (
        <div className="sidebar">
            <h3>Dashboard</h3>
            <PanelMenu model={Menus}></PanelMenu>
            <Notification status={notification.type} message={notification.message}/>
        </div>
    );
};

export default SideBar;
