"use client";

// import { Sidebar } from "flowbite-react";
import "./styles/CustomSidebar.css"; // Import custom CSS file
import {Menu, MenuItem, Sidebar} from 'react-pro-sidebar';
import {BsPerson} from "react-icons/bs";
import {MdMenuBook, MdMoney} from "react-icons/md";
import {GrMoney} from "react-icons/gr";
import {RiRefund2Fill} from "react-icons/ri";

export function CustomSideBar() {
    return (

        <Sidebar className="custom-sidebar">
            <Menu className="sidebar-container">
                <MenuItem icon={<BsPerson/>} className="sidebar-item">Clients</MenuItem>
                <MenuItem icon={<MdMenuBook/>} className="sidebar-item">Courses</MenuItem>
                <MenuItem icon={<MdMoney/>} className="sidebar-item">Installments</MenuItem>
                <MenuItem icon={<GrMoney/>} className="sidebar-item">Sales</MenuItem>
                <MenuItem icon={<RiRefund2Fill/>} className="sidebar-item">Refunds</MenuItem>

            </Menu>

        </Sidebar>
    );
}

export default CustomSideBar;
