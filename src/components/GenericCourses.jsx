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
import {getCriteria, getCustomSorting, simplifyDate} from "../utils.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import {useNavigate} from "react-router-dom";
import {ConfirmDialog} from "primereact/confirmdialog";
import {COURSE_PARTS} from "../constants.js";
import {Dropdown} from "primereact/dropdown";
import {FilterMatchMode} from "primereact/api";
import DynamicListRowFilterTemplate from "../templates/DynamicListRowFilterTemplate.jsx";
import useSecurity from "../hooks/useSecurity.js";

function GenericCourses({
                            header, isInitial = false
                        }) {

    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({});
    const [courseStatusOptions, setCourseStatusOptions] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});
    const [displayDialog, setDisplayDialog] = useState(false);
    const axios = useAxios();
    const security = useSecurity();
    const navigate = useNavigate();
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, course: null});
    const [filters, setFilters] = useState({
        name: {value: null, matchMode: 'contains'},
        code: {value: null, matchMode: 'contains'},
        part: {value: null, matchMode: 'contains'},
        description: {value: null, matchMode: 'contains'},
        price: {value: null, matchMode: 'contains'},
        startDate: {value: null, matchMode: 'contains'},
        isInitial: {value: isInitial, matchMode: FilterMatchMode.EQUALS},
        endDate: {value: null, matchMode: 'contains'},
        courseStatusIds: {value: [], matchMode: FilterMatchMode.IN},
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
        sortBy: "name",
        sortDesc: false,
        defaultSortField: "name",
    });
    const [loading, setLoading] = useState(true);

    const fetchCourseStatusOptions = () => {
        axios.get(apiEndpoints.courseStatuses).then(response => {
            console.log(response.data.response);
            setCourseStatusOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch course options ' + error, type: 'error'}))
        ;
    }
    const fetchPaginatedCourses = (paginationDetails = null) => {
        setLoading(true);
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedCourses, {
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
            setCourses(result);
            setLoading(false);
        }).catch(error => {
            setNotification({message: `Failed to fetch courses: ${error}`, type: 'error'});
            setLoading(false);
        });
    }


    useEffect(() => {
        fetchPaginatedCourses();
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
        axios.post(isInitial === true ? apiEndpoints.createInitialCourse : apiEndpoints.createCourse, newCourse)
            .then(() => {
                fetchPaginatedCourses();
                setNotification({message: 'Course created successfully', type: 'success'});

            }).catch(error => setNotification({message: `Failed to create Course: ${error}`, type: 'error'}));


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
            fetchPaginatedCourses();
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
            case 'part':
                setEditingState({
                    ...editingState,
                    editedValue: COURSE_PARTS.find(part => part === e.target.value)
                });
        }

    };

    const cellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onCellChange
    };
    const dropDownCellHandlers = {
        onEdit, onSubmitEdit, onCancelEdit, onOptionChange: onDropDownChange
    }

    const columns = [
        ...(isInitial === false ? [{
            field: 'code',
            header: 'Code',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'code', editingState, cellHandlers)
        }] : []),
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
            body: (rowData) => DropDownCellTemplate(rowData, 'part', null, editingState, COURSE_PARTS, dropDownCellHandlers)
        },
        ...(isInitial === false ? [{
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
                filterElement: DynamicListRowFilterTemplate({
                    value: filters.courseStatusIds.value,
                    filterApplyCallback: (value) => setFilters({
                        ...filters,
                        courseStatusIds: {value, matchMode: FilterMatchMode.IN}
                    })
                }, courseStatusOptions, 'status'),

                body: (rowData) => DropDownCellTemplate(rowData, 'courseStatus', 'status', editingState, courseStatusOptions, dropDownCellHandlers)
            },
            {
                field: 'startDate',
                header: 'Start Date',
                filter: true,
                sortable: true,

                body: (rowData) => CellTemplate({
                    ...rowData,
                    startDate: simplifyDate(rowData.startDate)
                }, 'startDate', editingState, cellHandlers)
            },
            {
                field: 'endDate',
                header: 'End Date',
                filter: true,
                sortable: true,
                body: (rowData) => CellTemplate({
                    ...rowData,
                    endDate: simplifyDate(rowData.endDate)
                }, 'endDate', editingState, cellHandlers)
            },] : []),
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
        if (isInitial === false)
            navigate(`/course/${course.id}`, {state: {course}});

    }
    const onDeleteRow = (rowData) => {
        if (security.isAuthorizedToDelete())
            setConfirmDeleteDialog({visible: true, course: rowData});
        else
            setNotification({message: 'You are not authorized to delete courses', type: 'error'});
    }
    const deleteCourse = () => {
        axios.delete(apiEndpoints.getCourseDeleteEndpoint(confirmDeleteDialog.course.id))
            .then(() => {
                fetchPaginatedCourses();
                setNotification({message: 'Client deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, course: null});
            }).catch(error => setNotification({message: `Failed to delete client: ${error}`, type: 'error'}));
    }
    const cancelDeleteCourse = () => {
        setConfirmDeleteDialog({visible: false, course: null});
    }
    const onPage = (e) => {
        fetchPaginatedCourses({pageNumber: e.page + 1, pageSize: e.rows});
    }


    return (
        <>
            <Table
                header={<h2> {header}</h2>}
                onDeleteRow={onDeleteRow}
                columns={columns} data={courses} onRowClick={onRowClick} setNotification={setNotification}
                paginatorLeftHandlers={{
                    fetchCourses: fetchPaginatedCourses,
                    fetchCourseOptions: fetchCourseStatusOptions
                }}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                onPage={onPage}
                loading={loading}
                fetchPaginatedItems={fetchPaginatedCourses}
                downloadFileName={header}
            >
            </Table>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-primary"
                style={{
                    position: 'fixed',
                    marginTop: '200px',
                    bottom: '16px',
                    right: isInitial ? '300px' : '16px',
                    zIndex: 1000
                }}
                onClick={openDialog}
                label={`Create New ${isInitial ? 'Initial ' : ''}Course`}
            />
            <Dialog
                header="Create New Course"
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
                            <label htmlFor="part">Part</label>
                            <Dropdown id="part"
                                      options={COURSE_PARTS}
                                      value={newCourse.part || ''}
                                      onChange={(e) => setNewCourse({...newCourse, part: e.target.value})}/>

                        </div>

                        {!isInitial && (
                            <>
                                <div className="p-field">
                                    <label htmlFor="code">Code</label>
                                    <InputText id="code"
                                               onInput={(e) => setNewCourse({...newCourse, code: e.target.value})}/>
                                </div>
                                <div className="p-field">
                                    <label htmlFor="price">Price</label>
                                    <InputText id="price"
                                               onInput={(e) => setNewCourse({...newCourse, price: e.target.value})}/>
                                </div>
                            </>
                        )}

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

export default GenericCourses;
