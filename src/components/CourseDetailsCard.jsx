import {Card} from "primereact/card";
import {Avatar} from "primereact/avatar";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import HistoryDialog from "./HistoryDialog.jsx";
import React, {useEffect, useState} from "react";
import useAxios from "../hooks/useAxios.js";
import {useParams} from "react-router-dom";
import apiEndpoints from "../apiEndpoints.js";
import Notification from "./Notification.jsx";

const CourseDetailsCard = ({}) => {
    const [course, setCourse] = useState({});
    const axios = useAxios();
    const {id} = useParams();

    const [historyVisible, setHistoryVisible] = useState(false);
    const [selectedField, setSelectedField] = useState('');
    const [history, setHistory] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});

    const fetchCourse = () => {
        axios.get(apiEndpoints.course(id))
            .then(response => setCourse(response.data.response))
            .catch(error => setNotification({message: 'Failed to fetch course ' + error, type: 'error'}));
    }

    useEffect(() => {
        fetchCourse();
    }, []);

    const handleInputChange = (e, field) => {
        setCourse({...course, [field]: e.target.value});
    };
    const handleSave = async (columnField) => {
        const endpoint = apiEndpoints.getCourseUpdateEndpoint(id, columnField, course[columnField]?.id);
        const payload = {[columnField]: course[columnField]};
        await axios.patch(endpoint, payload).then(() => {
            fetchCourse();
            setCourse({...course, [columnField]: course[columnField]});
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});

        });
    };
    const showHistory = (field) => {
        setSelectedField(field);
        axios.get(apiEndpoints.courseHistoryByCourseIdAndField(course.id, field))
            .then(response => {
                setHistory(response.data.response);
                setHistoryVisible(true);
            })
            .catch(error => setNotification({message: 'Failed to fetch history ' + error, type: 'error'}));
    };


    return (
        <>
            <Card className="p-m-4" title="Course Details">
                <div className="p-d-flex p-ai-center p-mb-3">
                    <Avatar label="JD" className="p-mr-3" size="large" shape="circle"/>
                    <h2>{course.name}</h2>
                </div>
                <div className="p-fluid">
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="name" className="p-mr-2">Name</label>
                        <InputText
                            id="name"
                            value={course.name || ''}
                            onChange={(e) => handleInputChange(e, 'name')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('name')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('name')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* part Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="part" className="p-mr-2">Part</label>
                        <InputText
                            id="part"
                            value={course.part || ''}
                            onChange={(e) => handleInputChange(e, 'part')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('part')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('part')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* code Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="code" className="p-mr-2">Code</label>
                        <InputText
                            id="phone"
                            value={course.code || ''}
                            onChange={(e) => handleInputChange(e, 'code')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('code')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('code')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>
                    {/* price Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="code" className="p-mr-2">Price</label>
                        <InputText
                            id="phone"
                            value={course.price || ''}
                            onChange={(e) => handleInputChange(e, 'price')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('price')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('price')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>
                    {/* Start Date Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="startDate" className="p-mr-2">Start Date</label>
                        <InputText
                            id="startDate"
                            value={course.startDate || ''}
                            onChange={(e) => handleInputChange(e, 'startDate')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('startDate')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('startDate')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* End Date Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="country" className="p-mr-2">End Date</label>
                        <InputText
                            id="alternative-phone"
                            value={course.endDate || ''}
                            onChange={(e) => handleInputChange(e, 'endDate')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('endDate')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('endDate')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>
                </div>

                {/* History Dialog */}
                <HistoryDialog
                    visible={historyVisible}
                    setVisible={setHistoryVisible}
                    history={history}
                    field={selectedField}/>
            </Card>

            <Notification status={notification.type} message={notification.message}/>

        </>
    );
}
export default CourseDetailsCard;