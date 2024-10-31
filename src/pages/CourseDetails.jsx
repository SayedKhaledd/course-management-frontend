import {Card} from "primereact/card";
import {Avatar} from "primereact/avatar";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import HistoryDialog from "../components/HistoryDialog.jsx";
import React, {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import useAxios from "../hooks/useAxios.js";
import apiEndpoints from "../apiEndpoints.js";
import Notification from "../components/Notification.jsx";
import Table from "../components/Table.jsx";
import {Dialog} from "primereact/dialog";
import {Dropdown} from "primereact/dropdown";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {genericSortFunction, simplifyDate} from "../utils.js";
import {ConfirmDialog} from "primereact/confirmdialog";
import {TRUE_FALSE_OPTIONS} from "../constants.js";

const CourseDetails = () => {
    const location = useLocation();
    const {id} = useParams();
    const [course, setCourse] = useState(location.state?.client || null);
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
    const [clientOptions, setClientOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const [actionOptions, setActionOptions] = useState([]);
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);
    const [enrollmentDialogState, setEnrollmentDialogState] = useState({visible: false, newEnrollment: {}});
    const [courseLecturers, setCourseLecturers] = useState([]);
    const [editingCourseLecturerState, setEditingCourseLecturerState] = useState({
        id: '',
        columnField: '',
        editedValue: null
    });
    const [lecturerDialogState, setLecturerDialogState] = useState({visible: false, newLecturer: {}});
    const [confirmEnrollmentDeleteDialog, setConfirmEnrollmentDeleteDialog] = useState({
        visible: false,
        enrollment: null
    });
    const [confirmCourseLecturerDeleteDialog, setConfirmCourseLecturerDeleteDialog] = useState({
        visible: false,
        courseLecturer: null
    });


    const fetchCourse = () => {
        axios.get(apiEndpoints.course(id))
            .then(response => setCourse(response.data.response))
            .catch(error => setNotification({message: 'Failed to fetch course ' + error, type: 'error'}));
    }


    const fetchEnrollments = () => {
        axios.get(apiEndpoints.enrollmentsByCourseId(id))
            .then(response => {
                setEnrollments(response.data.response.map(enrollment => ({
                    ...enrollment,
                    insideEgypt: enrollment.insideEgypt ? "Yes" : "No",
                    payInInstallments: enrollment.payInInstallments ? "Yes" : "No"
                })));
            })
            .catch(error => setNotification({message: 'Failed to fetch enrollments ' + error, type: 'error'}));
    }
    const fetchClientOptions = () => {
        axios.get(apiEndpoints.clients)
            .then(response => {
                setClientOptions(response.data.response.map(client => ({name: client.name, id: client.id})));
            }).catch(error => {
            setNotification({message: 'Failed to fetch course options' + error, type: 'error'});
        });
    };

    const fetchCourseLecturers = () => {
        axios.get(apiEndpoints.courseLecturersByCourseId(id))
            .then(response => {
                setCourseLecturers(response.data.response.map(courseLecturer => ({
                    ...courseLecturer,
                    paidInPercentage: courseLecturer.paidInPercentage ? "Yes" : "No"
                })));
            }).catch(error => {
            setNotification({message: 'Failed to fetch course lecturers' + error, type: 'error'});
        });
    }

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
        if (!course) {
            fetchCourse();
        }
        fetchEnrollments();
        fetchClientOptions();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
        fetchActionOptions();
        fetchReferralSourceOptions();
        fetchCourseLecturers();
    }, []);


    //course handlers
    const handleInputChange = (e, field) => {
        setCourse({...course, [field]: e.target.value});
    };
    const handleSave = async (columnField) => {
        const endpoint = apiEndpoints.getCourseUpdateEndpoint(id, columnField, course[columnField]?.id);
        const payload = {[columnField]: course[columnField]};
        await axios.patch(endpoint, payload).then(() => {
            fetchCourse();
            setCourse({...course, [columnField]: course[columnField]});
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});

        });
    };
    const showHistory = (field) => {
        setSelectedField(field);
        axios.get(apiEndpoints.courseHistoryByCourseIdAndField(course.id, field))
            .then(response => {
                setHistory(response.data.response);
                setHistoryVisible(true);
            })
            .catch(error => setNotification({message: 'Failed to fetch history ' + error, type: 'error'}));
    };

    //course lecturers dialog handlers
    const openLecturerDialog = () => {
        setLecturerDialogState({...lecturerDialogState, visible: true});
    }

    const closeLecturerDialog = () => {
        setLecturerDialogState({...lecturerDialogState, visible: false});
    }

    //enrollment dialog handlers
    const openEnrollmentDialog = () => {
        setEnrollmentDialogState({...enrollmentDialogState, visible: true});
    }
    const closeEnrollmentDialog = () => {
        setEnrollmentDialogState({...enrollmentDialogState, visible: false});
    }

    //enrollment cell change handlers
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
            case 'paidInPercentage':
                setEditingCourseLecturerState({
                    ...editingCourseLecturerState,
                    editedValue: e.target.value
                });
                break;

        }

    };


    const cellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onCellChange
    };
    const dropDownCellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onOptionChange: onDropDownChange
    };

    //enrollment columns
    const columns = [
        {
            field: 'client',
            header: 'Client',
            filter: true,
            listFieldName: 'name',
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'client', 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'client', 'name', editingEnrollmentState, clientOptions, dropDownCellHandlers)
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
            body: (rowData) => DropDownCellTemplate(rowData, 'payInInstallments', null, editingEnrollmentState, TRUE_FALSE_OPTIONS, cellHandlers)
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

    //course lecturers cell change handlers
    const onEditCourseLecturer = (id, columnField, editedValue) => {
        setEditingCourseLecturerState({id, columnField, editedValue});
    }

    const onCancelEditCourseLecturer = () => {
        setEditingCourseLecturerState({id: '', columnField: '', editedValue: null});
    }

    const onCellChangeCourseLecturer = (e) => {
        setEditingCourseLecturerState({...editingCourseLecturerState, editedValue: e.target.value});
    }

    const onSubmitEditCourseLecturer = async (courseLecturerId, columnField) => {
        const endpoint = columnField === 'paidInPercentage' ? apiEndpoints.updateCourseLecturerPaidStatus(courseLecturerId, editingCourseLecturerState.editedValue === 'Yes')
            : apiEndpoints.updateCourseLecturerField(courseLecturerId, columnField);
        const payload = {[columnField]: editingCourseLecturerState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchCourseLecturers();
            onCancelEditCourseLecturer();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});
        });
    }


    const courseLecturersCellHandlers = {
        onEdit: onEditCourseLecturer,
        onSubmitEdit: onSubmitEditCourseLecturer,
        onCancelEdit: onCancelEditCourseLecturer,
        onCellChange: onCellChangeCourseLecturer
    };

    const courseLecturersCellOptionsHandlers = {
        onEdit: onEditCourseLecturer,
        onSubmitEdit: onSubmitEditCourseLecturer,
        onCancelEdit: onCancelEditCourseLecturer,
        onCellChange: onCellChangeCourseLecturer,
        onOptionChange: onDropDownChange
    }

    //course lecturers columns
    const courseLecturersColumns = [
        {
            field: 'name',
            header: 'Lecturer',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'name', editingCourseLecturerState, courseLecturersCellHandlers)
        },
        {
            field: 'paidInPercentage',
            header: 'Paid In Percentage',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'paidInPercentage', null, editingCourseLecturerState, TRUE_FALSE_OPTIONS, courseLecturersCellOptionsHandlers)
        },
        {
            field: 'percentage',
            header: 'Percentage',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'percentage', editingCourseLecturerState, courseLecturersCellHandlers)
        },
        {
            field: 'totalPercentageCost',
            header: 'Total Percentage Cost',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'totalPercentageCost', editingCourseLecturerState, courseLecturersCellHandlers, false)
        },
        {
            field: 'noOfLectures',
            header: 'No. of Lectures',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'noOfLectures', editingCourseLecturerState, courseLecturersCellHandlers)
        },
        {
            field: 'lectureCost',
            header: 'Lecture Cost',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'lectureCost', editingCourseLecturerState, courseLecturersCellHandlers)
        },
        {
            field: 'totalFixedCost',
            header: 'Total Fixed Cost',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'totalFixedCost', editingCourseLecturerState, courseLecturersCellHandlers, false)
        },
        {
            field: 'createdDate',
            header: 'Created Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                createdDate: simplifyDate(rowData.createdDate)
            }, 'createdDate', editingCourseLecturerState, courseLecturersCellHandlers, false)
        },
        {
            field: 'createdBy',
            header: 'Created By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'createdBy', editingCourseLecturerState, courseLecturersCellHandlers, false)
        },
        {
            field: 'modifiedDate',
            header: 'Modified Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                modifiedDate: simplifyDate(rowData.modifiedDate)
            }, 'modifiedDate', editingCourseLecturerState, courseLecturersCellHandlers, false)
        },
        {
            field: 'modifiedBy',
            header: 'Modified By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'modifiedBy', editingCourseLecturerState, courseLecturersCellHandlers, false)
        }
    ]

    //enrollment dialog handlers
    const onClientChange = (e) => {
        setEnrollmentDialogState({
            ...enrollmentDialogState,
            newEnrollment: {
                ...enrollmentDialogState.newEnrollment, clientName: e.target.value,
                clientId: clientOptions.find(option => option.name === e.target.value).id
            }
        });
    }

    const createEnrollment = () => {
        axios.post(apiEndpoints.createEnrollment, {
            courseId: Number(id),
            clientId: enrollmentDialogState.newEnrollment.clientId,
        }).then(response => {
            setNotification({message: 'Enrollment created successfully', type: 'success'});
            fetchEnrollments();
            closeEnrollmentDialog();
        }).catch(error => {
            setNotification({message: 'Failed to create enrollment' + error, type: 'error'});
        });
    };

    //course lecturers dialog handlers
    const createLecturer = () => {
        axios.post(apiEndpoints.createCourseLecturer, {
            courseId: Number(id),
            name: lecturerDialogState.newLecturer.name,
        }).then(response => {
            setNotification({message: 'Lecturer created successfully', type: 'success'});
            fetchCourseLecturers();
            closeLecturerDialog();
        }).catch(error => {
            setNotification({message: 'Failed to create enrollment' + error, type: 'error'});
        });
    }
    const onLecturerChange = (e) => {
        setLecturerDialogState({
            ...lecturerDialogState,
            newLecturer: {
                ...lecturerDialogState.newLecturer, name: e.target.value
            }
        });
    }

    //delete enrollment and course lecturer handlers
    const onDeleteEnrollmentRow = (rowData) => {
        setConfirmEnrollmentDeleteDialog({visible: true, enrollment: rowData});
    }
    const deleteEnrollment = () => {
        axios.delete(apiEndpoints.getEnrollmentDeleteEndpoint(confirmEnrollmentDeleteDialog.enrollment.id))
            .then(() => {
                fetchEnrollments();
                setNotification({message: 'Enrollment deleted successfully', type: 'success'});
                setConfirmEnrollmentDeleteDialog({visible: false, enrollment: null});
            }).catch(error => setNotification({message: `Failed to delete enrollment: ${error}`, type: 'error'}));
    }
    const cancelDeleteEnrollment = () => {
        setConfirmEnrollmentDeleteDialog({visible: false, enrollment: null});
    }

    const onDeleteCourseLecturerRow = (rowData) => {
        setConfirmCourseLecturerDeleteDialog({visible: true, courseLecturer: rowData});
    }
    const deleteCourseLecturer = () => {
        axios.delete(apiEndpoints.getCourseLecturerDeleteEndpoint(confirmCourseLecturerDeleteDialog.courseLecturer.id))
            .then(() => {
                fetchCourseLecturers();
                setNotification({message: 'Course Lecturer deleted successfully', type: 'success'});
                setConfirmCourseLecturerDeleteDialog({visible: false, courseLecturer: null});
            }).catch(error => setNotification({message: `Failed to delete Course Lecturer: ${error}`, type: 'error'}));
    }
    const cancelDeleteCourseLecturer = () => {
        setConfirmCourseLecturerDeleteDialog({visible: false, courseLecturer: null});
    }


    if (!course) {
        return <div>Loading course data...</div>;
    }
    return (
        <>
            <Card className="p-m-4" title="Client Details">
                <div className="p-d-flex p-ai-center p-mb-3">
                    <Avatar label="JD" className="p-mr-3" size="large" shape="circle"/>
                    <h2>{course.name}</h2>
                </div>
                <div className="p-fluid">
                    {/* Name Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="name" className="p-mr-2">Name</label>
                        <InputText
                            id="name"
                            value={course.name || ''}
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

                    {/* part Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="part" className="p-mr-2">Part</label>
                        <InputText
                            id="part"
                            value={course.part || ''}
                            onChange={(e) => handleInputChange(e, 'part')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('part')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('part')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* code Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="code" className="p-mr-2">Code</label>
                        <InputText
                            id="phone"
                            value={course.code || ''}
                            onChange={(e) => handleInputChange(e, 'code')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('code')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('code')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>
                    {/* price Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="code" className="p-mr-2">Price</label>
                        <InputText
                            id="phone"
                            value={course.price || ''}
                            onChange={(e) => handleInputChange(e, 'price')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('price')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('price')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>
                    {/* Start Date Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="startDate" className="p-mr-2">Start Date</label>
                        <InputText
                            id="startDate"
                            value={course.startDate || ''}
                            onChange={(e) => handleInputChange(e, 'startDate')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('startDate')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('startDate')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* End Date Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="country" className="p-mr-2">End Date</label>
                        <InputText
                            id="alternative-phone"
                            value={course.endDate || ''}
                            onChange={(e) => handleInputChange(e, 'endDate')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('endDate')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('endDate')}
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
                onDeleteRow={onDeleteEnrollmentRow}
                data={enrollments} columns={columns} paginatorLeftHandlers={fetchEnrollments}
                downloadFileName={'enrollments'}
                setNotification={setNotification}

            ></Table>


            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'static', marginTop: '20px', bottom: '16px', marginLeft: '800px', zIndex: 1000}}
                onClick={openEnrollmentDialog}
                label="New Enrollment"
            />
            <Dialog
                header="Create New Enrollment"
                visible={enrollmentDialogState.visible}
                style={{width: '50vw'}}
                modal
                onHide={closeEnrollmentDialog}
            >
                <Card title="Enrollment Details">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="client">Client Name</label>
                            <Dropdown id="client"
                                      value={enrollmentDialogState.newEnrollment?.clientName}
                                      options={clientOptions.map(client => client.name)}
                                      placeholder="Select a client"
                                      onChange={onClientChange}
                            />
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createEnrollment} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeEnrollmentDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>
            <div style={{margin: '10px'}}></div>
            <Table
                header={'Course Lecturers'}
                onDeleteRow={onDeleteCourseLecturerRow}
                columns={courseLecturersColumns} data={courseLecturers} paginatorLeftHandlers={fetchCourseLecturers}
            ></Table>

            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'static', marginTop: '20px', bottom: '16px', marginLeft: '800px', zIndex: 1000}}
                onClick={openLecturerDialog}
                label="New Lecturer"
            />
            <Dialog
                header="Create New Lecturer"
                visible={lecturerDialogState.visible}
                style={{width: '50vw'}}
                modal
                onHide={closeLecturerDialog}
            >
                <Card title="Course Lecturer">
                    <div className="p-fluid">
                        <div className="p-field">
                            <label htmlFor="client">Name</label>
                            <InputText id="client"
                                       value={lecturerDialogState.newLecturer?.name}
                                       placeholder="enter lectuer's name"
                                       onInput={onLecturerChange}
                            />
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createLecturer} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeLecturerDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>

            <ConfirmDialog
                visible={confirmEnrollmentDeleteDialog.visible}
                reject={cancelDeleteEnrollment}
                accept={deleteEnrollment}
                header={`Delete ${confirmEnrollmentDeleteDialog.enrollment ? confirmEnrollmentDeleteDialog.enrollment.client.name : ''}`}
                message={`Are you sure you want to delete this  ${confirmEnrollmentDeleteDialog.enrollment ? confirmEnrollmentDeleteDialog.enrollment.client.name : ''}?`}
            >
            </ConfirmDialog>

            <ConfirmDialog
                visible={confirmCourseLecturerDeleteDialog.visible}
                reject={cancelDeleteCourseLecturer}
                accept={deleteCourseLecturer}
                header={`Delete ${confirmCourseLecturerDeleteDialog.courseLecturer ? confirmCourseLecturerDeleteDialog.courseLecturer.name : ''}`}
                message={`Are you sure you want to delete this  ${confirmCourseLecturerDeleteDialog.courseLecturer ? confirmCourseLecturerDeleteDialog.courseLecturer.name : ''} ?`}
            >
            </ConfirmDialog>

            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}
export default CourseDetails;