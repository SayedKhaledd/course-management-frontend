import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from "primereact/button";
import {downloadCSV} from "../utils.js";


const Table = ({
                   data,
                   columns,
                   onRowClick,
                   paginatorLeftHandlers,
                   setNotification,
                   downloadFileName = 'data'


               }) => {

    const handleRefresh = () => {
        Object.keys(paginatorLeftHandlers).forEach(handler => {
            if (typeof paginatorLeftHandlers[handler] === 'function') {
                paginatorLeftHandlers[handler]();
            }
        });
        setNotification({message: 'Data refreshed successfully', type: 'success'});
    };

    const paginatorLeft = (
        <Button type="button" icon="pi pi-refresh" text onClick={() => {
            handleRefresh();

            setNotification({message: 'Data refreshed successfully', type: 'success'});
        }}/>
    );
    const paginatorRight = (<Button type="button" icon="pi pi-download" text
                                    onClick={() => downloadCSV(data, columns, downloadFileName)}/>);

    return (
        <div style={{width: '60rem',}}>
            <DataTable
                value={data}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 20]}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                paginatorLeft={paginatorLeft}
                paginatorRight={paginatorRight}
                showGridlines={true}
                stripedRows
                style={{border: '1px solid #d9d9d9', borderRadius: '8px'}}
                className="p-datatable-table"
                scrollable={true}
                removableSort
                onRowClick={(e) => onRowClick(e.data)}
            >
                {columns.map((col, index) => (
                    <Column
                        key={index}
                        field={col.field}
                        header={col.header}
                        filter={col.filter}
                        sortable={col.sortable}
                        body={col.body}
                    />
                ))}
            </DataTable></div>
    );
};

export default Table;
