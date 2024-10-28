import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
import {Button} from 'primereact/button';
import 'primeicons/primeicons.css'; // For using icons
import apiEndpoints from "../apiEndpoints.js";
import Notification from "../components/Notification.jsx";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import Table from "../components/Table.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {genericSortFunction, simplifyDate} from "../utils.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import {useNavigate} from "react-router-dom";
import {ConfirmDialog} from "primereact/confirmdialog";

function Courses() {

    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({});
    const [courseStatusOptions, setCourseStatusOptions] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});
    const [displayDialog, setDisplayDialog] = useState(false);
    const axios = useAxios();
    const navigate = useNavigate();
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, course: null});


    const fetchCourseStatusOptions = () => {
        axios.get(apiEndpoints.courseStatuses).then(response => {
            console.log(response.data.response);
            setCourseStatusOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch course options ' + error, type: 'error'}))
        ;
    }
    const fetchCourses = () => {
        axios.get(apiEndpoints.courses).then(response => {
            setCourses(response.data.response);
        }).catch(error =>
            setNotification({message: 'Failed to fetch courses ' + error, type: 'error'})
        );
    }


    useEffect(() => {
        fetchCourses();
        fetchCourseStatusOptions();
    }, []);

    const openDialog = () => {
        setDisplayDialog(true);
    };

    const closeDialog = () => {
        setDisplayDialog(false);
        setNewCourse({});
    };
    const createCourse = () => {
        closeDialog();
        axios.post(apiEndpoints.createCourse, newCourse)
            .then(() => {
                fetchCourses();
                setNotification({message: 'Client created successfully', type: 'success'});

            }).catch(error => setNotification({message: `Failed to create client: ${error}`, type: 'error'}));


    }

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
        const endpoint = apiEndpoints.getCourseUpdateEndpoint(clientId, columnField, editingState.editedValue.id);
        if (editingState.editedValue !== '' && (columnField === 'startDate' || columnField === 'endDate')) {
            editingState.editedValue = new Date(editingState.editedValue).toISOString();
        }
        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchCourses();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error =>
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'})
        );

    };
    const onDropDownChange = (e, columnField) => {
        switch (columnField) {
            case 'courseStatus':
                setEditingState({
                    ...editingState,
                    editedValue: courseStatusOptions.find(option => option.status === e.target.value)
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
            field: 'code',
            header: 'Code',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'code', editingState, cellHandlers)
        },
        {
            field: 'name',
            header: 'Name',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'name', editingState, cellHandlers)
        },
        {
            field: 'part',
            header: 'Part',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'part', editingState, cellHandlers)
        },
        {
            field: 'price',
            header: 'Price',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'price', editingState, cellHandlers)
        },
        {
            field: 'courseStatus',
            header: 'Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            sortFunction: (e) => genericSortFunction(e, 'courseStatus', 'status'),
            body: (rowData) => DropDownCellTemplate(rowData, 'courseStatus', 'status', editingState, courseStatusOptions, dropDownCellHandlers)
        },
        {
            field: 'startDate',
            header: 'Start Date',
            filter: true,
            sortable: true,

            body: (rowData) => CellTemplate(rowData, 'startDate', editingState, cellHandlers)
        },
        {
            field: 'endDate',
            header: 'End Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'endDate', editingState, cellHandlers)
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
        }


    ]
    const onRowClick = (course) => {
        navigate(`/course/${course.id}`, {state: {course}});

    }
    const onDeleteRow = (rowData) => {
        setConfirmDeleteDialog({visible: true, course: rowData});
    }
    const deleteCourse = () => {
        axios.delete(apiEndpoints.getCourseDeleteEndpoint(confirmDeleteDialog.course.id))
            .then(() => {
                fetchCourses();
                setNotification({message: 'Client deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, course: null});
            }).catch(error => setNotification({message: `Failed to delete client: ${error}`, type: 'error'}));
    }
    const cancelDeleteCourse = () => {
        setConfirmDeleteDialog({visible: false, course: null});
    }

    return (
        <>
            <Table
                header={<h2>Courses</h2>}
                onDeleteRow={onDeleteRow}
                columns={columns} data={courses} onRowClick={onRowClick} setNotification={setNotification}
                paginatorLeftHandlers={{fetchCourses, fetchCourseOptions: fetchCourseStatusOptions}}
                downloadFileName="courses"
            >
            </Table>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{position: 'fixed', marginTop: '200px', bottom: '16px', right: '16px', zIndex: 1000}}
                onClick={openDialog}
                label="New Course"
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
                                       onInput={(e) => setNewCourse({...newCourse, name: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="code">Code</label>
                            <InputText id="code"
                                       onInput={(e) => setNewCourse({...newCourse, code: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="part">Part</label>
                            <InputText id="part"
                                       onInput={(e) => setNewCourse({...newCourse, part: e.target.value})}/>
                        </div>
                        <div className="p-field">
                            <label htmlFor="price">Price</label>
                            <InputText id="price"
                                       onInput={(e) => setNewCourse({...newCourse, price: e.target.value})}/>
                        </div>

                        <div className="p-d-flex p-jc-end">
                            <Button label="Save" icon="pi pi-check" onClick={createCourse} className="p-mr-2"/>
                            <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                    className="p-button-secondary"/>
                        </div>
                    </div>
                </Card>
            </Dialog>
            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteCourse}
                accept={deleteCourse}
                header={`Delete ${confirmDeleteDialog.course ? confirmDeleteDialog.course.name : ''}`}
                message={`Are you sure you want to delete ${confirmDeleteDialog.course ? confirmDeleteDialog.course.name : ''}?`}
            >
            </ConfirmDialog>
            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Courses;
