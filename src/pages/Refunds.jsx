import React, {useEffect, useState} from 'react';
import useAxios from "../useAxios.js";

import 'primeicons/primeicons.css';
import Notification from "../components/Notification.jsx";
import Table from "../components/Table.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext"; // For using icons

function Refunds() {
    const [refunds, setRefunds] = useState([]);
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [clientOptions, setClientOptions] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [refundReasonOptions, setRefundReasonOptions] = useState([]);
    const axios = useAxios();
    const [notification, setNotification] = useState({message: '', type: ''});
    const [displayDialog, setDisplayDialog] = useState(false);
    const [newRefund, setNewRefund] = useState({});


    const fetchRefunds = () => {
        axios.get(apiEndpoints.refunds).then(response => {
            setRefunds(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch refunds ' + error, type: 'error'}));
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
    const fetchRefundReasonOptions = () => {
        axios.get(apiEndpoints.refundReasons).then(response => {
            setRefundReasonOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch refund reason options ' + error, type: 'error'}));
    }


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

            case 'refundReason':
                setEditingState({
                    ...editingState,
                    editedValue: refundReasonOptions.find(option => option.reason === e.target.value)
                });
                break;
        }

    }

    const onSubmitEdit = (id, columnField) => {
        const endpoint = columnField === 'isConfirmed' ? apiEndpoints.updateRefundIsConfirmed(id, editingState.editedValue) : apiEndpoints.getRefundUpdateEndpoint(id, columnField, editingState.editedValue.id);
        if (editingState.editedValue !== '' && (columnField === 'refundDate')) {
            editingState.editedValue = new Date(editingState.editedValue).toISOString();
        }


        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchRefunds();
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
            body: (rowData) => DropDownCellTemplate(rowData, 'enrollment', 'client', editingState, clientOptions, dropDownCellHandlers, 'name')
        },

        {
            field: 'enrollment',
            header: 'Course Name',
            listFieldName: 'course',
            nestedField: 'name',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'enrollment', 'course', editingState, courseOptions, dropDownCellHandlers, 'name')
        },
        {
            field: 'amount',
            header: 'Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'amount', editingState, handlers)
        },
        {
            field: 'refundDate',
            header: 'Refund Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'refundDate', editingState, handlers)
        },
        {
            field: 'refundReason',
            header: 'Reason',
            listFieldName: 'reason',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'refundReason', 'refundReason', editingState, refundReasonOptions, dropDownCellHandlers,)
        },
        {
            field: 'explanation',
            header: 'Explanation',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'explanation', 'explanation', editingState, [], handlers)
        },
        //is confirmed
        {
            field: 'isConfirmed',
            header: 'Is Confirmed',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'isConfirmed', editingState, handlers)
        },
        //PAYMENT METHOD
        {
            field: 'paymentMethod',
            header: 'Payment Method',
            listFieldName: 'method',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingState, paymentMethodOptions, dropDownCellHandlers)
        },

    ]

    const openDialog = () => {
        setDisplayDialog(true);
    }

    const closeDialog = () => {
        setDisplayDialog(false);
    }

    const createRefund = () => {
        axios.post(apiEndpoints.createRefund, newRefund).then(response => {
            setNotification({message: 'Installment created successfully', type: 'success'});
            fetchRefunds();
            closeDialog();
        }).catch(error => setNotification({message: 'Failed to create installment ' + error, type: 'error'}));
    }

    useEffect(() => {
        fetchRefunds();
        fetchClientOptions();
        fetchCourseOptions();
        fetchPaymentMethodOptions();
        fetchRefundReasonOptions();

    }, []);


    return (
        <>
            <Table
                columns={columns}
                data={refunds}
                downloadFileName={'refunds'}
                paginatorLeftHandlers={[fetchRefunds, fetchClientOptions, fetchCourseOptions, fetchPaymentMethodOptions, fetchRefundReasonOptions]}


            ></Table>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '16px', zIndex: 1000}}
                onClick={openDialog}
                label="New Refund"
            />
            <Dialog
                header="Create New Refund"
                visible={displayDialog}
                style={{width: '50vw'}}
                modal
                onHide={closeDialog}
            >
                <Card title="Refund Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="course">Course</label>
                            <Dropdown id="course"
                                      options={courseOptions.map(option => option.name)}
                                      value={newRefund.enrollment?.courseName}
                                      onChange={(e) => {
                                          setNewRefund({
                                              ...newRefund,
                                              enrollment: {
                                                  ...newRefund.enrollment,
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
                                      value={newRefund.enrollment?.clientName}
                                      onChange={(e) => setNewRefund({
                                          ...newRefund,
                                          enrollment: {
                                              ...newRefund.enrollment,
                                              clientId: clientOptions.find(option => option.name === e.target.value).id,
                                              clientName: e.target.value
                                          }

                                      })}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="amount">amount</label>
                            <InputText id="amount"
                                       onInput={(e) => setNewRefund({...newRefund, amount: e.target.value})}/>
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createRefund} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>

            <Notification message={notification.message} type={notification.type}/>
        </>
    );
}

export default Refunds;
