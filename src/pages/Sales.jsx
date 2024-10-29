import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; // You can change the theme here
// import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Table from "../components/Table.jsx";
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import {TRUE_FALSE_OPTIONS} from "../constants.js";
import {simplifyDate} from "../utils.js"; // For using icons

function Sales() {
    const [notification, setNotification] = useState({message: '', type: ''});
    const [editingState, setEditingState] = useState({id: null, columnField: null, editedValue: null});

    const [sales, setSales] = useState([]);
    const axios = useAxios();

    const fetchSales = () => {
        axios.get(apiEndpoints.sales)
            .then(response => {
                    setSales(response.data.response.map(sales => ({
                        ...sales,
                        isReceived: sales.isReceived ? "Yes" : "No"
                    })));
                }
            ).catch(error =>
            setNotification({message: 'Failed to fetch sales ' + error, type: 'error'})
        );
    }

    useEffect(() => {
        fetchSales();

    }, []);


    const onEdit = (id, columnField, editedValue) => {
        setEditingState({id, columnField, editedValue});
    }

    const onCancelEdit = () => {
        setEditingState({id: '', columnField: '', editedValue: null});
    }

    const onSubmitEdit = (id, columnField) => {
        const endpoint = apiEndpoints.getUpdateIsReceivedSales(id, columnField, editingState.editedValue,
            sales[sales.findIndex(sale => sale.id === id)]['paymentType']);
        editingState.editedValue = editingState.editedValue === "Yes";

        axios.patch(endpoint).then(() => {
            fetchSales();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});

        }).catch(error =>
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'})
        );
    }

    const onDropDownChange = (e, columnField) => {
        setEditingState({
            ...editingState,
            editedValue: e.target.value
        });
    }


    const dropDownCellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onOptionChange: onDropDownChange
    }

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
                return simplifyDate(rowData.date)
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
        {
            field: 'isReceived',
            header: 'Is Received',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return DropDownCellTemplate(rowData, 'isReceived', null, editingState, TRUE_FALSE_OPTIONS, dropDownCellHandlers);
            }
        },
    ]


    return (
        <>
            <Table
                header={<h2>Sales</h2>}
                data={sales}
                columns={columns}
                paginatorLeftHandlers={[fetchSales]}
                downloadFileName={'sales'}
                setNotification={setNotification}

            ></Table>

            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Sales;
