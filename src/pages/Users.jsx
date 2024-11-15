import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
import 'primeicons/primeicons.css';
import Table from "../components/Table.jsx";
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";
import CellTemplate from "../templates/CellTemplate.jsx";
import {getCriteria, getCustomSorting} from "../utils.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import {ConfirmDialog} from "primereact/confirmdialog";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import {FilterMatchMode} from "primereact/api";
import staticListRowFilterTemplate from "../templates/StaticListRowFilterTemplate.jsx";

function Users() {
    const [notification, setNotification] = useState({message: '', type: ''});
    const [users, setUsers] = useState([]);
    const axios = useAxios();
    const [roleOptions, setRoleOptions] = useState([]);
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, user: null});
    const [displayDialog, setDisplayDialog] = useState(false);
    const [newUser, setNewUser] = useState({});

    const [filters, setFilters] = useState({
        firstMame: {value: null, matchMode: 'contains'},
        lastMame: {value: null, matchMode: 'contains'},
        email: {value: null, matchMode: 'contains'},
        phoneNumber: {value: null, matchMode: 'contains'},
        roles: {value: [], matchMode: FilterMatchMode.IN},
        createdBy: {value: null, matchMode: 'contains'},
        modifiedBy: {value: null, matchMode: 'contains'},
        createdDate: {value: null, matchMode: 'contains'},
        modifiedDate: {value: null, matchMode: 'contains'},
    });

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalNumberOfElements: 0,
    });

    const [sorting, setSorting] = useState({
        sortBy: "firstName",
        sortDesc: false,
        defaultSortField: "firstName",
    });
    const [loading, setLoading] = useState(true);

    const fetchPaginatedUsers = (paginationDetails = null) => {
        setLoading(true);
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedUsers, {
            ...customPagination,
            ...customSorting,
            criteria,
        }).then(response => {
            const {pageNumber, pageSize, totalNumberOfElements, result} = response.data.response;
            setPagination(prev => ({
                ...prev,
                pageNumber,
                pageSize,
                totalNumberOfElements,
            }));
            setUsers(result);
            setLoading(false);
        }).catch(error => {
            setNotification({message: `Failed to fetch users: ${error}`, type: 'error'});
            setLoading(false);
        });
    }

    const fetchRoles = () => {
        axios.get(apiEndpoints.roles)
            .then(response => {
                setRoleOptions(response.data.response);
                console.log(roleOptions);
            }).catch(error =>
            setNotification({message: 'Failed to fetch roles ' + error, type: 'error'})
        );
    }

    useEffect(() => {
        fetchPaginatedUsers();
        fetchRoles();

    }, []);


    const onEdit = (id, columnField, editedValue) => {
        setEditingState({id, columnField, editedValue});
    }

    const onCancelEdit = () => {
        setEditingState({id: '', columnField: '', editedValue: null});
    }

    const onCellChange = (e) => {
        setEditingState({...editingState, editedValue: e.target.value});
    }

    const onDropDownChange = (e, columnField) => {
        setEditingState({...editingState, editedValue: e.target.value});
    }

    const onSubmitEdit = (id, columnField) => {
        const endpoint = apiEndpoints.getUserUpdate(id, columnField);
        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchPaginatedUsers();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});

        }).catch(error =>
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'})
        );
    }

    const handlers = {
        onEdit, onSubmitEdit, onCancelEdit, onCellChange
    };
    const dropDownCellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onOptionChange: onDropDownChange
    }


    const columns = [
        {
            field: 'firstName',
            header: 'First Name',
            sortable: true,
            filter: true,
            body: (rowData) => CellTemplate(rowData, 'firstName', editingState, handlers)

        },
        {
            field: 'lastName',
            header: 'Last Name',
            sortable: true,
            filter: true,
            body: (rowData) => CellTemplate(rowData, 'lastName', editingState, handlers)
        },
        {
            field: 'email',
            header: 'Email',
            cellWidth: 60,
            sortable: true,
            filter: true,
            body: (rowData) => CellTemplate(rowData, 'email', editingState, handlers)
        },
        {
            field: 'phoneNumber',
            header: 'Phone Number',
            sortable: true,
            filter: true,
            body: (rowData) => CellTemplate(rowData, 'phoneNumber', editingState, handlers)
        },
        {
            field: 'role',
            header: 'Role',
            sortable: true,
            filter: true,
            filterElement: staticListRowFilterTemplate({
                value: filters.roles.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    roles: {value, matchMode: FilterMatchMode.IN},
                }),
            }, roleOptions),
            body: (rowData) => DropDownCellTemplate(rowData, 'role', null, editingState, roleOptions, dropDownCellHandlers,)
        }

    ]

    const onDeleteRow = (rowData) => {
        setConfirmDeleteDialog({visible: true, user: rowData});
    }
    const deleteUser = () => {
        axios.delete(apiEndpoints.getDeleteUser(confirmDeleteDialog.user.id))
            .then(() => {
                fetchPaginatedUsers();
                setNotification({message: 'User deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, user: null});
            }).catch(error => setNotification({message: `Failed to delete refund: ${error}`, type: 'error'}));
    }
    const cancelDeleteUser = () => {
        setConfirmDeleteDialog({visible: false, user: null});
    }

    const openDialog = () => {
        setDisplayDialog(true);
    }

    const closeDialog = () => {
        setDisplayDialog(false);
    }

    const createUser = () => {
        axios.post(apiEndpoints.createUser, newUser).then(response => {
            setNotification({message: 'User created successfully', type: 'success'});
            fetchPaginatedUsers();
            closeDialog();
        }).catch(error => setNotification({message: 'Failed to create user ' + error, type: 'error'}));
    }

    const onPage = (e) => {
        fetchPaginatedUsers({pageNumber: e.page + 1, pageSize: e.rows});

    }

    return (
        <>
            <Table
                header={<h2>Users</h2>}
                data={users}
                columns={columns}
                paginatorLeftHandlers={[fetchPaginatedUsers]}
                setNotification={setNotification}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                onPage={onPage}
                loading={loading}
                fetchPaginatedItems={fetchPaginatedUsers}
                downloadFileName={'users'}
                onDeleteRow={onDeleteRow}
            ></Table>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '16px', zIndex: 1000}}
                onClick={openDialog}
                label="New User"
            />
            <Dialog
                header="Create New User"
                visible={displayDialog}
                style={{width: '50vw'}}
                modal
                onHide={closeDialog}
            >
                <Card title="User Details">
                    <div className="p-fluid">

                        <div className="p-field">
                            <label htmlFor="firstName">First Name</label>
                            <InputText id="firstName"
                                       onInput={(e) => setNewUser({...newUser, firstName: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="lastName">Last Name</label>
                            <InputText id="lastName"
                                       onInput={(e) => setNewUser({...newUser, lastName: e.target.value})}/>
                        </div>

                        <div className="p-field">
                            <label htmlFor="email">Email</label>
                            <InputText id="email"
                                       onInput={(e) => setNewUser({...newUser, email: e.target.value})}/>
                        </div>

                        <div className="p-field">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <InputText id="phoneNumber"
                                       onInput={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="password">Password</label>
                            <InputText id="password" type={'password'}
                                       onInput={(e) => setNewUser({...newUser, password: e.target.value})}/>
                        </div>

                        <div className="p-field">
                            <label htmlFor="role">Role</label>
                            <Dropdown id="role"
                                      options={roleOptions}
                                      value={newUser?.role ? newUser.role : ''}
                                      onChange={(e) => {
                                          setNewUser({
                                              ...newUser,
                                              role: e.target.value
                                          })

                                      }
                                      }/>
                        </div>


                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createUser} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>


            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteUser}
                accept={deleteUser}
                header={`Delete ${confirmDeleteDialog.user ? confirmDeleteDialog.user.firstName + ' ' + confirmDeleteDialog.user.lastName : ''}`}
                message={`Are you sure you want to delete this  ${confirmDeleteDialog.user ? confirmDeleteDialog.user.firstName + ' ' + confirmDeleteDialog.user.lastName : ''}?`}
            >
            </ConfirmDialog>

            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Users;
