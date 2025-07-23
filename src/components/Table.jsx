import React, {useEffect, useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from "primereact/button";
import {downloadCSV} from "../utils.js";
import {PDFDownloadLink} from "@react-pdf/renderer";
import Report from "./pdf/Report.jsx";
import useSecurity from "../hooks/useSecurity.js";
import {MultiSelect} from "primereact/multiselect";


const Table = ({
                   header,
                   data,
                   columns,
                   onRowClick,
                   onDeleteRow,
                   paginatorLeftHandlers,
                   setNotification,
                   loading,
                   filters,
                   setFilters,
                   fetchPaginatedItems,
                   paginationParams,
                   setPaginationParams,
                   sorting,
                   setSorting,
                   onPage,
                   downloadFileName = 'data',

               }) => {
    const security = useSecurity();

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
    const [selectedColumns, setSelectedColumns] = useState(
        JSON.parse(sessionStorage.getItem('`selectedColumns_' + downloadFileName))
        || columns.map(col => col.field));
    const columnSelectionTemplate = (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            <div style={{flex: 1}}>
                {header}
            </div>

            <div style={{flexShrink: 0,}}>
                <MultiSelect
                    value={selectedColumns}
                    options={columns.map(col => ({label: col.header, value: col.field}))}
                    onChange={(e) => setSelectedColumns(e.value)}
                    placeholder="Select Columns"
                    display="overlay"
                    selectedItemTemplate={() => null}
                    itemTemplate={(option) => (
                        <div>
                            <span>{option.label}</span>
                        </div>
                    )}
                />
            </div>
        </div>
    );

    const footers = (
        <div className="flex align-items-center justify-content-end gap-2">
            {security.isAuthorizedToDownloadData() ? (<>
                <Button type="button" icon="pi pi-file-excel" severity="success" rounded
                        onClick={() => downloadCSV(data, columns, downloadFileName)}
                        data-pr-tooltip="XLS"/>

                <PDFDownloadLink document={<Report data={data} columns={columns}/>}
                                 fileName={downloadFileName + '.pdf'}>
                    <Button type="button" icon="pi pi-file-pdf" severity="warning" rounded
                            data-pr-tooltip="PDF"/>
                </PDFDownloadLink> </>) : null}


        </div>
    );

    const deleteButtonTemplate = (rowData) => {
        return (
            <Button icon="pi pi-trash" className="p-button-danger p-button-text"
                    onClick={() => onDeleteRow(rowData)}/>
        );
    };

    useEffect(() => {
        fetchPaginatedItems();
    }, [filters, sorting]);

    useEffect(() => {
        sessionStorage.setItem('`selectedColumns_' + downloadFileName, JSON.stringify(selectedColumns));
    }, [selectedColumns]);

    return (

            <DataTable
                header={columnSelectionTemplate}
                value={data}
                paginator
                rows={paginationParams.pageSize}
                totalRecords={paginationParams.totalNumberOfElements}
                loading={loading}
                first={(paginationParams.pageNumber - 1) * paginationParams.pageSize}
                onPage={onPage}
                lazy
                rowsPerPageOptions={[5, 10, 100, 200, 400]}
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
                footer={footers}
                filters={filters}
                onFilter={(e) => {
                    setFilters(e.filters);
                }}
                sortField={sorting.sortBy}
                sortOrder={sorting.sortDesc ? -1 : 1}
                onSort={(e) => {
                    setSorting({
                        ...sorting,
                        sortBy: e.sortField,
                        sortDesc: e.sortOrder === -1
                    });
                }}
                filterDisplay="row"
            >

                {columns.filter(col => selectedColumns.includes(col.field))
                    .map((col, index) => {
                        return <Column
                            key={index}
                            field={col.field}
                            header={col.header}
                            filter={col.filter}
                            sortable={col.sortable}
                            sortField={col.field}
                            showFilterMenu={false}
                            filterField={col.filterField ?? col.field}
                            filterMenuStyle={{width: '14rem'}}
                            filterElement={col.filterElement}
                            body={col.body}
                            style={{minWidth: '12rem'}}
                        />;
                    })}

                <Column
                    body={deleteButtonTemplate}
                    header="Delete"
                    style={{width: '100px', textAlign: 'center'}}
                />
            </DataTable>

    );
};

export default Table;
