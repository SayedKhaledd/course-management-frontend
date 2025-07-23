import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";

import 'primeicons/primeicons.css';
import Notification from "../components/Notification.jsx";
import Table from "../components/Table.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {getCriteria, getCustomSorting} from "../utils.js";
import {ConfirmDialog} from "primereact/confirmdialog";
import {FilterMatchMode} from "primereact/api";
import DynamicListRowFilterTemplate from "../templates/DynamicListRowFilterTemplate.jsx";
import useSecurity from "../hooks/useSecurity.js";

function Evaluations({enrollmentId = null, refresh = false, fetchEnrollment = null}) {
    const [evaluations, setEvaluations] = useState([]);
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [evaluationStatusOptions, setEvaluationStatusOptions] = useState([]);
    const axios = useAxios();
    const security = useSecurity();
    const [notification, setNotification] = useState({message: '', type: ''});
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, evaluation: null});
    const [filters, setFilters] = useState({
        evaluationStatusIds: {value: [], matchMode: FilterMatchMode.IN},
        enrollmentId: {value: enrollmentId, matchMode: 'contains'},
        clientName: {value: null, matchMode: 'contains'},
        courseName: {value: null, matchMode: 'contains'},
        examName: {value: null, matchMode: 'contains'},
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
        sortBy: "id",
        sortDesc: false,
        defaultSortField: "id",
    });
    const [loading, setLoading] = useState(true);

    const fetchPaginatedEvaluations = (paginationDetails = null) => {
        setLoading(true);
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedEvaluations, {
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
            setEvaluations(result);
            setLoading(false);
        }).catch(error => {
            setNotification({message: `Failed to fetch refunds: ${error}`, type: 'error'});
            setLoading(false);
        });
    }

    const fetchEvaluationStatusOptions = () => {
        axios.get(apiEndpoints.evaluationStatuses).then(response => {
            setEvaluationStatusOptions(response.data.response);
        }).catch(error => setNotification({
            message: 'Failed to fetch evaluation status options ' + error,
            type: 'error'
        }));
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
            case 'evaluationStatus':
                setEditingState({
                    ...editingState,
                    editedValue: evaluationStatusOptions.find(option => option.status === e.target.value)
                });
                break;
        }

    }

    const onSubmitEdit = (id, columnField) => {
        const endpoint = apiEndpoints.getEvaluationUpdateEndpoint(id, columnField, editingState.editedValue);
        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchPaginatedEvaluations();
            if (fetchEnrollment)
                fetchEnrollment();
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
        ...enrollmentId == null ? ([{
                field: 'enrollment',
                header: 'Client',
                listFieldName: 'client',
                nestedField: 'name',
                filter: true,
                sortable: true,
                filterField: 'clientName',
                body: (rowData) => DropDownCellTemplate(rowData, 'enrollment', 'client', editingState, null, dropDownCellHandlers, 'name', false)

            },
                {
                    field: 'enrollment',
                    header: 'Course',
                    listFieldName: 'course',
                    nestedField: 'name',
                    filter: true,
                    sortable: true,
                    filterField: 'courseName',
                    body: (rowData) => DropDownCellTemplate(rowData, 'enrollment', 'course', editingState, null, dropDownCellHandlers, 'name', false)
                }]

        ) : [],
        {
            field: 'examName',
            header: 'Exam Name',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'examName', editingState, handlers)
        },
        {
            field: 'evaluationStatus',
            header: 'Status',
            listFieldName: 'reason',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                    value: filters.evaluationStatusIds.value,
                    filterApplyCallback: (value) => setFilters({
                        ...filters,
                        evaluationStatusIds: {value, matchMode: FilterMatchMode}
                    })
                }
                , evaluationStatusOptions, 'status'),
            body: (rowData) => DropDownCellTemplate(rowData, 'evaluationStatus', 'status', editingState, evaluationStatusOptions, dropDownCellHandlers)
        },
    ]


    const onDeleteRow = (rowData) => {
        if (security.isAuthorizedToDelete())
            setConfirmDeleteDialog({visible: true, evaluation: rowData});
        else
            setNotification({message: 'You are not authorized to delete evaluations', type: 'error'});
    }
    const deleteEvaluation = () => {
        axios.delete(apiEndpoints.getEvaluationDeleteEndpoint(confirmDeleteDialog.evaluation.id))
            .then(() => {
                fetchPaginatedEvaluations();
                setNotification({message: 'Evaluation deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, evaluation: null});
            }).catch(error => setNotification({message: `Failed to delete evaluation: ${error}`, type: 'error'}));
    }
    const cancelDeleteEvaluation = () => {
        setConfirmDeleteDialog({visible: false, evaluation: null});
    }


    useEffect(() => {
        fetchPaginatedEvaluations();
        fetchEvaluationStatusOptions();

    }, [refresh]);

    const onPage = (e) => {
        fetchPaginatedEvaluations({pageNumber: e.page + 1, pageSize: e.rows});
    }

    return (
        <>
            <Table
                header={<h2>Evaluations</h2>}
                columns={columns}
                data={evaluations}
                onDeleteRow={onDeleteRow}
                downloadFileName={'evaluations'}
                setNotification={setNotification}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                onPage={onPage}
                loading={loading}
                fetchPaginatedItems={fetchPaginatedEvaluations}
                paginatorLeftHandlers={[fetchPaginatedEvaluations, fetchEvaluationStatusOptions]}

            ></Table>
            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteEvaluation}
                accept={deleteEvaluation}
                header={`Delete ${confirmDeleteDialog.evaluation ? confirmDeleteDialog.evaluation.enrollment.course.name : ''}`}
                message={`Are you sure you want to delete this  ${confirmDeleteDialog.evaluation ? confirmDeleteDialog.evaluation.enrollment.course.name : ''} evaluation?`}
            >
            </ConfirmDialog>

            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Evaluations;
