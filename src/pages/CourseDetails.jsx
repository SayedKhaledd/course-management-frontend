import {Card} from "primereact/card";
import {Avatar} from "primereact/avatar";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import HistoryDialog from "../components/HistoryDialog.jsx";
import React, {useEffect, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import useAxios from "../useAxios.js";
import apiEndpoints from "../apiEndpoints.js";
import Notification from "../components/Notification.jsx";
import Table from "../components/Table.jsx";
import {Dialog} from "primereact/dialog";
import {Dropdown} from "primereact/dropdown";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {simplifyDate} from "../utils.js";

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
    const [dialogState, setDialogState] = useState({visible: false, newEnrollment: {}});
    const [courseLecturers, setCourseLecturers] = useState([]);
    const [editingCourseLecturerState, setEditingCourseLecturerState] = useState({
        id: '',
        columnField: '',
        editedValue: null
    });
    const [lecturerDialogState, setLecturerDialogState] = useState({visible: false, newLecturer: {}});


    const fetchCourse = () => {
        axios.get(apiEndpoints.course(id))
            .then(response => setCourse(response.data.response))
            .catch(error => setNotification({message: 'Failed to fetch course ' + error, type: 'error'}));
    }


    const fetchEnrollments = () => {
        axios.get(apiEndpoints.enrollmentsByCourseId(id))
            .then(response => setEnrollments(response.data.response))
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
                setCourseLecturers(response.data.response);
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

    const handleInputChange = (e, field) => {
        setCourse({...course, [field]: e.target.value});
    };
    const handleSave = async (columnField) => {
        const endpoint = apiEndpoints.getCourseUpdateEndpoint(id, columnField, course[columnField]?.id);
        const payload = {[columnField]: course[columnField]};
        await axios.patch(endpoint, payload).then(() => {
            fetchCourse();
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

    const openDialog = () => {
        setDialogState({...dialogState, visible: true});
    }

    const closeDialog = () => {
        setDialogState({...dialogState, visible: false});
    }
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
        let endpoint = apiEndpoints.getEnrollmentUpdateEndpoint(enrollmentId, columnField, editingEnrollmentState.editedValue.id);
        if (columnField === 'payInInstallments') {
            endpoint = apiEndpoints.updateEnrollmentFieldBoolean(enrollmentId, columnField, editingEnrollmentState.editedValue);
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

        }

    };


    const cellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onCellChange
    };
    const dropDownCellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onOptionChange: onDropDownChange
    };

    const columns = [
        {
            field: 'client',
            header: 'Client',
            filter: true,
            listFieldName: 'name',
            sortable: true,
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
            body: (rowData) => CellTemplate(rowData, 'remainingAmount', editingEnrollmentState, cellHandlers)
        },
        {
            field: 'payInInstallments',
            header: 'Pay in Installments',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'payInInstallments', editingEnrollmentState, cellHandlers)
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
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingEnrollmentState, paymentMethodOptions, dropDownCellHandlers)
        },
        {
            field: 'paymentStatus',
            header: 'Payment Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentStatus', 'status', editingEnrollmentState, paymentStatusOptions, dropDownCellHandlers)
        },
        {
            field: 'actionTaken',
            header: 'Action Taken',
            listFieldName: 'action',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'actionTaken', 'action', editingEnrollmentState, actionOptions, dropDownCellHandlers)
        },
        {
            field: 'referralSource',
            header: 'Referral Source',
            listFieldName: 'source',
            filter: true,
            sortable: true,
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
        const endpoint = columnField === 'paidInPercentage' ? apiEndpoints.updateCourseLecturerPaidStatus(courseLecturerId, editingCourseLecturerState.editedValue) : apiEndpoints.updateCourseLecturerField(courseLecturerId, columnField);
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
            body: (rowData) => CellTemplate(rowData, 'paidInPercentage', editingCourseLecturerState, courseLecturersCellHandlers)
        },
        {
            field: 'percentage',
            header: 'Percentage',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'percentage', editingCourseLecturerState, courseLecturersCellHandlers)
        },
        {
            field: 'fixedValue',
            header: 'Fixed Value',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'fixedValue', editingCourseLecturerState, courseLecturersCellHandlers)
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

    const onClientChange = (e) => {
        setDialogState({
            ...dialogState,
            newEnrollment: {
                ...dialogState.newEnrollment, clientName: e.target.value,
                clientId: clientOptions.find(option => option.name === e.target.value).id
            }
        });
    }

    const createEnrollment = () => {
        axios.post(apiEndpoints.createEnrollment, {
            courseId: Number(id),
            clientId: dialogState.newEnrollment.clientId,
        }).then(response => {
            setNotification({message: 'Enrollment created successfully', type: 'success'});
            fetchEnrollments();
            closeLecturerDialog();
        }).catch(error => {
            setNotification({message: 'Failed to create enrollment' + error, type: 'error'});
        });
    };

    const openLecturerDialog = () => {
        setLecturerDialogState({...lecturerDialogState, visible: true});
    }

    const closeLecturerDialog = () => {
        setLecturerDialogState({...lecturerDialogState, visible: false});
    }

    const createLecturer = () => {
        axios.post(apiEndpoints.createCourseLecturer, {
            courseId: Number(id),
            name: lecturerDialogState.newLecturer.name,
        }).then(response => {
            setNotification({message: 'Lecturer created successfully', type: 'success'});
            fetchCourseLecturers();
            closeDialog();
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

            <h2>Enrollments</h2>
            {/*<Table></Table>*/}


            {/*<Table></Table>*/}
            <Table data={enrollments} columns={columns} paginatorLeftHandlers={fetchEnrollments}
                   downloadFileName={'enrollments'}
                   setNotification={setNotification}

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
                            <label htmlFor="client">Client Name</label>
                            <Dropdown id="client"
                                      value={dialogState.newEnrollment?.clientName}
                                      options={clientOptions.map(client => client.name)}
                                      placeholder="Select a client"
                                      onChange={onClientChange}
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

            <h2>Lecturers</h2>
            <Table
                columns={courseLecturersColumns} data={courseLecturers} paginatorLeftHandlers={fetchCourseLecturers}
            ></Table>

            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '300px', zIndex: 1000}}
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
                <Card title="Enrollment Details">
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

            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}
export default CourseDetails;