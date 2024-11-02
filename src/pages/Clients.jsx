import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
import {Button} from 'primereact/button';
import 'primeicons/primeicons.css';
import '../styles/Clients.css';
import {useNavigate} from 'react-router-dom';
import Notification from "../components/Notification.jsx";
import {Dialog} from 'primereact/dialog';
import {Card} from 'primereact/card';
import {InputText} from 'primereact/inputtext';
import apiEndpoints from "../apiEndpoints.js";
import CellTemplate from "../templates/CellTemplate.jsx";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import Table from "../components/Table.jsx";
import {genericSortFunction, simplifyDate} from "../utils.js";
import {ConfirmDialog} from "primereact/confirmdialog";
import {COUNTRIES, INITIAL_COURSES, NATIONALITIES} from "../constants.js";
import {Dropdown} from "primereact/dropdown";


function Clients() {
    const [clients, setClients] = useState([]);
    const [newClient, setNewClient] = useState({});
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [statusOptions, setStatusOptions] = useState([]);
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);
    const axios = useAxios();
    const navigate = useNavigate();
    const [notification, setNotification] = useState({message: '', type: ''});
    const [displayDialog, setDisplayDialog] = useState(false);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, client: null});
    const [filters, setFilters] = useState({});
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [noOfRecordsPerPage, setNoOfRecordsPerPage] = useState(10);


    const fetchClients = () => {
        setLoading(true);
        console.log("apiEndpoints.getPaginatedClients", apiEndpoints.getPaginatedClients);
        axios.post(apiEndpoints.getPaginatedClients, {
            pageNumber: 1,
            pageSize: noOfRecordsPerPage,
            deletedRecords: false,
            sortBy: "name",
            sortDesc: true

        })
            .then(response => {
                setClients(response.data.response.result)
                console.log("response.data.response.totalNumberOfElements", response.data.response.totalNumberOfElements);
                if (totalRecords === 0) {
                    setTotalRecords(response.data.response.totalNumberOfElements);
                }
                setNoOfRecordsPerPage(response.data.response.pageSize);
                setLoading(false);
            })
            .catch(error => {
                    console.log(error);
                    setNotification({message: `Failed to fetch clients: ${error}`, type: 'error'});

                }
            )
    };
    const fetchReferralSourceOptions = () => {
        axios.get(apiEndpoints.referralSources)
            .then(response =>
                setReferralSourceOptions(response.data.response.map(source => ({
                    id: source.id,
                    source: source.source
                }))))
            .catch(error =>
                setNotification({message: `Failed to fetch referral source options: ${error}`, type: 'error'})
            );
    }
    const fetchStatusOptions = () => {
        axios.get(apiEndpoints.statuses)
            .then(response =>
                setStatusOptions(response.data.response.map(status => ({id: status.id, status: status.status}))))
            .catch(error =>
                setNotification({message: `Failed to fetch status options: ${error}`, type: 'error'})
            );
    };

    useEffect(() => {
        fetchClients();
        fetchStatusOptions();
        fetchReferralSourceOptions();
        setFilters({
            createdDate: {value: new Date().toISOString().split('T')[0], matchMode: 'contains'}  // Set the default filter value and mode here
        });
    }, []);

    const onEdit = (id, columnField, editedValue) => {
        setEditingState({id, columnField, editedValue});
    };
    const onCancelEdit = () => {
        setEditingState({id: '', columnField: '', editedValue: null});
    };
    const onCellChange = (e) => {
        setEditingState({...editingState, editedValue: e.target.value});
    };

    const onSubmitEdit = async (clientId, columnField) => {
        const endpoint = apiEndpoints.getClientUpdateEndpoint(clientId, columnField, editingState.editedValue.id);
        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchClients();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});

        }).catch(error =>
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'})
        );

    };
    const onDropDownChange = (e, columnField) => {
        switch (columnField) {
            case 'clientStatus':
                setEditingState({
                    ...editingState,
                    editedValue: statusOptions.find(option => option.status === e.target.value)
                });
                break;
            case 'referralSource':
                setEditingState({
                    ...editingState,
                    editedValue: referralSourceOptions.find(option => option.source === e.target.value)
                });
                break;
            case 'country':
                setEditingState({
                    ...editingState,
                    editedValue: COUNTRIES.find(option => option === e.target.value)
                });
                break;
            case 'nationality':
                setEditingState({
                    ...editingState,
                    editedValue: NATIONALITIES.find(option => option === e.target.value)
                });
                break;
            case 'initialCourseName':
                setEditingState({
                    ...editingState,
                    editedValue: INITIAL_COURSES.find(option => option === e.target.value)
                });
                break;
        }

    };

    const cellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onCellChange
    };
    const dropDownCellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onOptionChange: onDropDownChange
    }


    const columns = [
        {
            field: 'name',
            header: 'Name',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'name', editingState, cellHandlers)
        },

        {
            field: 'email',
            header: 'Email',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'email', editingState, cellHandlers)
        },
        {
            field: 'phone',
            header: 'Phone',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'phone', editingState, cellHandlers)
        },
        {
            field: 'alternativePhone',
            header: 'Alternative Phone',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'alternativePhone', editingState, cellHandlers)
        },
        {
            field: 'initialCourseName',
            header: 'Initial Course',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'initialCourseName', null, editingState, INITIAL_COURSES, dropDownCellHandlers)
        },
        {
            field: 'clientStatus',
            header: 'Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            sortFunction: (e) => {
                return genericSortFunction(e, 'clientStatus', 'status');
            },
            body: (rowData) => DropDownCellTemplate(rowData, 'clientStatus', 'status', editingState, statusOptions, dropDownCellHandlers)
        },
        {
            field: 'referralSource',
            header: 'Referral Source',
            listFieldName: 'source',
            filter: true,
            sortable: true,
            sortFunction: (e) => {
                return genericSortFunction(e, 'referralSource', 'source');
            },
            body: (rowData) => DropDownCellTemplate(rowData, 'referralSource', 'source', editingState, referralSourceOptions, dropDownCellHandlers)
        },
        {
            field: 'country',
            header: 'Country',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'country', null, editingState, COUNTRIES, dropDownCellHandlers)
        },
        {
            field: 'nationality',
            header: 'Nationality',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'nationality', null, editingState, NATIONALITIES, dropDownCellHandlers)
        },
        {
            field: 'address',
            header: 'Address',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'address', editingState, cellHandlers)
        },
        {
            field: 'createdDate',
            header: 'Created Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                createdDate: simplifyDate(rowData.modifiedDate)
            }, 'createdDate', editingState, cellHandlers, false)
        },
        {
            field: 'modifiedDate',
            header: 'Modified Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                modifiedDate: simplifyDate(rowData.modifiedDate)
            }, 'modifiedDate', editingState, cellHandlers, false)
        },
        {
            field: 'createdBy',
            header: 'Created By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'createdBy', editingState, cellHandlers, false)
        },
        {
            field: 'modifiedBy',
            header: 'Modified By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'modifiedBy', editingState, cellHandlers, false)
        }];

    const onRowClick = (client) => {
        navigate(`/client/${client.id}`, {state: {client}});
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
        axios.post(apiEndpoints.createClient, newClient)
            .then(() => {
                fetchClients();
                setNotification({message: 'Client created successfully', type: 'success'});

            }).catch(error => setNotification({message: `Failed to create client: ${error}`, type: 'error'}));

    };
    const onDeleteRow = (rowData) => {
        setConfirmDeleteDialog({visible: true, client: rowData});
    }
    const deleteClient = () => {
        axios.delete(apiEndpoints.getClientDeleteEndpoint(confirmDeleteDialog.client.id))
            .then(() => {
                fetchClients();
                setNotification({message: 'Client deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, client: null});
            }).catch(error => setNotification({message: `Failed to delete client: ${error}`, type: 'error'}));
    }
    const cancelDeleteClient = () => {
        setConfirmDeleteDialog({visible: false, client: null});
    }
    const onPage = (e) => {
        const pageNumber = e.page + 1;
        const pageSize = e.rows;
        setLoading(true);
        axios.post(apiEndpoints.getPaginatedClients, {
            pageNumber: pageNumber,
            pageSize: pageSize,
            deletedRecords: false,
            sortBy: "name",
            sortDesc: true
        })
            .then(response => {
                setClients(response.data.response.result)
                setLoading(false);
                setNoOfRecordsPerPage(response.data.response.pageSize);
            })
            .catch(error => {
                    setNotification({message: `Failed to fetch clients: ${error}`, type: 'error'});
                }
            )
    }

    return (<>
            <Table
                header={<h2>Clients</h2>}
                columns={columns} data={clients} onRowClick={onRowClick} onDeleteRow={onDeleteRow}
                setNotification={setNotification}
                paginatorLeftHandlers={{fetchClients, fetchStatusOptions}}
                totalNoOfRecords={totalRecords}
                onPage={onPage}
                noOfRows={noOfRecordsPerPage}
                loading={loading}
                downloadFileName="clients"
                filters={filters}
            ></Table>
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

                        <div className="p-field">
                            <label htmlFor="initialCourseName">Initial Course Name</label>
                            <Dropdown id="initialCourseName"
                                      options={INITIAL_COURSES}
                                      value={newClient.initialCourseName || ''}
                                      onChange={(e) => setNewClient({
                                          ...newClient,
                                          initialCourseName: e.target.value
                                      })}/>


                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createClient} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>
            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteClient}
                accept={deleteClient}
                header={`Delete ${confirmDeleteDialog.client ? confirmDeleteDialog.client.name : ''}`}
                message={`Are you sure you want to delete ${confirmDeleteDialog.client ? confirmDeleteDialog.client.name : ''}?`}
            >
            </ConfirmDialog>
            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Clients;
