import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";

import 'primeicons/primeicons.css';
import Table from "../components/Table.jsx";
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {getCriteria, getCustomSorting, simplifyDate} from "../utils.js";
import {ConfirmDialog} from "primereact/confirmdialog";
import {FilterMatchMode} from "primereact/api";
import DynamicListRowFilterTemplate from "../templates/DynamicListRowFilterTemplate.jsx";
import useSecurity from "../hooks/useSecurity.js";

function Installments({enrollmentId = null, refresh = false, fetchEnrollment=null}) {
    console.log(enrollmentId);
    const [installments, setInstallments] = useState([]);
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const axios = useAxios();
    const security = useSecurity();
    const [notification, setNotification] = useState({message: '', type: ''});
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, installment: null});
    const [filters, setFilters] = useState({
        paymentMethodIds: {value: [], matchMode: FilterMatchMode.IN},
        paymentStatusIds: {value: [], matchMode: FilterMatchMode.IN},
        clientName: {value: null, matchMode: 'contains'},
        courseName: {value: null, matchMode: 'contains'},
        enrollmentId: {value: enrollmentId, matchMode: 'contains'},
        amount: {value: null, matchMode: 'contains'},
        dueDate: {value: null, matchMode: 'contains'},
        paymentDate: {value: null, matchMode: 'contains'},
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


    const fetchPaginatedInstallments = (paginationDetails = null) => {
        setLoading(true);
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedInstallments, {
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
            setInstallments(result);
            setLoading(false);
        }).catch(error => {
            setNotification({message: `Failed to fetch installments: ${error}`, type: 'error'});
            setLoading(false);
        });
    }

    const fetchPaymentMethodOptions = () => {
        axios.get(apiEndpoints.paymentMethods).then(response => {
            setPaymentMethodOptions(response.data.response);
        }).catch(error => setNotification({message: 'Failed to fetch payment method options ' + error, type: 'error'}));

    }
    const fetchPaymentStatusOptions = () => {
        axios.get(apiEndpoints.paymentStatuses).then(response => {
            setPaymentStatusOptions(response.data.response);
        }).catch(error => setNotification({
            message: 'Failed to fetch payment status options ' + error, type: 'error'
        }));
    }


    useEffect(() => {
        fetchPaginatedInstallments();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
    }, [refresh]);


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
            case 'paymentStatus':
                setEditingState({
                    ...editingState,
                    editedValue: paymentStatusOptions.find(option => option.status === e.target.value)
                });
                break;

        }

    }

    const onSubmitEdit = (id, columnField) => {
        const endpoint = apiEndpoints.getInstallmentUpdateEndpoint(id, columnField, editingState.editedValue.id);
        if (editingState.editedValue !== '' && (columnField === 'dueDate' || columnField === 'paymentDate')) {
            editingState.editedValue = new Date(editingState.editedValue).toISOString();
        }
        const payload = {[columnField]: editingState.editedValue};
        axios.patch(endpoint, payload).then(() => {
            fetchPaginatedInstallments();
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
            field: 'amount',
            header: 'Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'amount', editingState, handlers)
        },
        {
            field: 'dueDate',
            header: 'Payment Due Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                dueDate: simplifyDate(rowData.dueDate)
            }, 'dueDate', editingState, handlers)
        },
        {
            field: 'paymentDate',
            header: 'Payment Date',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate({
                ...rowData,
                paymentDate: simplifyDate(rowData.paymentDate)
            }, 'paymentDate', editingState, handlers)
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
                    ...filters,
                    paymentMethodIds: {value, matchMode: FilterMatchMode.IN},
                })
            }, paymentMethodOptions, 'method'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingState, paymentMethodOptions, dropDownCellHandlers)
        },
        {
            field: 'paymentStatus',
            header: 'Payment Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.paymentStatusIds.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    paymentStatusIds: {value, matchMode: FilterMatchMode.IN},
                })
            }, paymentStatusOptions, 'status'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentStatus', 'status', editingState, paymentStatusOptions, dropDownCellHandlers)
        }

    ]
    const onDeleteRow = (rowData) => {
        if (security.isAuthorizedToDelete())
            setConfirmDeleteDialog({visible: true, installment: rowData});
        else
            setNotification({message: 'You are not authorized to delete installments', type: 'error'});
    }
    const deleteInstallment = () => {
        axios.delete(apiEndpoints.getInstallmentDeleteEndpoint(confirmDeleteDialog.installment.id))
            .then(() => {
                fetchPaginatedInstallments();
                setNotification({message: 'Installment deleted successfully', type: 'success'});
                setConfirmDeleteDialog({visible: false, installment: null});
            }).catch(error => setNotification({message: `Failed to delete installment: ${error}`, type: 'error'}));
    }
    const cancelDeleteInstallment = () => {
        setConfirmDeleteDialog({visible: false, installment: null});
    }
    const onPage = (e) => {
        fetchPaginatedInstallments(
            {pageNumber: e.page + 1, pageSize: e.rows}
        );
    }

    return (
        <>
            <Table
                header={<h2>Installments</h2>}
                data={installments}
                columns={columns}
                onDeleteRow={onDeleteRow}
                downloadFileName={'installments'}
                setNotification={setNotification}
                onPage={onPage}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                fetchPaginatedItems={fetchPaginatedInstallments}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                paginatorLeftHandlers={{
                    fetchInstallments: fetchPaginatedInstallments,
                    fetchPaymentMethodOptions,
                    fetchPaymentStatusOptions
                }}
            ></Table>
            <ConfirmDialog
                visible={confirmDeleteDialog.visible}
                reject={cancelDeleteInstallment}
                accept={deleteInstallment}
                header={`Delete ${confirmDeleteDialog.installment ? confirmDeleteDialog.installment.amount : ''} installment`}
                message={`Are you sure you want to delete ${confirmDeleteDialog.installment ? confirmDeleteDialog.installment.amount : ''} installment?`}
            >
            </ConfirmDialog>
            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Installments;
