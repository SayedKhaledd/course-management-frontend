import React, {useEffect, useState} from 'react';
import {BASE_URL} from "../constants.js";
import useAxios from "../useAxios.js";
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import 'primeicons/primeicons.css';
import '../styles/Clients.css';
import {useNavigate} from 'react-router-dom';
import {downloadCSV, simplifyDate} from "../utils.js";
import {Dropdown} from "primereact/dropdown";
import Notification from "../components/Notification.jsx";
import {Dialog} from 'primereact/dialog';
import {Card} from 'primereact/card';
import {InputText} from 'primereact/inputtext';


function Clients() {
    const [clients, setClients] = useState([]);
    const [newClient, setNewClient] = useState({});
    const [editing, setEditing] = useState({clientId: null, columnField: null});
    const [editedValue, setEditedValue] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);
    const axios = useAxios();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState(null);
    const [displayDialog, setDisplayDialog] = useState(false);


    const fetchClients = () => {
        axios.get(BASE_URL + 'client/all',)
            .then(response => setClients(response.data.response))
            .catch(error => {
                    setMessage(`Failed to fetch clients: ${error}`);
                    setNotificationType('error');
                }
            );
    };
    const fetchStatusOptions = () => {
        axios.get(BASE_URL + 'client-status/all')
            .then(response =>
                setStatusOptions(response.data.response.map(status => ({id: status.id, status: status.status}))))
            .catch(error => {
                setMessage(`Failed to fetch status options: ${error}`);
                setNotificationType('error');
            });
    };

    useEffect(() => {
        fetchClients();
        fetchStatusOptions();
    }, []);

    const onEdit = (clientId, columnField, initialValue) => {
        setEditing({clientId, columnField});
        setEditedValue(initialValue);
    };
    const onRowClick = (client) => {
        navigate(`/client/${client.id}`, {state: {client}});
    };

    const onCancelEdit = () => {
        setEditing({clientId: null, columnField: null});
        setEditedValue('');
    };

    const getUpdateEndpoint = (clientId, column) => {
        if (column === 'status') {
            return `${BASE_URL}client/${clientId}/status/${editedValue.id}`;
        }
        return `${BASE_URL}client/${clientId}/${column.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
    };

    const onSubmitEdit = async (clientId, columnField) => {
        const endpoint = getUpdateEndpoint(clientId, columnField);
        const payload = columnField === 'status' ? {} : {[columnField]: editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchClients();
            onCancelEdit();
            setNotificationType('success');
            setMessage(`Updated ${columnField} successfully`);
        }).catch(error => {
            setNotificationType('error');
            setMessage(`Failed to update ${columnField}: ${error}`);
        });
    };

    const onCellChange = (e) => {
        setEditedValue(e.target.value);
    };
    const onStatusChange = (e) => {
        setEditedValue(statusOptions.find(option => option.status === e.target.value));
    };
    const openDialog = () => {
        setDisplayDialog(true);
    };

    const closeDialog = () => {
        setDisplayDialog(false);
        setNewClient({});
    };

    const createClient = () => {
        closeDialog();
        axios.post(BASE_URL + 'client', newClient)
            .then(() => {
                fetchClients();
                setNotificationType('success');
                setMessage('Client created successfully');
            })

            .catch(error => {
                setNotificationType('error');
                setMessage(`Failed to create client: ${error}`);
            });

    };

    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text onClick={() => {
        fetchClients();
        fetchStatusOptions();
        setMessage('Data refreshed successfully');
        setNotificationType('success');
    }}/>;

    const paginatorRight = <Button type="button" icon="pi pi-download" text onClick={() => downloadCSV(clients)}/>;
    const statusTemplate = (rowData, columnField, isEditable = true) => {
        const isEditing = editing.clientId === rowData.id && editing.columnField === columnField;
        return (
            <div style={{display: 'flex', alignItems: 'center'}}>
                {isEditing ? (
                    <>
                        <Dropdown
                            value={editedValue?.status}
                            options={statusOptions.map(e => e.status)}
                            onChange={onStatusChange}
                            optionLabel="name"
                            style={{marginRight: '8px'}}
                            placeholder="Select Status"
                            onClick={(e) => e.stopPropagation()}

                        />
                        <Button
                            icon="pi pi-check"
                            className="p-button-text p-button-success"
                            onClick={() =>
                                onSubmitEdit(rowData.id, columnField)}
                        />
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-danger"
                            onClick={onCancelEdit}
                        />
                    </>
                ) : (
                    <>
                        <span className="cell-content">{rowData.clientStatus?.status}</span>
                        {isEditable && (
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-text p-button-secondary"
                                style={{marginLeft: '8px'}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(rowData.id, columnField, rowData[columnField]);
                                }
                                }
                            />
                        )}
                    </>
                )}
            </div>
        );
    };


    const cellTemplate = (rowData, columnField, isEditable = true) => {
        const isEditing = editing.clientId === rowData.id && editing.columnField === columnField;
        return (
            <div className={"selectable-cell"} style={{display: 'flex', alignItems: 'center'}}>
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={editedValue}
                            onChange={onCellChange}
                            style={{marginRight: '8px'}}
                        />
                        <Button
                            icon="pi pi-check"
                            className="p-button-text p-button-success"
                            onClick={() => onSubmitEdit(rowData.id, columnField)}
                        />
                        <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-danger"
                            onClick={onCancelEdit}
                        />
                    </>
                ) : (
                    <>
                        <span className="cell-content">{rowData[columnField]}</span>
                        {isEditable && (
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-text p-button-secondary"
                                style={{marginLeft: '8px'}}
                                onClick={() =>
                                    onEdit(rowData.id, columnField, rowData[columnField])
                                }
                            />
                        )}
                    </>
                )}
            </div>
        );
    };


    return (
        <div style={{padding: '16px'}}>
            <DataTable
                value={clients}
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
                <Column field="name" header="Name" filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'name')}/>
                <Column field="email" header="Email" filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'email')}/>
                <Column field="phone" header="Phone" filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'phone')}/>
                <Column field={"alternativePhone"} header={"Alternative Phone"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'alternativePhone')}/>
                <Column
                    field="status"
                    header="Status"
                    filter={true}
                    sortable={true}
                    body={(rowData) => statusTemplate(rowData, 'status')}
                />
                <Column field={"country"} header={"Country"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'country')}/>
                <Column field={"nationality"} header={"Nationality"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'nationality')}/>
                <Column field={"address"} header={"Address"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'address')}/>
                <Column field={"createdDate"} header={"Created Date"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate({
                            ...rowData,
                            createdDate: simplifyDate(rowData.createdDate)
                        }, 'createdDate', false)}/>
                <Column field={"modifiedDate"} header={"Modified Date"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate({
                            ...rowData,
                            modifiedDate: simplifyDate(rowData.modifiedDate)
                        }, 'modifiedDate', false)}/>
                <Column field={"createdBy"} header={"Created By"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'createdBy', false)}/>
                <Column field={"modifiedBy"} header={"Modified By"} filter={true} sortable={true}
                        body={(rowData) => cellTemplate(rowData, 'modifiedBy', false)}/>

            </DataTable>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '16px', zIndex: 1000}}
                onClick={openDialog}
                label="New Client"
            />
            <Dialog
                header="Create New Client"
                visible={displayDialog}
                style={{width: '50vw'}}
                modal
                onHide={closeDialog}
            >
                {/* Card inside the dialog for the client creation form */}
                <Card title="Client Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="name">Name</label>
                            <InputText id="name"
                                       onInput={(e) => setNewClient({...newClient, name: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="email">Email</label>
                            <InputText id="email"
                                       onInput={(e) => setNewClient({...newClient, email: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="phone">Phone</label>
                            <InputText id="phone"
                                       onInput={(e) => setNewClient({...newClient, phone: e.target.value})}/>
                        </div>

                        {/* Save and Cancel buttons */}
                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createClient} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>

            <Notification status={notificationType} message={message}/>
        </div>
    );
}

export default Clients;
