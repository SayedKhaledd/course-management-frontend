import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; // You can change the theme here
// import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import {TRUE_FALSE_OPTIONS} from "../constants.js";
import {downloadCSV, simplifyDate} from "../utils.js";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {PDFDownloadLink} from "@react-pdf/renderer";
import Report from "../components/pdf/Report.jsx";
import useSecurity from "../hooks/useSecurity.js"; // For using icons

function Sales() {
    const [notification, setNotification] = useState({message: '', type: ''});
    const [editingState, setEditingState] = useState({id: null, columnField: null, editedValue: null});

    const [sales, setSales] = useState([]);
    const axios = useAxios();
    const security = useSecurity();

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

    const paginatorLeft = (
        <Button type="button" icon="pi pi-refresh" text onClick={() => {
            fetchSales();

            setNotification({message: 'Data refreshed successfully', type: 'success'});
        }}/>
    );
    const headers = (
        <div className="flex align-items-center justify-content-end gap-2">
            {security.isAuthorizedToDownloadData() ? (
                <>
                    <Button type="button" icon="pi pi-file-excel" severity="success" rounded
                            onClick={() => downloadCSV(sales, columns, 'sales')}
                            data-pr-tooltip="XLS"/>

                    <PDFDownloadLink document={<Report data={sales} columns={columns}/>}
                                     fileName={'sales.pdf'}>
                        <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded
                                data-pr-tooltip="PDF"/>
                    </PDFDownloadLink>
                </>) : null}
        </div>
    );
    return (
        <>
            <DataTable
                header={<h2>Sales</h2>}
                value={sales}
                paginator
                totalRecords={sales.length}
                rows={sales.length}
                rowsPerPageOptions={[5, 10, 400]}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords} records"
                paginatorLeft={paginatorLeft}
                paginatorRight={<div/>}
                showGridlines={true}
                stripedRows
                style={{border: '1px solid #d9d9d9', borderRadius: '8px'}}
                className="p-datatable-table"
                scrollable={true}
                removableSort
                onRowClick={(e) => onRowClick(e.data)}
                footer={headers}
            >

                {columns.map((col, index) => {
                    return <Column
                        key={index}
                        field={col.field}
                        header={col.header}
                        filter={col.filter}
                        sortable={col.sortable}
                        showFilterMenu={true}
                        body={col.body}
                        style={{minWidth: '12rem'}}

                    />;


                })}

            </DataTable>

            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Sales;
