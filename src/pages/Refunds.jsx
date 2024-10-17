import {useEffect, useState} from 'react';
import {BASE_URL} from "../constants.js";
import useAxios from "../useAxios.js";
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; // You can change the theme here
// import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'; // For using icons

function Refunds() {
    const columns = [
        {
            name: 'Client Name',
            selector: row => row.enrollment ? row.enrollment.client ? row.enrollment.client.name : 'N/A' : 'N/A'
        },
        {name: 'Course Code', selector: row => row.enrollment?.course?.code},
        {name: 'Course Name', selector: row => row.enrollment?.course?.name},
        {name: 'Amount', selector: row => row.amount},
        {name: 'Refund Date', selector: row => row.refundDate},
        {name: 'Reason', selector: row => row.refundReason?.reason},
        {name: 'Explanation', selector: row => row.explanation},
        {name: 'Currency', selector: row => row.currency},
        {name: 'Status', selector: row => row.paymentStatus?.status},
        {name: 'Refund Method', selector: row => row.paymentMethod?.method},

    ];

    const [refunds, setRefunds] = useState([]);
    const axios = useAxios();

    useEffect(() => {

        //TODO: WILL ADD THE PAGINATED API LATER

        // axios.post(BASE_URL + 'client/find-paginated-and-filtered', {
        //     pageNumber: 1,
        //     pageSize: 250,
        //     deletedRecords: false,
        //     sortBy: "name",
        //     sortDesc: true
        // }).then(response => {
        //     setClients(response.data.response.result);
        // }).catch(error => console.log(error));

        axios.get(BASE_URL + 'refunds/all').then(response => {
            setRefunds(Array.isArray(response.data.response) ? response.data.response : []);
        }).catch(error => console.log(error));


    }, []);

    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text/>;
    const paginatorRight = <Button type="button" icon="pi pi-download" text/>;

    return (
        <div style={{padding: '16px'}}>
            <DataTable
                value={refunds}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
                width="80%"
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                paginatorLeft={paginatorLeft}
                paginatorRight={paginatorRight}
                showGridlines={true}
                stripedRows
                style={{border: '1px solid #d9d9d9', borderRadius: '8px'}}
                className="p-datatable-table"  // Use smaller table rows
            >
                {columns.map((col, index) => (
                    <Column key={index} field={col.selector} header={col.name}/>
                ))}
            </DataTable>
        </div>
    );
}

export default Refunds;
