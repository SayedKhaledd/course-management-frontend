import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";

import 'primeicons/primeicons.css';
import Notification from "../components/Notification.jsx";
import Table from "../components/Table.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {getCriteria, getCustomSorting, simplifyDate} from "../utils.js";
import {ConfirmDialog} from "primereact/confirmdialog";
import {FilterMatchMode} from "primereact/api";
import DynamicListRowFilterTemplate from "../templates/DynamicListRowFilterTemplate.jsx";
import useSecurity from "../hooks/useSecurity.js";

function Refunds({enrollmentId = null, refresh = false, fetchEnrollment = null}) {
    const [refunds, setRefunds] = useState([]);
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [refundStatusOptions, setRefundStatusOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [refundMethodOptions, setRefundMethodOptions] = useState([]);
    const [refundReasonOptions, setRefundReasonOptions] = useState([]);
    const axios = useAxios();
    const security = useSecurity();
    const [notification, setNotification] = useState({message: '', type: ''});

    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, refund: null});
    const [filters, setFilters] = useState({
        paymentMethodIds: {value: [], matchMode: FilterMatchMode.IN},
        refundReasonIds: {value: [], matchMode: FilterMatchMode.IN},
        refundStatusIds: {value: [], matchMode: FilterMatchMode.IN},
        refundMethodIds: {value: [], matchMode: FilterMatchMode.IN},
        enrollmentId: {value: enrollmentId, matchMode: 'contains'},
        clientName: {value: null, matchMode: 'contains'},
        courseName: {value: null, matchMode: 'contains'},
        refundedAmount: {value: null, matchMode: 'contains'},
        enrollmentAmount: {value: null, matchMode: 'contains'},
        refundDate: {value: null, matchMode: 'contains'},
        firstExplanation: {value: null, matchMode: 'contains'},
        secondExplanation: {value: null, matchMode: 'contains'},
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

    const fetchPaginatedRefunds = (paginationDetails = null) => {
        setLoading(true);
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedRefunds, {
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
            setRefunds(result);
            setLoading(false);
        }).catch(error => {
            setNotification({message: `Failed to fetch refunds: ${error}`, type: 'error'});
            setLoading(false);
        });
    }

    const fetchPaymentMethodOptions = () => {
        axios.get(apiEndpoints.paymentMethods).then(response => {
            setPaymentMethodOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch payment method options ' + error, type: 'error'}));
    }
    const fetchRefundMethodOptions = () => {
        axios.get(apiEndpoints.refundMethods).then(response => {
            setRefundMethodOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch payment method options ' + error, type: 'error'}));
    }


    const fetchRefundStatusOptions = () => {
        axios.get(apiEndpoints.refundStatuses).then(response => {
            setRefundStatusOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch refund status options ' + error, type: 'error'}));
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
            case 'refundMethod':
                setEditingState({
                    ...editingState,
                    editedValue: refundMethodOptions.find(option => option.method === e.target.value)
                });
                break;

            case 'refundStatus':
                setEditingState({
                    ...editingState,
                    editedValue: refundStatusOptions.find(option => option.status === e.target.value)
                });
                break;

        }

    }

    const onSubmitEdit = (id, columnField) => {
        const endpoint = apiEndpoints.getRefundUpdateEndpoint(id, columnField, editingState.editedValue.id);
        if (editingState.editedValue !== '' && (columnField === 'refundDate')) {
            editingState.editedValue = new Date(editingState.editedValue).toISOString();
        }

        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchPaginatedRefunds();
            if(fetchEnrollment)
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
            field: 'refundedAmount',
            header: 'Refunded Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'refundedAmount', editingState, handlers)
        },
        {
            field: 'enrollmentAmount',
            header: 'Enrollment Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'enrollmentAmount', editingState, handlers, false)
        },
        {
            field: 'refundDate',
            header: 'Refund Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                refundDate: simplifyDate(rowData.refundDate)
            }, 'refundDate', editingState, handlers)
        },
        {
            field: 'refundReason',
            header: 'Reason',
            listFieldName: 'reason',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                    value: filters.refundReasonIds.value,
                    filterApplyCallback: (value) => setFilters({
                        ...filters, refundReasonIds: {value, matchMode: FilterMatchMode}
                    })
                }
                , refundReasonOptions, 'reason'),
            body: (rowData) => DropDownCellTemplate(rowData, 'refundReason', 'reason', editingState, refundReasonOptions, dropDownCellHandlers)
        },
        {
            field: 'firstExplanation',
            header: 'First Explanation',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'firstExplanation', editingState, handlers)
        },
        {
            field: 'secondExplanation',
            header: 'Second Explanation',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'secondExplanation', editingState, handlers)
        },
        {
            field: 'refundStatus',
            header: 'Refund Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                    value: filters.refundStatusIds.value,
                    filterApplyCallback: (value) => setFilters({
                        ...filters, refundStatusIds: {value, matchMode: FilterMatchMode}
                    })
                }
                , refundStatusOptions, 'status'),

            body: (rowData) => DropDownCellTemplate(rowData, 'refundStatus', 'status', editingState, refundStatusOptions, dropDownCellHandlers, false)
        },
        {
            field: 'paymentMethod',
            header: 'Payment Method',
            listFieldName: 'method',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.paymentMethodIds.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters, paymentMethodIds: {value, matchMode: FilterMatchMode}
                })
            }, paymentMethodOptions, 'method'),

            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingState, paymentMethodOptions, dropDownCellHandlers, false, false)
        },
        {
            field: 'refundMethod',
            header: 'Refund Method',
            listFieldName: 'method',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.refundMethodIds.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters, refundMethodIds: {value, matchMode: FilterMatchMode}
                })
            }, refundMethodOptions, 'method'),
            body: (rowData) => DropDownCellTemplate(rowData, 'refundMethod', 'method', editingState, refundMethodOptions, dropDownCellHandlers)
        },

    ]


    const onDeleteRow = (rowData) => {
        if (security.isAuthorizedToDelete())
            setConfirmDeleteDialog({visible: true, refund: rowData});
        else
            setNotification({message: 'You are not authorized to delete refunds', type: 'error'});
    }
    const deleteRefund = () => {
        axios.delete(apiEndpoints.getRefundDeleteEndpoint(confirmDeleteDialog.refund.id))
            .then(() => {
                fetchPaginatedRefunds();
                setNotification({message: 'Refund deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, refund: null});
            }).catch(error => setNotification({message: `Failed to delete refund: ${error}`, type: 'error'}));
    }
    const cancelDeleteRefund = () => {
        setConfirmDeleteDialog({visible: false, refund: null});
    }


    useEffect(() => {
        fetchPaginatedRefunds();
        fetchPaymentMethodOptions();
        fetchRefundReasonOptions();
        fetchRefundStatusOptions();
        fetchRefundMethodOptions();

    }, [refresh]);

    const onPage = (e) => {
        fetchPaginatedRefunds({pageNumber: e.page + 1, pageSize: e.rows});
    }

    return (
        <>
            <Table
                header={<h2>Refunds</h2>}
                columns={columns}
                data={refunds}
                onDeleteRow={onDeleteRow}
                downloadFileName={'refunds'}
                setNotification={setNotification}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                onPage={onPage}
                loading={loading}
                fetchPaginatedItems={fetchPaginatedRefunds}
                paginatorLeftHandlers={[fetchPaginatedRefunds, fetchPaymentMethodOptions, fetchRefundReasonOptions]}

            ></Table>
            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteRefund}
                accept={deleteRefund}
                header={`Delete ${confirmDeleteDialog.refund ? confirmDeleteDialog.refund.enrollment.course.name : ''}`}
                message={`Are you sure you want to delete this  ${confirmDeleteDialog.refund ? confirmDeleteDialog.refund.enrollment.course.name : ''} refund?`}
            >
            </ConfirmDialog>

            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Refunds;
