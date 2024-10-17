"use client";

import '../styles/colors.css'; // Import custom CSS file
import {useNavigate} from 'react-router-dom';
import {PanelMenu} from 'primereact/panelmenu';
import 'primeicons/primeicons.css'; // For using icons
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import {Badge} from "primereact/badge";
import "../styles/sidebar.css"


const SideBar = () => {
    const nav = useNavigate();

    const command = (title) => {
        nav('/' + title.toLowerCase());
    };

    const Menus = [
        {label: "Clients", icon: "pi pi-users", command: () => command("Clients")},
        {label: "Courses", icon: "pi pi-book", command: () => command("Courses")},
        {label: "Installments", icon: "pi pi-money-bill", command: () => command("Installments")},
        {label: "Sales", icon: "pi pi-wallet", command: () => command("Sales")},
        {label: "Refunds", icon: "pi pi-refresh", command: () => command("Refunds")}
    ];

    return (
        <div className="sidebar">
            <h3>Dashboard</h3>
            <PanelMenu model={Menus}></PanelMenu>
        </div>
    );
};

export default SideBar;
