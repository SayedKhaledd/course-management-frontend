import {FileUpload} from 'primereact/fileupload';
import {DataTable} from "primereact/datatable";
import apiEndpoints from "../apiEndpoints.js";
import React, {useState} from "react";
import useAxios from "../hooks/useAxios.js";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import '../styles/Clients_Upload_Csv.css';
import Notification from "../components/Notification.jsx";
import {Button} from "primereact/button";

function ClientsUploadCsv() {
    const [parsedClients, setParsedClients] = useState([]);
    const [noOfErrors, setNoOfErrors] = useState(0);
    const [expandedRows, setExpandedRows] = useState(null);
    const [notification, setNotification] = useState({message: '', type: ''});
    const axios = useAxios();
    const MAX_FILE_SIZE = 10 * 1024 * 1024;


    const uploadHandler = async (event) => {
        const file = event.files[0];

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(apiEndpoints.parseClientCsv, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            const sortedClients = response.data.response
                .sort((a, b) => a.valid - b.valid)
                .map((client, index) => ({
                    ...client,
                    _uniqueId: index // Assigning a temporary unique ID
                }));
            setParsedClients(sortedClients);
            setNoOfErrors(sortedClients.filter(client => !client.valid).length);
            setNotification({message: 'File uploaded successfully', type: 'success'});
        } catch (error) {
            setNotification({message: 'Failed to upload file ' + error, type: 'error'});
        }
    };


    const rowClassName = (rowData) => {
        return rowData.valid ? "" : "invalid-row";
    };


    const rowExpansionTemplate = (rowData) => {
        const entries = Object.entries(rowData.errors);

        return (
            <div className="p-3">
                <h2>Errors</h2>
                <DataTable value={entries} showGridlines>
                    <Column field="0" header="Field Name"/>
                    <Column field="1" header="Error Message"/>
                </DataTable>

            </div>
        );

    };

    const expandAll = () => {
        let _expandedRows = {};

        parsedClients.forEach((client) => {
            if (Object.entries(client.errors).length > 0) {
                _expandedRows[client._uniqueId] = true;
            }
        });
        setExpandedRows(_expandedRows);
    };

    const collapseAll = () => {
        setExpandedRows(null);
    };

    const header = (
        <div className="flex flex-wrap justify-content-end gap-2">
            <Button icon="pi pi-plus" label="Expand All" onClick={expandAll} text/>
            <Button icon="pi pi-minus" label="Collapse All" onClick={collapseAll} text/>
        </div>
    );

    const uploadClients = () => {
        axios.post(apiEndpoints.saveParsedClients, parsedClients)
            .then(e => {
                    setNotification({message: 'Clients uploaded successfully', type: 'success'})
                }
            )
            .catch(error => {
                setNotification({message: 'Failed to upload clients ' + error, type: 'error'});
            });
    }

    const allowExpansion = (rowData) => {
        return Object.entries(rowData.errors).length > 0;
    };
    const footerTemplate = (
        <div>
            <p>
                Total Number of Invalid Clients: {noOfErrors}
            </p>
        </div>
    );

    return (
        <>
            <DataTable value={parsedClients}
                       rowClassName={rowClassName}
                       expandedRows={expandedRows}
                       onRowToggle={(e) => setExpandedRows(e.data)}
                       header={header}
                       rowExpansionTemplate={rowExpansionTemplate}
                       dataKey={"_uniqueId"}
                       rows={10}
                       totalRecords={parsedClients.length}
                       paginator={true}
                       rowsPerPageOptions={[5, 10, 20, 40, 50, 80, 100, 200, 400, 700]}
                       paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                       currentPageReportTemplate="{first} to {last} of {totalRecords} records"
                       footer={footerTemplate}

            >
                <Column expander={allowExpansion} style={{width: '5rem'}}/>

                <Column field="name" header={"Name"}></Column>
                <Column field="email" header={"Email"}></Column>
                <Column field="phone" header={"Phone"}
                ></Column>
                <Column field="alternativePhone" header={"Alternative Phone"}></Column>
                <Column field="specialty" header={"Specialty"}></Column>
                <Column
                    field="valid"
                    header="Validation"
                    body={(rowData) => (
                        <Tag severity={rowData.valid ? "success" : "danger"}
                             value={rowData.valid ? "Valid" : "Invalid"}/>
                    )}
                />

            </DataTable>
            <FileUpload
                name={"file"}
                accept={".csv"}
                uploadHandler={uploadHandler}
                maxFileSize={MAX_FILE_SIZE}
                customUpload={true}

            />

            <Button
                icon="pi pi-upload"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '16px', zIndex: 1000}}
                onClick={uploadClients}
                label="Upload Clients"
            />

            <Notification status={notification.type} message={notification.message}/>

        </>
    );
}

export default ClientsUploadCsv;