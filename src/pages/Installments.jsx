import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";

import 'primeicons/primeicons.css';
import Table from "../components/Table.jsx";
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {genericSortFunction} from "../utils.js";
import {ConfirmDialog} from "primereact/confirmdialog";

function Installments() {

    const [installments, setInstallments] = useState([]);
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [clientOptions, setClientOptions] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const axios = useAxios();
    const [notification, setNotification] = useState({message: '', type: ''});
    const [displayDialog, setDisplayDialog] = useState(false);
    const [newInstallment, setNewInstallment] = useState({});
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, installment: null});


    const fetchInstallments = () => {
        axios.get(apiEndpoints.installments).then(response => {
            setInstallments(response.data.response);
        }).catch(error =>
            setNotification({message: 'Failed to fetch installments ' + error, type: 'error'})
        );
    }

    const fetchClientOptions = () => {
        axios.get(apiEndpoints.clients).then(response => {
            setClientOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch client options ' + error, type: 'error'}));
    }
    const fetchCourseOptions = () => {
        axios.get(apiEndpoints.courses).then(response => {
            setCourseOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch course options ' + error, type: 'error'}));

    }
    const fetchPaymentMethodOptions = () => {
        axios.get(apiEndpoints.paymentMethods).then(response => {
            setPaymentMethodOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch payment method options ' + error, type: 'error'}));

    }
    const fetchPaymentStatusOptions = () => {
        axios.get(apiEndpoints.paymentStatuses).then(response => {
            setPaymentStatusOptions(response.data.response);
        }).catch(error => setNotification({
            message: 'Failed to fetch payment status options ' + error, type: 'error'
        }));
    }


    useEffect(() => {
        fetchInstallments();
        fetchClientOptions();
        fetchCourseOptions();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
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
        switch (columnField) {
            case 'paymentMethod':
                setEditingState({
                    ...editingState,
                    editedValue: paymentMethodOptions.find(option => option.method === e.target.value)
                });
                break;
            case 'paymentStatus':
                setEditingState({
                    ...editingState,
                    editedValue: paymentStatusOptions.find(option => option.status === e.target.value)
                });
                break;

        }

    }

    const onSubmitEdit = (id, columnField) => {
        const endpoint = apiEndpoints.getInstallmentUpdateEndpoint(id, columnField, editingState.editedValue.id);
        if (editingState.editedValue !== '' && (columnField === 'dueDate' || columnField === 'paymentDate')) {
            editingState.editedValue = new Date(editingState.editedValue).toISOString();
        }
        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchInstallments();
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
            field: 'enrollment',
            header: 'Client',
            listFieldName: 'client',
            nestedField: 'name',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'enrollment', 'client', 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'enrollment', 'client', editingState, clientOptions, dropDownCellHandlers, 'name', false)

        },
        {
            field: 'enrollment',
            header: 'Course',
            listFieldName: 'course',
            nestedField: 'name',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'enrollment', 'course', 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'enrollment', 'course', editingState, courseOptions, dropDownCellHandlers, 'name', false)
        },
        {
            field: 'amount',
            header: 'Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'amount', editingState, handlers)
        },
        {
            field: 'dueDate',
            header: 'Payment Due Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'dueDate', editingState, handlers)
        },
        {
            field: 'paymentDate',
            header: 'Payment Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'paymentDate', editingState, handlers)
        },
        {
            field: 'paymentMethod',
            header: 'Payment Method',
            listFieldName: 'method',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'paymentMethod', 'method'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingState, paymentMethodOptions, dropDownCellHandlers)
        },
        {
            field: 'paymentStatus',
            header: 'Payment Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'paymentStatus', 'status'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentStatus', 'status', editingState, paymentStatusOptions, dropDownCellHandlers)
        }

    ]

    const openDialog = () => {
        setDisplayDialog(true);
    }

    const closeDialog = () => {
        setDisplayDialog(false);
        setNewInstallment({});
    }
    const createInstallment = () => {
        if (newInstallment.dueDate !== '') {
            newInstallment.dueDate = new Date(newInstallment.dueDate).toISOString();
        }
        axios.post(apiEndpoints.createInstallment, newInstallment).then(response => {
            setNotification({message: 'Installment created successfully', type: 'success'});
            fetchInstallments();
            closeDialog();
        }).catch(error => setNotification({message: 'Failed to create installment ' + error, type: 'error'}));
    }

    const onDeleteRow = (rowData) => {
        setConfirmDeleteDialog({visible: true, installment: rowData});
    }
    const deleteInstallment = () => {
        axios.delete(apiEndpoints.getInstallmentDeleteEndpoint(confirmDeleteDialog.installment.id))
            .then(() => {
                fetchInstallments();
                setNotification({message: 'Installment deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, installment: null});
            }).catch(error => setNotification({message: `Failed to delete installment: ${error}`, type: 'error'}));
    }
    const cancelDeleteInstallment = () => {
        setConfirmDeleteDialog({visible: false, installment: null});
    }

    return (
        <>
            <Table
                header={<h2>Installments</h2>}
                data={installments}
                columns={columns}
                onDeleteRow={onDeleteRow}
                downloadFileName={'installments'}
                setNotification={setNotification}
                paginatorLeftHandlers={{
                    fetchInstallments,
                    fetchClientOptions,
                    fetchCourseOptions,
                    fetchPaymentMethodOptions,
                    fetchPaymentStatusOptions
                }}
            ></Table>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '16px', zIndex: 1000}}
                onClick={openDialog}
                label="New Installment"
            />
            <Dialog
                header="Create New Installment"
                visible={displayDialog}
                style={{width: '50vw'}}
                modal
                onHide={closeDialog}
            >
                <Card title="Installment Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="course">Course</label>
                            <Dropdown id="course"
                                      options={courseOptions.map(option => option.name)}
                                      value={newInstallment.enrollment?.courseName}
                                      onChange={(e) => {
                                          setNewInstallment({
                                              ...newInstallment,
                                              enrollment: {
                                                  ...newInstallment.enrollment,
                                                  courseId: courseOptions.find(option => option.name === e.target.value).id,
                                                  courseName: e.target.value
                                              }
                                          })

                                      }
                                      }/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="client">Client</label>
                            <Dropdown id="client"
                                      options={clientOptions.map(option => option.name)}
                                      value={newInstallment.enrollment?.clientName}
                                      onChange={(e) => setNewInstallment({
                                          ...newInstallment,
                                          enrollment: {
                                              ...newInstallment.enrollment,
                                              clientId: clientOptions.find(option => option.name === e.target.value).id,
                                              clientName: e.target.value
                                          }

                                      })}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="amount">amount</label>
                            <InputText id="amount"
                                       onInput={(e) => setNewInstallment({...newInstallment, amount: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="dueDate">Due Date</label>
                            <InputText id="dueDate"
                                       onInput={(e) => setNewInstallment({
                                           ...newInstallment,
                                           dueDate: e.target.value
                                       })}/>
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createInstallment} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>
            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteInstallment}
                accept={deleteInstallment}
                header={`Delete ${confirmDeleteDialog.installment ? confirmDeleteDialog.installment.name : ''}`}
                message={`Are you sure you want to delete ${confirmDeleteDialog.installment ? confirmDeleteDialog.installment.name : ''}?`}
            >
            </ConfirmDialog>
            <Notification message={notification.message} type={notification.type}/>
        </>
    );
}

export default Installments;
