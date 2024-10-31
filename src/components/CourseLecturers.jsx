import {ConfirmDialog} from "primereact/confirmdialog";
import Notification from "./Notification.jsx";
import React, {useEffect, useState} from "react";
import Table from "./Table.jsx";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import apiEndpoints from "../apiEndpoints.js";
import CellTemplate from "../templates/CellTemplate.jsx";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import {TRUE_FALSE_OPTIONS} from "../constants.js";
import {simplifyDate} from "../utils.js";
import {useParams} from "react-router-dom";
import useAxios from "../hooks/useAxios.js";

const CourseLecturers = ({}) => {
    const {id} = useParams();
    const axios = useAxios();
    const [notification, setNotification] = useState({message: '', type: ''});
    const [courseLecturers, setCourseLecturers] = useState([]);
    const [editingState, setEditingState] = useState({
        id: '',
        columnField: '',
        editedValue: null
    });
    const [dialogState, setDialogState] = useState({visible: false, newLecturer: {}});
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
        visible: false,
        courseLecturer: null
    });


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

    useEffect(() => {
        fetchCourseLecturers();
    }, []);

    //course lecturers cell change handlers
    const onEdit = (id, columnField, editedValue) => {
        setEditingState({id, columnField, editedValue});
    }

    const onCancelEdit = () => {
        setEditingState({id: '', columnField: '', editedValue: null});
    }

    const onCellChange = (e) => {
        setEditingState({...editingState, editedValue: e.target.value});
    }

    const onSubmitEdit = async (courseLecturerId, columnField) => {
        const endpoint = columnField === 'paidInPercentage' ? apiEndpoints.updateCourseLecturerPaidStatus(courseLecturerId, editingState.editedValue === 'Yes')
            : apiEndpoints.updateCourseLecturerField(courseLecturerId, columnField);
        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchCourseLecturers();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});
        });
    }


    const onDropDownChange = (e, columnField) => {
        switch (columnField) {
            case 'paidInPercentage':
                setEditingState({
                    ...editingState,
                    editedValue: e.target.value
                });
                break;


        }

    };


    const cellHandlers = {
        onEdit: onEdit,
        onSubmitEdit: onSubmitEdit,
        onCancelEdit: onCancelEdit,
        onCellChange: onCellChange
    };

    const dropDownCellHandlers = {
        onEdit: onEdit,
        onSubmitEdit: onSubmitEdit,
        onCancelEdit: onCancelEdit,
        onCellChange: onCellChange,
        onOptionChange: onDropDownChange
    }

    //course lecturers columns
    const columns = [
        {
            field: 'name',
            header: 'Lecturer',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'name', editingState, cellHandlers)
        },
        {
            field: 'paidInPercentage',
            header: 'Paid In Percentage',
            filter: true,
            sortable: true,
            body: (rowData) => DropDownCellTemplate(rowData, 'paidInPercentage', null, editingState, TRUE_FALSE_OPTIONS, dropDownCellHandlers)
        },
        {
            field: 'percentage',
            header: 'Percentage',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'percentage', editingState, cellHandlers)
        },
        {
            field: 'totalPercentageCost',
            header: 'Total Percentage Cost',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'totalPercentageCost', editingState, cellHandlers, false)
        },
        {
            field: 'noOfLectures',
            header: 'No. of Lectures',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'noOfLectures', editingState, cellHandlers)
        },
        {
            field: 'lectureCost',
            header: 'Lecture Cost',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'lectureCost', editingState, cellHandlers)
        },
        {
            field: 'totalFixedCost',
            header: 'Total Fixed Cost',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'totalFixedCost', editingState, cellHandlers, false)
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
            field: 'createdBy',
            header: 'Created By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'createdBy', editingState, cellHandlers, false)
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
            field: 'modifiedBy',
            header: 'Modified By',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'modifiedBy', editingState, cellHandlers, false)
        }
    ]

    const createLecturer = () => {
        axios.post(apiEndpoints.createCourseLecturer, {
            courseId: Number(id),
            name: dialogState.newLecturer.name,
        }).then(response => {
            setNotification({message: 'Lecturer created successfully', type: 'success'});
            fetchCourseLecturers();
            closeDialog();
        }).catch(error => {
            setNotification({message: 'Failed to create enrollment' + error, type: 'error'});
        });
    }
    const onChange = (e) => {
        setDialogState({
            ...dialogState,
            newLecturer: {
                ...dialogState.newLecturer, name: e.target.value
            }
        });
    }

    const onDelete = (rowData) => {
        setConfirmDeleteDialog({visible: true, courseLecturer: rowData});
    }
    const deleteCourseLecturer = () => {
        axios.delete(apiEndpoints.getCourseLecturerDeleteEndpoint(confirmDeleteDialog.courseLecturer.id))
            .then(() => {
                fetchCourseLecturers();
                setNotification({message: 'Course Lecturer deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, courseLecturer: null});
            }).catch(error => setNotification({message: `Failed to delete Course Lecturer: ${error}`, type: 'error'}));
    }
    const cancelDelete = () => {
        setConfirmDeleteDialog({visible: false, courseLecturer: null});
    }
    const openDialog = () => {
        setDialogState({...dialogState, visible: true});
    }

    const closeDialog = () => {
        setDialogState({...dialogState, visible: false});
    }


    return (<>

        <Table
            header={'Course Lecturers'}
            onDeleteRow={onDelete}
            columns={columns} data={courseLecturers} paginatorLeftHandlers={fetchCourseLecturers}
        ></Table>

        <Button
            icon="pi pi-plus"
            className="p-button-rounded p-button-primary"
            style={{position: 'static', marginTop: '20px', bottom: '16px', marginLeft: '800px', zIndex: 1000}}
            onClick={openDialog}
            label="New Lecturer"
        />
        <Dialog
            header="Create New Lecturer"
            visible={dialogState.visible}
            style={{width: '50vw'}}
            modal
            onHide={closeDialog}
        >
            <Card title="Course Lecturer">
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="client">Name</label>
                        <InputText id="client"
                                   value={dialogState.newLecturer?.name}
                                   placeholder="enter lectuer's name"
                                   onInput={onChange}
                        />
                    </div>

                    <div className="p-d-flex p-jc-end">
                        <Button label="Save" icon="pi pi-check" onClick={createLecturer} className="p-mr-2"/>
                        <Button label="Cancel" icon="pi pi-times" onClick={closeDialog}
                                className="p-button-secondary"/>
                    </div>
                </div>
            </Card>
        </Dialog>
        <ConfirmDialog
            visible={confirmDeleteDialog.visible}
            reject={cancelDelete}
            accept={deleteCourseLecturer}
            header={`Delete ${confirmDeleteDialog.courseLecturer ? confirmDeleteDialog.courseLecturer.name : ''}`}
            message={`Are you sure you want to delete this  ${confirmDeleteDialog.courseLecturer ? confirmDeleteDialog.courseLecturer.name : ''} ?`}
        >
        </ConfirmDialog>

        <Notification status={notification.type} message={notification.message}/>

    </>);
}
export default CourseLecturers;