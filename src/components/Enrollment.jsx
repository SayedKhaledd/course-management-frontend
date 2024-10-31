import {genericSortFunction, simplifyDate} from "../utils.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {CURRENCIES, RATINGS, TRUE_FALSE_OPTIONS} from "../constants.js";
import apiEndpoints from "../apiEndpoints.js";
import useAxios from "../hooks/useAxios.js";
import React, {useEffect, useState} from "react";
import {ConfirmDialog} from "primereact/confirmdialog";
import Notification from "./Notification.jsx";
import Table from "./Table.jsx";
import {useLocation} from "react-router-dom";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {Dropdown} from "primereact/dropdown";


const Enrollment = ({clientId, courseId}) => {
    const location = useLocation();
    const [client, setClient] = useState(location.state?.client || null);
    const [course, setCourse] = useState(location.state?.course || null);
    const axios = useAxios();

    const [notification, setNotification] = useState({message: '', type: ''});
    const [enrollments, setEnrollments] = useState([]);
    const [editingEnrollmentState, setEditingEnrollmentState] = useState({
        id: '',
        columnField: '',
        editedValue: null
    });
    const [coursesOptions, setCoursesOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const [actionOptions, setActionOptions] = useState([]);
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, enrollment: null});
    const [dialogState, setDialogState] = useState({visible: false, newEnrollment: {}});


    const fetchClient = () => {
        axios.get(apiEndpoints.client(clientId))
            .then(response => setClient(response.data.response))
            .catch(error => console.error(error));
    }

    const fetchCourse = () => {
        axios.get(apiEndpoints.course(courseId))
            .then(response => setCourse(response.data.response))
            .catch(error => console.error(error));
    }

    const fetchEnrollments = () => {
        if (!courseId) {
            console.log("client.id", clientId);
            axios.get(apiEndpoints.enrollmentsByClientId(clientId))
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
        } else {
            console.log("course.id", courseId);
            axios.get(apiEndpoints.enrollmentsByCourseId(courseId))
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

        }


    };
    const fetchCourseOptions = () => {
        axios.get(apiEndpoints.courses)
            .then(response => {
                setCoursesOptions(response.data.response.map(course => ({name: course.name, id: course.id})));
            }).catch(error => {
            setNotification({message: 'Failed to fetch course options' + error, type: 'error'});
        });
    };

    const fetchClientOptions = () => {
        axios.get(apiEndpoints.clients)
            .then(response => {
                setClientOptions(response.data.response.map(client => ({name: client.name, id: client.id})));
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
        if (!courseId) {
            console.log("fetching client");
            if (!client) {
                fetchClient();
            }
            fetchCourseOptions();

        } else if (!clientId) {
            console.log("fetching course");
            if (!course) {
                fetchCourse();
            }
            fetchClientOptions();

        }
        fetchEnrollments();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
        fetchActionOptions();
        fetchReferralSourceOptions();
    }, []);


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
        switch (columnField) {
            case 'course':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: coursesOptions.find(option => option.status === e.target.value)
                });
                break;
            case 'client':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: clientOptions.find(option => option.status === e.target.value)
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
                break;

            case 'currency':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: e.target.value
                });
                break;

            case 'rating':
                setEditingEnrollmentState({
                    ...editingEnrollmentState,
                    editedValue: e.target.value
                });
                break;

        }

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
        //add here optional column depending on the value of courseId
        ...(clientId ? [{
            field: 'course',
            header: 'Course',
            filter: true,
            listFieldName: 'name',
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'course', 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'course', 'name', editingEnrollmentState, coursesOptions, dropDownCellHandlers)
        }] : []),

        ...(courseId ? [{
            field: 'client',
            header: 'Client',
            filter: true,
            listFieldName: 'name',
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'client', 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'client', 'name', editingEnrollmentState, clientOptions, dropDownCellHandlers)
        }] : []),

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
            body: (rowData) => CellTemplate(rowData, 'remainingAmount', editingEnrollmentState, cellHandlers, false)
        },
        {
            field: 'totalAmount',
            header: 'Total Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'totalAmount', editingEnrollmentState, cellHandlers, false)
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
            body: (rowData) => DropDownCellTemplate(rowData, 'currency', null, editingEnrollmentState, CURRENCIES, dropDownCellHandlers)
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
            body: (rowData) => DropDownCellTemplate(rowData, 'rating', null, editingEnrollmentState, RATINGS, dropDownCellHandlers)
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

    const onClientChange = (e) => {
        setDialogState({
            ...dialogState,
            newEnrollment: {
                ...dialogState.newEnrollment, clientName: e.target.value,
                clientId: clientOptions.find(option => option.name === e.target.value).id
            }
        });
    }


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
            // fetchEnrollments();
            closeDialog();
        }).catch(error => {
            setNotification({message: 'Failed to create enrollment' + error, type: 'error'});
        });
    };


    return (
        <>
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
                style={{position: 'static', marginTop: '20px', bottom: '16px', marginLeft: '800px', zIndex: 1000}}
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
                        <div className="p-fluid">
                            {clientId ? (
                                <div className="p-field">
                                    <label htmlFor="course">Name</label>
                                    <Dropdown id="course"
                                              value={dialogState.newEnrollment?.courseName}
                                              options={coursesOptions.map(course => course.name)}
                                              placeholder="Select a course"
                                              onChange={onCourseChange}
                                    />
                                </div>
                            ) : (
                                <div className="p-field">
                                    <label htmlFor="client">Client Name</label>
                                    <Dropdown id="client"
                                              value={dialogState.newEnrollment?.clientName}
                                              options={clientOptions.map(client => client.name)}
                                              placeholder="Select a client"
                                              onChange={onClientChange}
                                    />
                                </div>
                            )}
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
}
export default Enrollment;