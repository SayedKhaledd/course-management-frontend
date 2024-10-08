"use client";

import styles from "../styles/modules/SideBar.module.css";
import '../styles/colors.css'; // Import custom CSS file
import {Link} from 'react-router-dom';
import {IMAGES_PATH} from "../constants.js";

const Menus = [
    {title: "Clients", src: "clients.svg"},
    {title: "Courses", src: "courses.svg"},
    {title: "Installments", src: "installments.svg"},
    {title: "Sales ", src: "sales.svg"},
    {title: "Refunds", src: "refunds.svg"},
];
const SideBar = () => {
    return (
        <div className={styles.sidebar}>
            <h3>Dashboard</h3>

            <div className={styles.menu}>
                {Menus.map((menu, index) => (
                    <div key={index} className={styles.menuItem}>
                        <img src={IMAGES_PATH + menu.src}/>
                        <Link to={`/${menu.title.toLowerCase()}`} className={styles.Link}> {menu.title} </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default SideBar
