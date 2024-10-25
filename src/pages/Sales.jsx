import {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; // You can change the theme here
// import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Table from "../components/Table.jsx";
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js"; // For using icons

function Sales() {
    const [notification, setNotification] = useState({message: '', type: ''});


    const [sales, setSales] = useState([]);
    const axios = useAxios();

    const fetchSales = () => {
        axios.get(apiEndpoints.sales)
            .then(response => {
                setSales(response.data.response);
            }).catch(error =>
            setNotification({message: 'Failed to fetch sales ' + error, type: 'error'})
        );
    }

    useEffect(() => {
        fetchSales();

    }, []);

    //clientName, course name, course code, amount, payment type, payment method, date, currency
    const columns = [
        {
            field: 'clientName',
            header: 'Client Name',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.clientName
            }
        },
        {
            field: 'courseName',
            header: 'Course Name',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.courseName
            }
        },
        {
            field: 'courseCode',
            header: 'Course Code',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.courseCode
            }
        },
        {
            field: 'amount',
            header: 'Amount',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.amount
            }
        },
        {
            field: 'paymentType',
            header: 'Payment Type',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.paymentType
            }
        },
        {
            field: 'paymentMethod',
            header: 'Payment Method',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.paymentMethod
            }
        },
        {
            field: 'date',
            header: 'Date',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.date
            }
        },
        {
            field: 'currency',
            header: 'Currency',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.currency
            }
        },
    ]


    return (
        <>
            <Table
                header={'Sales'}
                data={sales}
                columns={columns}
                paginatorLeftHandlers={[fetchSales]}
                downloadFileName={'sales'}

            ></Table>

            <Notification message={notification.message} type={notification.type}/>
        </>
    );
}

export default Sales;
