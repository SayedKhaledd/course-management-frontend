import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from "primereact/button";
import {downloadCSV, exportPdf} from "../utils.js";


const Table = ({
                   header,
                   data,
                   columns,
                   onRowClick,
                   onDeleteRow,
                   paginatorLeftHandlers,
                   setNotification,
                   loading,
                   totalRecords,
                   onPage,
                   downloadFileName = 'data',

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
    const headers = (
        <div className="flex align-items-center justify-content-end gap-2">

            <Button type="button" icon="pi pi-file-excel" severity="success" rounded
                    onClick={() => downloadCSV(data, columns, downloadFileName)}
                    data-pr-tooltip="XLS"/>
            <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded
                    onClick={() => exportPdf(columns, data, downloadFileName)}
                    data-pr-tooltip="PDF"/>
        </div>
    );

    const deleteButtonTemplate = (rowData) => {
        return (
            <Button icon="pi pi-trash" className="p-button-danger p-button-text"
                    onClick={() => onDeleteRow(rowData)}/>
        );
    };
    return (
        <div style={{width: '60rem',}}>
            <DataTable
                header={header}
                value={data}
                paginator
                rows={10}
                totalRecords={totalRecords}
                loading={loading}
                onPage={onPage}
                rowsPerPageOptions={[5, 10, 400]}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
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
                    if (col.field === 'enrollment') {
                        if (col.listFieldName === 'client') {
                            return (<Column
                                key={`client-${index}`}
                                field={"enrollment.client.name"}
                                header={col.header}
                                filter={col.filter}
                                sortable={col.sortable}
                                sortFunction={col.sortFunction}
                                filterMatchMode={!col.listFieldName ? 'contains' : 'custom'}
                                filterFunction={(value, filter) => {
                                    const nestedValue = value.toLowerCase() ?? '';
                                    return nestedValue.includes(filter.toLowerCase());
                                }
                                }
                                body={col.body}
                            />);
                        } else if (col.listFieldName === 'course') {
                            return (
                                <Column
                                    key={`course-${index}`}
                                    field={"enrollment.course.name"}
                                    header="Course"
                                    filter={col.filter}
                                    sortable={col.sortable}
                                    sortFunction={col.sortFunction}
                                    filterMatchMode={!col.listFieldName ? 'contains' : 'custom'}
                                    filterFunction={
                                        (value, filter) => {
                                            const nestedValue = value?.toLowerCase() ?? '';
                                            return nestedValue.startsWith(filter.toLowerCase());
                                        }

                                    }
                                    body={col.body}
                                />
                            )
                        }

                    } else {
                        return (
                            <Column
                                key={index}
                                field={col.field}
                                header={col.header}
                                filter={col.filter}
                                sortable={col.sortable}
                                sortFunction={col.sortFunction}
                                filterMatchMode={!col.listFieldName ? 'contains' : 'custom'}
                                filterFunction={
                                    col.listFieldName ? (value, filter) => {
                                            const nestedValue = value?.[col.listFieldName]?.toLowerCase() ?? '';
                                            return nestedValue.startsWith(filter.toLowerCase());
                                        }
                                        : null
                                }
                                body={col.body}
                            />
                        );
                    }
                })}
                <Column
                    body={deleteButtonTemplate}
                    header="Delete"
                    style={{width: '100px', textAlign: 'center'}}
                />
            </DataTable></div>
    );
};

export default Table;
