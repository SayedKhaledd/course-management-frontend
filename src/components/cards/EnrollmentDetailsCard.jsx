import React, {useState} from "react";
import apiEndpoints from "../../apiEndpoints.js";
import useAxios from "../../hooks/useAxios.js";
import HistoryDialog from "../HistoryDialog.jsx";
import CardDetails from "./CardDetails.jsx";
import TextFieldTemplate from "../../templates/TextFieldTemplate.jsx";
import DropDownFieldTemplate from "../../templates/DropDownFieldTemplate.jsx";
import {CURRENCIES, RATINGS, TRUE_FALSE_OPTIONS} from "../../constants.js";

const EnrollmentDetailsCard = ({
                                   enrollment,
                                   setEnrollment,
                                   paymentMethodOptions,
                                   paymentStatusOptions,
                                   referralSourceOptions,
                                   actionOptions,
                                   fetchEnrollment,
                                   notification,
                                   setNotification
                               }) => {
    const [editingState, setEditingState] = useState({columnField: null, editedValue: null});
    const axios = useAxios();
    const [historyVisible, setHistoryVisible] = useState(false);
    const [selectedField, setSelectedField] = useState('');
    const [history, setHistory] = useState([]);

    const handleInputChange = (value, field) => {
        setEditingState({...editingState, columnField: field, editedValue: value});
    };

    const handleSave = async (columnField) => {
        let endpoint;
        if (columnField === 'payInInstallments' || columnField === 'insideEgypt') {
            editingState.editedValue = editingState.editedValue === "Yes";
            endpoint = apiEndpoints.updateEnrollmentFieldBoolean(enrollment.id, columnField, editingState.editedValue);
        } else {
            endpoint = apiEndpoints.getEnrollmentUpdateEndpoint(enrollment.id, columnField, editingState.editedValue?.id);
        }
        const payload = {[columnField]: editingState.editedValue};
        await axios.patch(endpoint, payload).then(() => {
            fetchEnrollment();
            setEnrollment({...enrollment, [columnField]: editingState.editedValue});
            setEditingState({columnField: null, editedValue: null});
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});

        });
    };


    const showHistory = (field) => {
        axios.get(apiEndpoints.historyByEntityIdAndEntityTypeAndField(enrollment.id, 'Enrollment', field))
            .then(response => {
                setHistory(response.data.response)
                setSelectedField(field);
                setHistoryVisible(true);
            })
            .catch(error => setNotification({message: 'Failed to fetch history' + error, type: 'error'}));
    };

    const onChange = (e) => {
        setEditingState({...editingState, editedValue: e.target.value});
    }
    const onDropDownChange = (e, columnField) => {
        switch (columnField) {
            case 'referralSource':
                setEditingState({
                    ...editingState,
                    editedValue: referralSourceOptions.find(option => option.source === e.target.value)
                });
                break;
            case 'paymentMethod':
                setEditingState({
                    ...editingState,
                    editedValue: paymentMethodOptions.find(option => option.status === e.target.value)
                });
                break;
            case 'paymentStatus':
                setEditingState({
                    ...editingState,
                    editedValue: paymentStatusOptions.find(option => option.source === e.target.value)
                });
                break;
            case 'actionTaken':
                setEditingState({
                    ...editingState,
                    editedValue: actionOptions.find(option => option.source === e.target.value)
                });
                break;
            case 'insideEgypt':
                setEditingState({
                    ...editingState,
                    editedValue: e.target.value
                });
                break;
            case 'payInInstallments':
                setEditingState({
                    ...editingState,
                    editedValue: e.target.value
                });
                break;

            case 'currency':
                setEditingState({
                    ...editingState,
                    editedValue: e.target.value
                });
                break;

            case 'rating':
                setEditingState({
                    ...editingState,
                    editedValue: e.target.value
                });
                break;

        }
    };
    const onCancelEdit = () => {
        setEditingState({columnField: null, editedValue: null});
    }

    const cellHandlers = {
        onEdit: handleInputChange, onSubmitEdit: handleSave, onShowHistory: showHistory,
        onCancelEdit: onCancelEdit, onChange: onChange
    };
    const dropDownCellHandlers = {
        onEdit: handleInputChange, onSubmitEdit: handleSave, onShowHistory: showHistory,
        onCancelEdit: onCancelEdit, onOptionChange: onDropDownChange

    }

    const columns = [
        {
            field: 'course',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.course.name}
                    field="course"
                    editingState={editingState}
                    handlers={cellHandlers}
                    isEditable={false}
                />
            )
        },
        {
            field: 'amountPaid',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.amountPaid}
                    field="amountPaid"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'remainingAmount',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.remainingAmount}
                    field="remainingAmount"
                    editingState={editingState}
                    handlers={cellHandlers}
                    isEditable={false}
                />
            )
        },
        {
            field: 'totalAmount',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.totalAmount}
                    field="totalAmount"
                    editingState={editingState}
                    handlers={cellHandlers}
                    isEditable={false}
                />
            )
        },

        {
            field: 'payInInstallments',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.payInInstallments}
                    field="payInInstallments"
                    listFieldName={null}
                    editingState={editingState}
                    listOptions={TRUE_FALSE_OPTIONS}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        {
            field: 'discount',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.discount}
                    field="discount"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },

        {
            field: 'currency',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.currency}
                    field="currency"
                    listFieldName={null}
                    editingState={editingState}
                    listOptions={CURRENCIES}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        {
            field: 'paymentMethod',
            listFieldName: 'method',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.paymentMethod}
                    field="paymentMethod"
                    listFieldName="method"
                    editingState={editingState}
                    listOptions={paymentMethodOptions}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        {
            field: 'paymentStatus',
            listFieldName: 'status',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.paymentStatus}
                    field="paymentStatus"
                    listFieldName="status"
                    editingState={editingState}
                    listOptions={paymentStatusOptions}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        {
            field: 'actionTaken',
            listFieldName: 'action',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.actionTaken}
                    field="actionTaken"
                    listFieldName="action"
                    editingState={editingState}
                    listOptions={actionOptions}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        {
            field: 'referralSource',
            listFieldName: 'source',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.referralSource}
                    field="referralSource"
                    listFieldName="source"
                    editingState={editingState}
                    listOptions={referralSourceOptions}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        {
            field: 'review',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.review}
                    field="review"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'rating',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.rating}
                    field="rating"
                    listFieldName={null}
                    editingState={editingState}
                    listOptions={RATINGS}
                    handlers={dropDownCellHandlers}
                />)
        },
        {
            field: 'description',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.description}
                    field="description"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },

        {
            field: 'isInsideEgypt',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.isInsideEgypt}
                    field="isInsideEgypt"
                    listFieldName={null}
                    editingState={editingState}
                    listOptions={TRUE_FALSE_OPTIONS}
                    handlers={dropDownCellHandlers}
                />)
        }


    ]


    if (!enrollment) return null;

    return (
        <>
            <CardDetails header="Enrollment Details" data={enrollment} columns={columns}
                         notification={notification}

            />
            <HistoryDialog
                visible={historyVisible}
                setVisible={setHistoryVisible}
                history={history}
                selectedField={selectedField}/>


        </>);
}
export default EnrollmentDetailsCard;