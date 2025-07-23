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
import Table from "../components/Table.jsx";
import {FilterMatchMode} from 'primereact/api';
import {ConfirmDialog} from "primereact/confirmdialog";
import {COUNTRIES, NATIONALITIES} from "../constants.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import DynamicListRowFilterTemplate from "../templates/DynamicListRowFilterTemplate.jsx";
import staticListRowFilterTemplate from "../templates/StaticListRowFilterTemplate.jsx";
import {getCriteria, getCustomSorting, simplifyDate} from "../utils.js";
import useSecurity from "../hooks/useSecurity.js";
import {Dropdown} from "primereact/dropdown";


function Clients() {
    const [clients, setClients] = useState([]);
    const [newClient, setNewClient] = useState({});
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [statusOptions, setStatusOptions] = useState([]);
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);
    const [initialCourseOptions, setInitialCourseOptions] = useState([]);
    const axios = useAxios();
    const navigate = useNavigate();
    const security = useSecurity();
    const [notification, setNotification] = useState({message: '', type: ''});
    const [displayDialog, setDisplayDialog] = useState(false);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, client: null});
    const initialFilters = JSON.parse(sessionStorage.getItem('clientsFilters')) || {
        id: {value: null, matchMode: 'contains'},
        name: {value: null, matchMode: 'contains'},
        email: {value: null, matchMode: 'contains'},
        phone: {value: null, matchMode: 'contains'},
        countries: {value: [], matchMode: FilterMatchMode.IN},
        nationalities: {value: [], matchMode: FilterMatchMode.IN},
        clientStatusIds: {value: [], matchMode: FilterMatchMode.IN},
        initialCourseIds: {value: [], matchMode: FilterMatchMode.IN},
        alternativePhone: {value: null, matchMode: 'contains'},
        referralSourceIds: {value: [], matchMode: FilterMatchMode.IN},
        description: {value: null, matchMode: 'contains'},
        address: {value: null, matchMode: 'contains'},
        createdBy: {value: null, matchMode: 'contains'},
        modifiedBy: {value: null, matchMode: 'contains'},
        createdDate: {value: null, matchMode: 'contains'},
        modifiedDate: {value: null, matchMode: 'contains'},
    };

    const [filters, setFilters] = useState(initialFilters);

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalNumberOfElements: 0,
    });

    const initialSorting = JSON.parse(sessionStorage.getItem('clientsSorting')) || {
        sortBy: "name",
        sortDesc: false,
        defaultSortField: "name",
    }
    const [sorting, setSorting] = useState(initialSorting);
    const [loading, setLoading] = useState(true);


    const fetchPaginatedItems = (paginationDetails = null) => {
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedClients, {
            ...customPagination,
            ...customSorting,
            criteria,
        })
            .then(response => {
                const {pageNumber, pageSize, totalNumberOfElements, result} = response.data.response;
                setPagination(prev => ({
                    ...prev,
                    pageNumber,
                    pageSize,
                    totalNumberOfElements,
                }));
                setClients(result);
                setLoading(false);
            })
            .catch(error => {
                setNotification({message: `Failed to fetch clients: ${error}`, type: 'error'});
                setLoading(false);
            });

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
        axios.get(apiEndpoints.clientStatuses)
            .then(response =>
                setStatusOptions(response.data.response.map(status => ({id: status.id, status: status.status}))))
            .catch(error =>
                setNotification({message: `Failed to fetch status options: ${error}`, type: 'error'})
            );
    };
    const fetchInitialCourseOptions = () => {
        axios.get(apiEndpoints.initialCourses)
            .then(response =>
                setInitialCourseOptions(response.data.response.map(course => ({
                    id: course.id,
                    name: course.name
                }))))
            .catch(error =>
                setNotification({message: `Failed to fetch initial course options: ${error}`, type: 'error'})
            );
    }

    useEffect(() => {
        sessionStorage.setItem('clientsFilters', JSON.stringify(filters));
        sessionStorage.setItem('clientsSorting', JSON.stringify(sorting));
    }, [filters, sorting]);

    useEffect(() => {
        fetchPaginatedItems();
        fetchStatusOptions();
        fetchInitialCourseOptions();
        fetchReferralSourceOptions();
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
            fetchPaginatedItems();
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
            case 'initialCourse':
                setEditingState({
                    ...editingState,
                    editedValue: initialCourseOptions.find(option => option.name === e.target.value)
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
            field: 'id',
            header: 'Id',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'id', editingState, cellHandlers, false)
        }, {
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
            field: 'initialCourse',
            header: 'Initial Course',
            listFieldName: 'name',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.initialCourseIds.value,
                filterApplyCallback: (value) => {
                    setFilters({
                        ...filters,
                        initialCourseIds: {value, matchMode: FilterMatchMode.IN},
                    })
                },
            }, initialCourseOptions, 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'initialCourse', 'name', editingState, initialCourseOptions, dropDownCellHandlers)
        },
        {
            field: 'clientStatus',
            header: 'Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.clientStatusIds.value,
                filterApplyCallback: (value) => {
                    setFilters({
                        ...filters,
                        clientStatusIds: {value, matchMode: FilterMatchMode.IN},
                    })
                },
            }, statusOptions, 'status'),
            body: (rowData) => DropDownCellTemplate(rowData, 'clientStatus', 'status', editingState, statusOptions, dropDownCellHandlers)
        },
        {
            field: 'referralSource',
            header: 'Referral Source',
            listFieldName: 'source',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.referralSourceIds.value,
                filterApplyCallback: (value) => {
                    setFilters({
                        ...filters,
                        referralSourceIds: {value, matchMode: FilterMatchMode.IN},
                    })
                },
            }, referralSourceOptions, 'source'),

            body: (rowData) => DropDownCellTemplate(rowData, 'referralSource', 'source', editingState, referralSourceOptions, dropDownCellHandlers)
        },

        {
            field: 'description',
            header: 'Description',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'description', editingState, cellHandlers)
        },
        {
            field: 'notes',
            header: 'Notes',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'notes', editingState, cellHandlers)
        }

        , {
            field: 'country',
            header: 'Country',
            filter: true,
            sortable: true,
            filterElement: staticListRowFilterTemplate({
                value: filters.countries.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    countries: {value, matchMode: FilterMatchMode.IN},
                }),
            }, COUNTRIES),

            body: (rowData) => DropDownCellTemplate(rowData, 'country', null, editingState, COUNTRIES, dropDownCellHandlers)
        },
        {
            field: 'nationality',
            header: 'Nationality',
            filter: true,
            sortable: true,
            filterElement: staticListRowFilterTemplate({
                value: filters.nationalities.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    nationalities: {value, matchMode: FilterMatchMode.IN},
                })
            }, NATIONALITIES),

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
            field: 'alternativePhone',
            header: 'Alternative Phone',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'alternativePhone', editingState, cellHandlers)
        },
        {
            field: 'createdDate',
            header: 'Created Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                createdDate: simplifyDate(rowData.createdDate)
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
        }
    ];

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
        axios.post(apiEndpoints.createClient, {
            ...newClient,
            clientStatusId: newClient.clientStatus?.id,
            initialCourseId: newClient.initialCourse.id,
            referralSourceId: newClient.referralSource?.id,
            email: newClient.email || null,
        })
            .then(() => {
                fetchPaginatedItems();
                setNotification({message: 'Client created successfully', type: 'success'});

            }).catch(error => setNotification({message: `Failed to create client: ${error}`, type: 'error'}));

    };
    const onDeleteRow = (rowData) => {
        if (security.isAuthorizedToDelete())
            setConfirmDeleteDialog({visible: true, client: rowData});
        else
            setNotification({message: 'You are not authorized to delete clients', type: 'error'});
    }
    const deleteClient = () => {
        axios.delete(apiEndpoints.getClientDeleteEndpoint(confirmDeleteDialog.client.id))
            .then(() => {
                fetchPaginatedItems();
                setNotification({message: 'Client deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, client: null});
            }).catch(error => setNotification({message: `Failed to delete client: ${error}`, type: 'error'}));
    }
    const cancelDeleteClient = () => {
        setConfirmDeleteDialog({visible: false, client: null});
    }
    const onPage = (e) => {
        fetchPaginatedItems({pageNumber: e.page + 1, pageSize: e.rows});
    }

    const navigateToUploadCsv = () => {
        navigate('/clients/upload-csv');
    }

    return (<>

            <Button
                label="Upload CSV"
                icon="pi pi-upload"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '200px', zIndex: 1000}}
                onClick={navigateToUploadCsv}/>


            <Table
                header={<h2>Clients</h2>}
                columns={columns} data={clients} onRowClick={onRowClick} onDeleteRow={onDeleteRow}
                setNotification={setNotification}
                paginatorLeftHandlers={{fetchClients: fetchPaginatedItems, fetchStatusOptions}}
                onPage={onPage}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                fetchPaginatedItems={fetchPaginatedItems}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                downloadFileName="clients"

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
                            <label htmlFor="name">Name *</label>
                            <InputText id="name"
                                       onInput={(e) => setNewClient({...newClient, name: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="email">Email</label>
                            <InputText id="email"
                                       onInput={(e) => setNewClient({...newClient, email: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="phone">Phone *</label>
                            <InputText id="phone"
                                       onInput={(e) => setNewClient({...newClient, phone: e.target.value})}/>
                        </div>

                        <div className="p-field">
                            <label htmlFor="course">Initial Course *</label>
                            <Dropdown id="course"
                                      value={newClient?.initialCourse?.name}
                                      options={initialCourseOptions.map(course => course.name)}
                                      placeholder="Select a course"
                                      onChange={(e) =>
                                          setNewClient({
                                                  ...newClient,
                                                  initialCourse: initialCourseOptions.find(course => course.name === e.target.value)
                                              }
                                          )}
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="clientStatus">Status</label>
                            <Dropdown id="clientStatus"
                                      value={newClient?.clientStatus?.status}
                                      options={statusOptions.map(status => status.status)}
                                      placeholder="Select a status"
                                      onChange={(e) =>
                                          setNewClient({
                                                  ...newClient,
                                                  clientStatus: statusOptions.find(status => status.status === e.target.value)
                                              }
                                          )}
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="referralSource">Referral Source</label>
                            <Dropdown id="referralSource"
                                      value={newClient?.referralSource?.source}
                                      options={referralSourceOptions.map(source => source.source)}
                                      placeholder="Select a source"
                                      onChange={(e) =>
                                          setNewClient({
                                                  ...newClient,
                                                  referralSource: referralSourceOptions.find(source => source.source === e.target.value)
                                              }
                                          )}
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="description">Description</label>
                            <InputText id="description"
                                       onInput={(e) => setNewClient({...newClient, description: e.target.value})}/>
                        </div>

                        <div className="p-field">
                            <label htmlFor="country">Country</label>
                            <Dropdown id="country"
                                      value={newClient?.country}
                                      options={COUNTRIES}
                                      placeholder="Select a country"
                                      onChange={(e) =>
                                          setNewClient({
                                                  ...newClient,
                                                  country: COUNTRIES.find(country => country === e.target.value)
                                              }
                                          )}
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="nationality">Nationality</label>
                            <Dropdown id="nationality"
                                      value={newClient?.nationality}
                                      options={NATIONALITIES}
                                      placeholder="Select a nationality"
                                      onChange={(e) =>
                                          setNewClient({
                                                  ...newClient,
                                                  nationality: NATIONALITIES.find(nationality => nationality === e.target.value)
                                              }
                                          )}
                            />
                        </div>


                        <div className="p-field">
                            <label htmlFor="address">Address</label>
                            <InputText id="address"
                                       onInput={(e) => setNewClient({...newClient, address: e.target.value})}/>
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
