import React, {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
import 'primeicons/primeicons.css';
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import {CURRENCIES, PAYMENT_OR_REFUND_TYPES, TRUE_FALSE_OPTIONS} from "../constants.js";
import {getCriteria, getCustomSorting, simplifyDate} from "../utils.js";
import {FilterMatchMode} from "primereact/api";
import CellTemplate from "../templates/CellTemplate.jsx";
import DynamicListRowFilterTemplate from "../templates/DynamicListRowFilterTemplate.jsx";
import staticListRowFilterTemplate from "../templates/StaticListRowFilterTemplate.jsx";
import Table from "../components/Table.jsx";

function Sales() {
    const [sales, setSales] = useState([]);
    const [editingState, setEditingState] = useState({id: '', columnField: '', editedValue: null});
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [refundStatusOptions, setRefundStatusOptions] = useState([]);
    const [mergedOptions, setMergedOptions] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);
    const axios = useAxios();
    const [notification, setNotification] = useState({message: '', type: ''});
    const initialFilters = JSON.parse(sessionStorage.getItem('salesFilters')) || {
        clientId: {value: null, matchMode: 'contains'},
        courseCode: {value: null, matchMode: 'contains'},
        clientName: {value: null, matchMode: 'contains'},
        amount: {value: null, matchMode: 'contains'},
        currencies: {value: [], matchMode: 'contains'},
        paymentMethodIds: {value: [], matchMode: FilterMatchMode.IN},
        paymentStatusIds: {value: [], matchMode: FilterMatchMode.IN},
        paymentTypes: {value: [], matchMode: FilterMatchMode.IN},
        courseIds: {value: [], matchMode: FilterMatchMode.IN},
        insideEgypt: {value: [], matchMode: FilterMatchMode.IN},
        isReceived: {value: [], matchMode: FilterMatchMode.IN},
        createdBy: {value: null, matchMode: 'contains'},
        modifiedBy: {value: null, matchMode: 'contains'},
        createdDate: {value: null, matchMode: 'contains'},
        modifiedDate: {value: null, matchMode: 'contains'},
    };

    const [filters, setFilters] = useState(initialFilters);

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
        totalNumberOfElements: 0,
    });

    const initialSorting = JSON.parse(sessionStorage.getItem('salesSorting')) || {
        sortBy: "clientId",
        sortDesc: false,
        defaultSortField: "clientId",
    }
    const [sorting, setSorting] = useState(initialSorting);
    const [loading, setLoading] = useState(true);


    const fetchPaginatedItems = (paginationDetails = null) => {
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedSales, {
            ...customPagination,
            ...customSorting,
            criteria,
        })
            .then(response => {
                const {pageNumber, pageSize, totalNumberOfElements, result} = response.data.response;
                setPagination(prev => ({
                    ...prev,
                    pageNumber,
                    pageSize,
                    totalNumberOfElements,
                }));
                setSales(result);
                setLoading(false);
            })
            .catch(error => {
                setNotification({message: `Failed to fetch sales: ${error}`, type: 'error'});
                setLoading(false);
            });

    };
    const fetchPaymentMethodOptions = () => {
        axios.get(apiEndpoints.paymentMethods)
            .then(response => {
                setPaymentMethodOptions(response.data.response);
            })
            .catch(error => {
                setNotification({message: `Failed to fetch payment method options: ${error}`, type: 'error'});
            });
    }

    const fetchPaymentStatusOptions = () => {
        axios.get(apiEndpoints.paymentStatuses)
            .then(response => {
                setPaymentStatusOptions(response.data.response);
            })
            .catch(error => {
                setNotification({message: `Failed to fetch payment status options: ${error}`, type: 'error'});
            });
    }

    const fetchRefundStatusOptions = () => {
        axios.get(apiEndpoints.refundStatuses)
            .then(response => {
                setRefundStatusOptions(response.data.response);
            })
            .catch(error => {
                setNotification({message: `Failed to fetch refund status options: ${error}`, type: 'error'});
            });
    }

    const fetchCourseOptions = () => {
        axios.get(apiEndpoints.courses)
            .then(response => {
                setCourseOptions(response.data.response);
            })
            .catch(error => {
                setNotification({message: `Failed to fetch course options: ${error}`, type: 'error'});
            });
    }

    useEffect(() => {
        sessionStorage.setItem('salesFilters', JSON.stringify(filters));
        sessionStorage.setItem('salesSorting', JSON.stringify(sorting));
    }, [filters, sorting]);

    useEffect(() => {
        fetchPaginatedItems();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
        fetchRefundStatusOptions();
        fetchCourseOptions();
    }, []);

    useEffect(() => {
        const mergedOptions = [
            ...paymentStatusOptions.map((option) => ({
                ...option,
                id: option.id,
                source: 'PAYMENT_STATUS',
            })),
            ...refundStatusOptions.map((option) => ({
                ...option,
                id: option.id,
                source: 'REFUND_STATUS',
            })),
        ];
        setMergedOptions(mergedOptions);
    }, [paymentStatusOptions, refundStatusOptions]);


    const onEdit = (id, columnField, editedValue) => {
        setEditingState({id, columnField, editedValue});
    };
    const onCancelEdit = () => {
        setEditingState({id: '', columnField: '', editedValue: null});
    };
    const onCellChange = (e) => {
        setEditingState({...editingState, editedValue: e.target.value});
    };

    const onSubmitEdit = async (salesId, columnField) => {
        let currentSale = sales.filter(sale => sale.id === salesId)[0];
        const endpoint = apiEndpoints.getSalesUpdateEndpoint(currentSale.entityId, columnField, currentSale.type, editingState.editedValue);
        axios.patch(endpoint).then(() => {
            fetchPaginatedItems();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error =>
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'})
        );

    };
    const onDropDownChange = (e, columnField) => {
        switch (columnField) {
            case 'paymentStatus':
                setEditingState({
                    ...editingState,
                    editedValue: sales.filter(sale => sale.id === editingState.id)[0].type === "REFUND" ? refundStatusOptions.find(option => option.status === e.value)
                        : paymentStatusOptions.find(option => option.status === e.value)
                });
                break;
            case 'isReceived':
                setEditingState({
                    ...editingState,
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
    }

    const columns = [
        {
            field: 'clientId',
            header: 'Client Id',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'clientId', editingState, cellHandlers, false)
        }, {
            field: 'client',
            header: 'Client Name',
            listFieldName: 'name',
            filter: true,
            sortable: true,
            filterField: 'clientName',
            body: (rowData) => DropDownCellTemplate(rowData, 'client', 'name', editingState, null, cellHandlers, null, false)
        },
        {
            field: 'course',
            header: 'Course Code',
            listFieldName: 'code',
            filter: true,
            sortable: true,
            filterField: 'courseCode',
            body: (rowData) => DropDownCellTemplate(rowData, 'course', 'code', editingState, null, cellHandlers, null, false)
        },
        {
            field: 'course',
            header: 'Course Name',
            listFieldName: 'name',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.courseIds.value,
                filterApplyCallback: (value) => {
                    setFilters({
                        ...filters,
                        courseIds: {value, matchMode: FilterMatchMode.IN},
                    })
                },
            }, courseOptions, 'name'),
            body: (rowData) => DropDownCellTemplate(rowData, 'course', 'name', editingState, null, cellHandlers, null, false)
        },
        {
            field: 'type',
            header: 'Payment/Refund Type',
            filter: true,
            sortable: true,
            filterElement: staticListRowFilterTemplate({
                value: filters.paymentTypes.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    paymentTypes: {value, matchMode: FilterMatchMode.IN},
                }),
            }, PAYMENT_OR_REFUND_TYPES),
            body: (rowData) => DropDownCellTemplate(rowData, 'type', null, editingState, PAYMENT_OR_REFUND_TYPES, cellHandlers, null, false)
        },
        {
            field: 'amount',
            header: 'Amount',
            filter: true,
            sortable: true,
            body: (rowData) => CellTemplate(rowData, 'amount', editingState, cellHandlers, false)
        },

        {
            field: 'paymentMethod',
            header: 'Payment Method',
            listFieldName: 'method',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.paymentMethodIds.value,
                filterApplyCallback: (value) => {
                    setFilters({
                        ...filters,
                        paymentMethodIds: {value, matchMode: FilterMatchMode.IN},
                    })
                },
            }, paymentMethodOptions, 'method'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingState, paymentMethodOptions, cellHandlers, null, false)
        },
        {
            field: 'paymentStatus',
            header: 'Payment Status',
            listFieldName: 'status',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.paymentStatusIds.value,
                filterApplyCallback: (value) => {
                    setFilters({
                        ...filters,
                        paymentStatusIds: {
                            value: value
                            , matchMode: FilterMatchMode.IN
                        },
                    });
                },
            }, mergedOptions, 'status'),
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentStatus', 'status', editingState, rowData.type === "REFUND" ? refundStatusOptions : paymentStatusOptions, dropDownCellHandlers, null, true, rowData.entityId)
        },
        {
            field: 'insideEgypt',
            header: 'Is Inside Egypt?',
            filter: true,
            sortable: true,
            filterElement: staticListRowFilterTemplate({
                value: filters.insideEgypt.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    insideEgypt: {value, matchMode: FilterMatchMode.IN},
                }),
            }, TRUE_FALSE_OPTIONS, true),

            body: (rowData) => DropDownCellTemplate(rowData, 'insideEgypt', null, editingState, TRUE_FALSE_OPTIONS, dropDownCellHandlers, null, false)
        },
        {
            field: 'isReceived',
            header: 'Is Received',
            filter: true,
            sortable: true,
            filterElement: staticListRowFilterTemplate({
                value: filters.isReceived.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    isReceived: {value, matchMode: FilterMatchMode.IN},
                }),
            }, TRUE_FALSE_OPTIONS, true),

            body: (rowData) => DropDownCellTemplate(rowData, 'isReceived', null, editingState, TRUE_FALSE_OPTIONS, dropDownCellHandlers, null, true)
        },
        {
            field: 'currency',
            header: 'Currency',
            filter: true,
            sortable: true,
            filterElement: staticListRowFilterTemplate({
                value: filters.currencies.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    currencies: {value, matchMode: FilterMatchMode.IN},
                }),
            }, CURRENCIES),

            body: (rowData) => DropDownCellTemplate(rowData, 'currency', null, editingState, CURRENCIES, dropDownCellHandlers, null, false)
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
    ];

    const onPage = (e) => {
        fetchPaginatedItems({pageNumber: e.page + 1, pageSize: e.rows});
    }


    return (<>
            <Table
                header={<h2>Sales</h2>}
                columns={columns} data={sales}
                setNotification={setNotification}
                paginatorLeftHandlers={{
                    fetchPaginatedItems,
                    fetchPaymentMethodOptions,
                    fetchPaymentStatusOptions,
                    fetchRefundStatusOptions,
                    fetchCourseOptions
                }}
                onPage={onPage}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                fetchPaginatedItems={fetchPaginatedItems}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                downloadFileName="sales"

            ></Table>
            <Notification status={notification.type} message={notification.message}/>
        </>
    );
}

export default Sales;
