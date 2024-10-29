import React, {useEffect, useState} from 'react';
import {Card} from 'primereact/card';
import {Avatar} from 'primereact/avatar';
import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import useAxios from "../hooks/useAxios.js";
import {useLocation, useParams} from 'react-router-dom';
import '../styles/Client_Details.css';
import {genericSortFunction, simplifyDate} from "../utils.js";
import Notification from "../components/Notification.jsx";
import Table from "../components/Table.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import HistoryDialog from "../components/HistoryDialog.jsx";
import {ConfirmDialog} from "primereact/confirmdialog";
import {TRUE_FALSE_OPTIONS} from "../constants.js";


const ClientDetails = () => {
    const location = useLocation();
    const {id} = useParams();
    const [client, setClient] = useState(location.state?.client || null);
    const axios = useAxios();

    const [historyVisible, setHistoryVisible] = useState(false);
    const [selectedField, setSelectedField] = useState('');
    const [history, setHistory] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});
    const [enrollments, setEnrollments] = useState([]);
    const [editingEnrollmentState, setEditingEnrollmentState] = useState({
        id: '',
        columnField: '',
        editedValue: null
    });
    const [coursesOptions, setCoursesOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const [actionOptions, setActionOptions] = useState([]);
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);
    const [dialogState, setDialogState] = useState({visible: false, newEnrollment: {}});
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, enrollment: null});


    const fetchClient = () => {
        axios.get(apiEndpoints.client(id))
            .then(response => setClient(response.data.response))
            .catch(error => console.error(error));
    }

    const fetchEnrollments = () => {
        axios.get(apiEndpoints.enrollmentsByClientId(id))
            .then(response => {
                setEnrollments(response.data.response.map(enrollment => ({
                    ...enrollment,
                    insideEgypt: enrollment.insideEgypt ? "Yes" : "No",
                    payInInstallments: enrollment.payInInstallments ? "Yes" : "No"
                })));
            })
            .catch(error => {
                setNotification({message: 'Failed to fetch enrollments' + error, type: 'error'});
            });
    };
    const fetchCourseOptions = () => {
        axios.get(apiEndpoints.courses)
            .then(response => {
                setCoursesOptions(response.data.response.map(course => ({name: course.name, id: course.id})));
            }).catch(error => {
            setNotification({message: 'Failed to fetch course options' + error, type: 'error'});
        });
    };
    const fetchPaymentMethodOptions = () => {
        axios.get(apiEndpoints.paymentMethods)
            .then(response => {
                setPaymentMethodOptions(response.data.response.map(method => ({method: method.method, id: method.id})));
            }).catch(error => {
            setNotification({message: 'Failed to fetch payment method options' + error, type: 'error'});
        });
    };
    const fetchPaymentStatusOptions = () => {
        axios.get(apiEndpoints.paymentStatuses)
            .then(response => {
                setPaymentStatusOptions(response.data.response.map(status => ({status: status.status, id: status.id})));
            }).catch(error => {
            setNotification({message: 'Failed to fetch payment status options' + error, type: 'error'});
        });
    };
    const fetchActionOptions = () => {
        axios.get(apiEndpoints.actionTaken)
            .then(response => {
                setActionOptions(response.data.response.map(action => ({action: action.action, id: action.id})));
            }).catch(error => {
            setNotification({message: 'Failed to fetch action options' + error, type: 'error'});
        });
    }
    const fetchReferralSourceOptions = () => {
        axios.get(apiEndpoints.referralSources)
            .then(response => {
                setReferralSourceOptions(response.data.response.map(source => ({
                    source: source.source,
                    id: source.id
                })));
            }).catch(error => {
            setNotification({message: 'Failed to fetch referral source options' + error, type: 'error'});
        });
    }

    useEffect(() => {
        if (!client) {
            fetchClient();
        }
        fetchEnrollments();
        fetchCourseOptions();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
        fetchActionOptions();
        fetchReferralSourceOptions();
    }, []);

    const handleInputChange = (e, field) => {
        setClient({...client, [field]: e.target.value});
    };

    const handleSave = async (columnField) => {
        const endpoint = apiEndpoints.getClientUpdateEndpoint(id, columnField, client[columnField]?.id);
        const payload = {[columnField]: client[columnField]};
        await axios.patch(endpoint, payload).then(() => {
            fetchClient();
            setClient({...client, [columnField]: client[columnField]});
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});

        });
    };
    const onCourseChange = (e) => {
        setDialogState({
            ...dialogState,
            newEnrollment: {
                ...dialogState.newEnrollment,
                courseId: coursesOptions.find(course => course.name === e.target.value).id,
                courseName: e.target.value
            }
        });
    }

    //enrollment handlers
    const onEdit = (id, columnField, editedValue) => {
        setEditingEnrollmentState({id, columnField, editedValue});
    };
    const onCancelEdit = () => {
        setEditingEnrollmentState({id: '', columnField: '', editedValue: null});
    };
    const onCellChange = (e) => {
        setEditingEnrollmentState({...editingEnrollmentState, editedValue: e.target.value});
    };

    const onSubmitEdit = async (enrollmentId, columnField) => {
        let endpoint;
        if (columnField === 'payInInstallments' || columnField === 'insideEgypt') {
            editingEnrollmentState.editedValue = editingEnrollmentState.editedValue === "Yes";
            endpoint = apiEndpoints.updateEnrollmentFieldBoolean(enrollmentId, columnField, editingEnrollmentState.editedValue);
        } else {
            endpoint = apiEndpoints.getEnrollmentUpdateEndpoint(enrollmentId, columnField, editingEnrollmentState.editedValue?.id);
        }
        const payload = {[columnField]: editingEnrollmentState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchEnrollments();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});

        }).catch(error =>
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'})
        );

    };
    const onDropDownChange = (e, columnField) => {
        console.log(e.target.value);
        switch (columnField) {
            case 'course':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: coursesOptions.find(option => option.status === e.target.value)
                });
                break;
            case 'referralSource':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: referralSourceOptions.find(option => option.source === e.target.value)
                });
                break;

            case 'paymentMethod':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: paymentMethodOptions.find(option => option.method === e.target.value)
                });
                break;
            case 'paymentStatus':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: paymentStatusOptions.find(option => option.status === e.target.value)
                });
                break;

            case 'actionTaken':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: actionOptions.find(option => option.action === e.target.value)
                });
                break;
            case 'insideEgypt':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: e.target.value
                });
                break;
            case 'payInInstallments':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: e.target.value
                });


        }
        console.log("current state", editingEnrollmentState.editedValue)

    };

    const onDeleteRow = (rowData) => {
        setConfirmDeleteDialog({visible: true, enrollment: rowData});
    }
    const deleteEnrollment = () => {
        axios.delete(apiEndpoints.getEnrollmentDeleteEndpoint(confirmDeleteDialog.enrollment.id))
            .then(() => {
                fetchEnrollments();
                setNotification({message: 'Client deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, enrollment: null});
            }).catch(error => setNotification({message: `Failed to delete client: ${error}`, type: 'error'}));
    }
    const cancelDeleteEnrollment = () => {
        setConfirmDeleteDialog({visible: false, enrollment: null});
    }

    const cellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onCellChange
    };
    const dropDownCellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onOptionChange: onDropDownChange
    }

    const columns = [
        {
            field: 'course',
            header: 'Course',
            filter: true,
            listFieldName: 'name',
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'course', 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'course', 'name', editingEnrollmentState, coursesOptions, dropDownCellHandlers)
        },
        {
            field: 'amountPaid',
            header: 'Amount Paid',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'amountPaid', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'remainingAmount',
            header: 'Remaining Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'remainingAmount', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'payInInstallments',
            header: 'Pay in Installments',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'payInInstallments', null, editingEnrollmentState, TRUE_FALSE_OPTIONS, dropDownCellHandlers)
        },
        {
            field: 'discount',
            header: 'Discount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'discount', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'currency',
            header: 'Currency',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'currency', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'paymentMethod',
            header: 'Payment Method',
            listFieldName: 'method',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'paymentMethod', 'method'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingEnrollmentState, paymentMethodOptions, dropDownCellHandlers)
        },
        {
            field: 'paymentStatus',
            header: 'Payment Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'paymentStatus', 'status'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentStatus', 'status', editingEnrollmentState, paymentStatusOptions, dropDownCellHandlers)
        },
        {
            field: 'actionTaken',
            header: 'Action Taken',
            listFieldName: 'action',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'actionTaken', 'action'),
            body: (rowData) => DropDownCellTemplate(rowData, 'actionTaken', 'action', editingEnrollmentState, actionOptions, dropDownCellHandlers)
        },
        {
            field: 'referralSource',
            header: 'Referral Source',
            listFieldName: 'source',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'referralSource', 'source'),
            body: (rowData) => DropDownCellTemplate(rowData, 'referralSource', 'source', editingEnrollmentState, referralSourceOptions, dropDownCellHandlers)
        },
        {
            field: 'review',
            header: 'Review',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'review', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'rating',
            header: 'Rating',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'rating', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'description',
            header: 'Description',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'description', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'insideEgypt',
            header: 'Is inside Egypt?',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'insideEgypt', null, editingEnrollmentState, TRUE_FALSE_OPTIONS, dropDownCellHandlers)
        },

        {
            field: 'createdDate',
            header: 'Created Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                createdDate: simplifyDate(rowData.createdDate)
            }, 'createdDate', editingEnrollmentState, cellHandlers, false)
        },
        {
            field: 'createdBy',
            header: 'Created By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'createdBy', editingEnrollmentState, cellHandlers, false)
        },
        {
            field: 'modifiedDate',
            header: 'Modified Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                modifiedDate: simplifyDate(rowData.modifiedDate)
            }, 'modifiedDate', editingEnrollmentState, cellHandlers, false)
        },
        {
            field: 'modifiedBy',
            header: 'Modified By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'modifiedBy', editingEnrollmentState, cellHandlers, false)
        }
    ];


    const openDialog = () => {
        setDialogState({visible: true, newEnrollment: {}});
    };

    const closeDialog = () => {
        setDialogState({visible: false, newEnrollment: {}});
    };

    const createEnrollment = () => {
        axios.post(apiEndpoints.createEnrollment, {
            clientId: Number(id),
            courseId: dialogState.newEnrollment.courseId,
        }).then(response => {
            setNotification({message: 'Enrollment created successfully', type: 'success'});
            fetchEnrollments();
            closeDialog();
        }).catch(error => {
            setNotification({message: 'Failed to create enrollment' + error, type: 'error'});
        });
    };

    const showHistory = (field) => {
        setSelectedField(field);
        setHistoryVisible(true);
        axios.get(apiEndpoints.clientHistoryByClientIdAndField(id, field))
            .then(response => setHistory(response.data.response))
            .catch(error => setNotification({message: 'Failed to fetch history' + error, type: 'error'}));
    };

    if (!client) {
        return <div>Loading client data...</div>;
    }
    return (
        <>
            <Card className="p-m-4" title="Client Details">
                <div className="p-d-flex p-ai-center p-mb-3">
                    <Avatar label="JD" className="p-mr-3" size="large" shape="circle"/>
                    <h2>{client.name}</h2>
                </div>
                <div className="p-fluid">
                    {/* Name Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="name" className="p-mr-2">Name</label>
                        <InputText
                            id="name"
                            value={client.name || ''}
                            onChange={(e) => handleInputChange(e, 'name')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('name')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('name')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* Email Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="email" className="p-mr-2">Email</label>
                        <InputText
                            id="email"
                            value={client.email || ''}
                            onChange={(e) => handleInputChange(e, 'email')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('email')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('email')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* Phone Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="phone" className="p-mr-2">Phone</label>
                        <InputText
                            id="phone"
                            value={client.phone || ''}
                            onChange={(e) => handleInputChange(e, 'phone')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('phone')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('phone')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* Alternative Phone Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="phone" className="p-mr-2">Alternative Phone</label>
                        <InputText
                            id="alternative-phone"
                            value={client.alternativePhone || ''}
                            onChange={(e) => handleInputChange(e, 'alternativePhone')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('alternativePhone')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('alternativePhone')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>


                    {/* Country Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="country" className="p-mr-2">Country</label>
                        <InputText
                            id="alternative-phone"
                            value={client.country || ''}
                            onChange={(e) => handleInputChange(e, 'country')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('country')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('country')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>
                </div>

                {/* History Dialog */}
                <HistoryDialog
                    visible={historyVisible}
                    setVisible={setHistoryVisible}
                    history={history}
                    field={selectedField}/>
            </Card>
            <Table
                header={'Enrollments'}
                data={enrollments} columns={columns} paginatorLeftHandlers={fetchEnrollments}
                downloadFileName={'enrollments'}
                setNotification={setNotification}
                onDeleteRow={onDeleteRow}

            ></Table>


            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '16px', zIndex: 1000}}
                onClick={openDialog}
                label="New Enrollment"
            />
            <Dialog
                header="Create New Enrollment"
                visible={dialogState.visible}
                style={{width: '50vw'}}
                modal
                onHide={closeDialog}
            >
                <Card title="Enrollment Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="course">Name</label>
                            <Dropdown id="course"
                                      value={dialogState.newEnrollment?.courseName}
                                      options={coursesOptions.map(course => course.name)}
                                      placeholder="Select a course"
                                      onChange={onCourseChange}
                            />
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createEnrollment} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>
            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteEnrollment}
                accept={deleteEnrollment}
                header={`Delete ${confirmDeleteDialog.enrollment ? confirmDeleteDialog.enrollment.course.name : ''}`}
                message={`Are you sure you want to delete ${confirmDeleteDialog.enrollment ? confirmDeleteDialog.enrollment.course.name : ''}?`}
            >
            </ConfirmDialog>

            <Notification status={notification.type} message={notification.message}/>

        </>

    );
};

export default ClientDetails;
