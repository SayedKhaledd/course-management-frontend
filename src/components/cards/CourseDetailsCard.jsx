import HistoryDialog from "../HistoryDialog.jsx";
import React, {useState} from "react";
import useAxios from "../../hooks/useAxios.js";
import apiEndpoints from "../../apiEndpoints.js";
import TextFieldTemplate from "../../templates/TextFieldTemplate.jsx";
import DropDownFieldTemplate from "../../templates/DropDownFieldTemplate.jsx";
import CardDetails from "./CardDetails.jsx";
import {simplifyDate} from "../../utils.js";

const CourseDetailsCard = ({course, setCourse, fetchCourse, courseStatusOptions, notification, setNotification}) => {
    const axios = useAxios();
    const [editingState, setEditingState] = useState({columnField: null, editedValue: null});
    const [historyVisible, setHistoryVisible] = useState(false);
    const [selectedField, setSelectedField] = useState('');
    const [history, setHistory] = useState([]);


    const handleInputChange = (value, field) => {
        setEditingState({...editingState, columnField: field, editedValue: value});
    };

    const handleSave = async (columnField) => {
        const endpoint = apiEndpoints.getCourseUpdateEndpoint(course.id, columnField, editingState.editedValue?.id);
        const payload = {[columnField]: editingState.editedValue};
        await axios.patch(endpoint, payload).then(() => {
            fetchCourse();
            setCourse({...course, [columnField]: editingState.editedValue});
            setEditingState({columnField: null, editedValue: null});
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});

        });
    };


    const showHistory = (field) => {
        axios.get(apiEndpoints.historyByEntityIdAndEntityTypeAndField(course.id, 'Course', field))
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
            case 'courseStatus':
                setEditingState({
                    ...editingState,
                    editedValue: courseStatusOptions.find(option => option.status === e.target.value)
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
            field: 'code',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.code}
                    field="code"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
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
            field: 'part',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.part}
                    field="part"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'price',
            body: (rowData) => (
                <TextFieldTemplate
                    value={rowData.price}
                    field="price"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'courseStatus',
            body: (rowData) => (
                <DropDownFieldTemplate
                    value={rowData.courseStatus}
                    field="courseStatus"
                    listFieldName="status"
                    editingState={editingState}
                    listOptions={courseStatusOptions}
                    handlers={dropDownCellHandlers}
                />
            )
        },
        {
            field: 'startDate',
            body: (rowData) => (
                <TextFieldTemplate
                    value={simplifyDate(rowData.startDate)}
                    field="startDate"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },
        {
            field: 'endDate',
            body: (rowData) => (
                <TextFieldTemplate
                    value={simplifyDate(rowData.endDate)}
                    field="endDate"
                    editingState={editingState}
                    handlers={cellHandlers}
                />
            )
        },


    ]


    return (
        <>
            <CardDetails
                header={'Course Details'}
                data={course}
                columns={columns}
                notification={notification}
            ></CardDetails>

            <HistoryDialog
                visible={historyVisible}
                setVisible={setHistoryVisible}
                history={history}
                selectedField={selectedField}/>


        </>
    );
}
export default CourseDetailsCard;