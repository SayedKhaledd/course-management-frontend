import React, {useState} from "react";
import apiEndpoints from "../../apiEndpoints.js";
import useAxios from "../../hooks/useAxios.js";
import HistoryDialog from "../HistoryDialog.jsx";
import CardDetails from "./CardDetails.jsx";
import TextFieldTemplate from "../../templates/TextFieldTemplate.jsx";
import DropDownFieldTemplate from "../../templates/DropDownFieldTemplate.jsx";
import {COUNTRIES, NATIONALITIES} from "../../constants.js";

const ClientDetailsCard = ({
                               client,
                               setClient,
                               clientStatusOptions,
                               referralSourceOptions,
                               initialCourseOptions,
                               fetchClient,
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
        const endpoint = apiEndpoints.getClientUpdateEndpoint(client.id, columnField, editingState.editedValue?.id);
        const payload = {[columnField]: editingState.editedValue};
        await axios.patch(endpoint, payload).then(() => {
            fetchClient();
            setClient({...client, [columnField]: editingState.editedValue});
            setEditingState({columnField: null, editedValue: null});
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});

        });
    };


    const showHistory = (field) => {
        axios.get(apiEndpoints.historyByEntityIdAndEntityTypeAndField(client.id, 'Client', field))
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
            case 'clientStatus':
                setEditingState({
                    ...editingState,
                    editedValue: clientStatusOptions.find(option => option.status === e.target.value)
                });
                break;
            case 'referralSource':
                setEditingState({
                    ...editingState,
                    editedValue: referralSourceOptions.find(option => option.source === e.target.value)
                });
                break;
            case 'initialCourse':
                setEditingState({
                    ...editingState,
                    editedValue: initialCourseOptions.find(option => option.name === e.target.value)
                });
                break;
            case 'country':
                setEditingState({
                    ...editingState,
                    editedValue: COUNTRIES.find(option => option === e.target.value)
                });
                break;
            case 'nationality':
                setEditingState({
                    ...editingState,
                    editedValue: NATIONALITIES.find(option => option === e.target.value)
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
            field: 'name',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.name}
                    field="name"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'email',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.email}
                    field="email"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'phone',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.phone}
                    field="phone"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'alternativePhone',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.alternativePhone}
                    field="alternativePhone"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        //address
        {
            field: 'address',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.address}
                    field="address"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
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
            field: 'clientStatus',
            listFieldName: 'status',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.clientStatus}
                    field="clientStatus"
                    listFieldName="status"
                    editingState={editingState}
                    listOptions={clientStatusOptions}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        //country
        {
            field: 'country',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.country}
                    field="country"
                    listFieldName={null}
                    editingState={editingState}
                    listOptions={COUNTRIES}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        //nationality, initialCourseName, referralSource
        {
            field: 'nationality',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.nationality}
                    field="nationality"
                    listFieldName={null}
                    editingState={editingState}
                    listOptions={NATIONALITIES}
                    handlers={dropDownCellHandlers}
                />)
        },

        {
            field: 'initialCourse',
            listFieldName: 'name',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.initialCourse}
                    field="initialCourse"
                    listFieldName="name"
                    editingState={editingState}
                    listOptions={initialCourseOptions}
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
        }


    ]


    if (!client) return null;

    return (
        <>
            <CardDetails header="Client Details" data={client} columns={columns}
                         notification={notification}

            />
            <HistoryDialog
                visible={historyVisible}
                setVisible={setHistoryVisible}
                history={history}
                selectedField={selectedField}/>


        </>);
}
export default ClientDetailsCard;