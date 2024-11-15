import {getCriteria, getCustomSorting, simplifyDate} from "../utils.js";
import DropDownCellTemplate from "../templates/DropDownCellTemplate.jsx";
import CellTemplate from "../templates/CellTemplate.jsx";
import {CURRENCIES, RATINGS, TRUE_FALSE_OPTIONS} from "../constants.js";
import apiEndpoints from "../apiEndpoints.js";
import useAxios from "../hooks/useAxios.js";
import React, {useEffect, useState} from "react";
import {ConfirmDialog} from "primereact/confirmdialog";
import Table from "./Table.jsx";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import {Card} from "primereact/card";
import {Dropdown} from "primereact/dropdown";
import {FilterMatchMode} from "primereact/api";
import staticListRowFilterTemplate from "../templates/StaticListRowFilterTemplate.jsx";
import DynamicListRowFilterTemplate from "../templates/DynamicListRowFilterTemplate.jsx";
import {InputText} from "primereact/inputtext";
import {useNavigate} from "react-router-dom";
import useSecurity from "../hooks/useSecurity.js";

const Enrollment = ({
                        client, fetchClient, course, fetchCourse, setNotification,
                        referralSourceOptions
                    }) => {
    const axios = useAxios();
    const navigate = useNavigate();
    const security = useSecurity();
    const [enrollments, setEnrollments] = useState([]);
    const [editingEnrollmentState, setEditingEnrollmentState] = useState({
        id: '',
        columnField: '',
        editedValue: null
    });
    const [coursesOptions, setCoursesOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
    const [paymentStatusOptions, setPaymentStatusOptions] = useState([]);
    const [actionOptions, setActionOptions] = useState([]);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({visible: false, enrollment: null});
    const [dialogState, setDialogState] = useState({visible: false, newEnrollment: {}});
    const [filters, setFilters] = useState({
        clientId: {value: client ? client.id : null, matchMode: 'contains'},
        courseId: {value: course ? course.id : null, matchMode: 'contains'},
        paymentMethodIds: {value: [], matchMode: FilterMatchMode.IN},
        paymentStatusIds: {value: [], matchMode: FilterMatchMode.IN},
        referralSourceIds: {value: [], matchMode: FilterMatchMode.IN},
        actionTakenIds: {value: [], matchMode: FilterMatchMode.IN},
        currencies: {value: [], matchMode: FilterMatchMode.IN},
        ratings: {value: [], matchMode: FilterMatchMode.IN},
        insideEgypt: {value: [], matchMode: FilterMatchMode.IN},
        payInInstallments: {value: [], matchMode: FilterMatchMode.IN},
        review: {value: null, matchMode: 'contains'},
        discount: {value: null, matchMode: 'contains'},
        description: {value: null, matchMode: 'contains'},
        clientName: {value: null, matchMode: 'contains'},
        courseName: {value: null, matchMode: 'contains'},
        amountPaid: {value: null, matchMode: 'contains'},
        remainingAmount: {value: null, matchMode: 'contains'},
        totalAmount: {value: null, matchMode: 'contains'},
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


    const fetchPaginatedEnrollments = (paginationDetails = null) => {
        setLoading(true);
        const criteria = getCriteria(filters);
        const customSorting = getCustomSorting(sorting);
        const customPagination = paginationDetails || pagination;
        axios.post(apiEndpoints.getPaginatedEnrollments, {
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
            setEnrollments(result);
            setLoading(false);
        }).catch(error => {
            setNotification({message: `Failed to fetch enrollments: ${error}`, type: 'error'});
            setLoading(false);
        });


    };
    const fetchCourseOptions = () => {
        axios.get(apiEndpoints.courses)
            .then(response => {
                setCoursesOptions(response.data.response.map(course => ({name: course.name, id: course.id})));
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


    useEffect(() => {
        if (!course && !fetchCourse) {
            if (!client) {
                fetchClient();
            }
            fetchCourseOptions();

        } else if (!client && !fetchClient) {
            if (!course) {
                fetchCourse();
            }
        }
        fetchPaginatedEnrollments();
        fetchPaymentMethodOptions();
        fetchPaymentStatusOptions();
        fetchActionOptions();
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
            fetchPaginatedEnrollments();
            onCancelEdit();
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});

        }).catch(error =>
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'})
        );

    };
    const onDropDownChange = (e, columnField) => {
        switch (columnField) {
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
        if (security.isAuthorizedToDelete())
            setConfirmDeleteDialog({visible: true, enrollment: rowData});
        else
            setNotification({message: 'You are not authorized to delete this enrollment', type: 'error'});
    }
    const deleteEnrollment = () => {
        axios.delete(apiEndpoints.getEnrollmentDeleteEndpoint(confirmDeleteDialog.enrollment.id))
            .then(() => {
                fetchPaginatedEnrollments();
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
        ...(client ? [{
            field: 'course',
            header: 'Course',
            filter: true,
            listFieldName: 'name',
            sortable: true,
            filterField: 'courseName',
            body: (rowData) => DropDownCellTemplate(rowData, 'course', 'name', editingEnrollmentState, coursesOptions, dropDownCellHandlers, null, false)
        }] : []),

        ...(course ? [{
            field: 'client',
            header: 'Client',
            filter: true,
            listFieldName: 'name',
            sortable: true,
            filterField: 'clientName',
            body: (rowData) => DropDownCellTemplate(rowData, 'client', 'name', editingEnrollmentState, null, dropDownCellHandlers, null, false)
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
            filterElement: staticListRowFilterTemplate({
                value: filters.payInInstallments.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    payInInstallments: {value, matchMode: FilterMatchMode.IN},
                }),
            }, TRUE_FALSE_OPTIONS, true),
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
            filterElement: staticListRowFilterTemplate({
                value: filters.currencies.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    currencies: {value, matchMode: FilterMatchMode.IN},
                }),
            }, CURRENCIES),
            body: (rowData) => DropDownCellTemplate(rowData, 'currency', null, editingEnrollmentState, CURRENCIES, dropDownCellHandlers)
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
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentMethod', 'method', editingEnrollmentState, paymentMethodOptions, dropDownCellHandlers)
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
            body: (rowData) => DropDownCellTemplate(rowData, 'paymentStatus', 'status', editingEnrollmentState, paymentStatusOptions, dropDownCellHandlers)
        },
        {
            field: 'actionTaken',
            header: 'Action Taken',
            listFieldName: 'action',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.actionTakenIds.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    actionTakenIds: {value, matchMode: FilterMatchMode.IN},
                })
            }, actionOptions, 'action'),
            body: (rowData) => DropDownCellTemplate(rowData, 'actionTaken', 'action', editingEnrollmentState, actionOptions, dropDownCellHandlers)
        },
        {
            field: 'referralSource',
            header: 'Referral Source',
            listFieldName: 'source',
            filter: true,
            sortable: true,
            filterElement: DynamicListRowFilterTemplate({
                value: filters.referralSourceIds.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    referralSourceIds: {value, matchMode: FilterMatchMode.IN},
                })
            }, referralSourceOptions, 'source'),
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
            filterElement: staticListRowFilterTemplate({
                value: filters.ratings.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    ratings: {value, matchMode: FilterMatchMode.IN},
                })
            }, RATINGS),
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
            filterElement: staticListRowFilterTemplate({
                value: filters.insideEgypt.value,
                filterApplyCallback: (value) => setFilters({
                    ...filters,
                    insideEgypt: {value, matchMode: FilterMatchMode.IN},
                })
            }, TRUE_FALSE_OPTIONS, true),
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

    const onCourseChange = (e, field, listFieldName, listOptions) => {
        setDialogState({
            ...dialogState,
            newEnrollment: {
                ...dialogState.newEnrollment,
                [field+'Id']: listOptions.find(course => course[listFieldName] === e.target.value).id,
                [field]: listOptions.find(course => course[listFieldName] === e.target.value)
            }
        });
    }

    const onFieldChange = (e, field) => {
        setDialogState({
            ...dialogState,
            newEnrollment: {
                ...dialogState.newEnrollment,
                [field]: e.target.value
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
            ...dialogState.newEnrollment,
            clientId: Number(client ? client.id : dialogState.newEnrollment.clientId),
            courseId: Number(client ? dialogState.newEnrollment.courseId : course.id),

        }).then(response => {
            setNotification({message: 'Enrollment created successfully', type: 'success'});
            fetchPaginatedEnrollments();
            closeDialog();
        }).catch(error => {
            setNotification({message: 'Failed to create enrollment' + error, type: 'error'});
        });
    };

    const onPage = (e) => {
        fetchPaginatedEnrollments(
            {pageNumber: e.page + 1, pageSize: e.rows}
        );
    }

    if (!client && !course) return null;
    const onRowClick = (enrollment) => {
        navigate(`/client/${enrollment.client.id}/course/${enrollment.course.id}`);
    };

    return (
        <>
            <Table
                header={'Enrollments'}
                onRowClick={onRowClick}
                data={enrollments} columns={columns} paginatorLeftHandlers={fetchPaginatedEnrollments}
                downloadFileName={'enrollments'}
                setNotification={setNotification}
                onPage={onPage}
                paginationParams={pagination}
                setPaginationParams={setPagination}
                fetchPaginatedItems={fetchPaginatedEnrollments}
                sorting={sorting}
                setSorting={setSorting}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                onDeleteRow={onDeleteRow}

            ></Table>
            {client ?
                <Button
                    icon="pi pi-plus"
                    className="p-button-rounded p-button-primary"
                    style={{position: 'fixed', marginTop: '20px', bottom: '16px', right: '16px', zIndex: 1000}}
                    onClick={openDialog}
                    label="New Enrollment"
                /> : null
            }

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
                            <div className="p-field">
                                <label htmlFor="course">Course Name</label>
                                <Dropdown id="course"
                                          value={dialogState.newEnrollment?.course?.name}
                                          options={coursesOptions.map(course => course.name)}
                                          placeholder="Select a course"
                                          onChange={(e) => {
                                              onCourseChange(e, 'course', 'name', coursesOptions);
                                          }}
                                />
                            </div>

                            <div className="p-field">
                                <label htmlFor="curreny">currency</label>
                                <Dropdown id="currency"
                                          value={dialogState.newEnrollment?.currency}
                                          options={CURRENCIES}
                                          placeholder="Select a currency"
                                          onChange={(e) => {
                                              onFieldChange(e, 'currency');
                                          }}
                                />
                            </div>

                            <div className="p-field">
                                <label htmlFor="paymentMethod">Payment method</label>
                                <Dropdown id="paymentMethod"
                                          value={dialogState.newEnrollment?.paymentMethod?.method}
                                          options={paymentMethodOptions.map(paymentMethod => paymentMethod.method)}
                                          placeholder="Select a Payment Method"
                                          onChange={(e) => {
                                              onCourseChange(e, 'paymentMethod', 'method', paymentMethodOptions);
                                          }}
                                />
                            </div>

                            <div className="p-field">
                                <label htmlFor="totalAmount">total amount</label>
                                <InputText id="totalAmount"
                                           value={dialogState.newEnrollment?.totalAmount}
                                           onChange={(e) => {
                                               onFieldChange(e, 'totalAmount');
                                           }}
                                />
                            </div>
                            <div className="p-field">
                                <label htmlFor="amountPaid">Amount Paid</label>
                                <InputText id="amountPaid"
                                           value={dialogState.newEnrollment?.amountPaid}
                                           onChange={(e) => {
                                               onFieldChange(e, 'amountPaid');
                                           }}
                                />
                            </div>


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

        </>

    );
}
export default Enrollment;