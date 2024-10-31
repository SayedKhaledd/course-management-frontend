import React, {useEffect, useState} from "react";
import apiEndpoints from "../apiEndpoints.js";
import useAxios from "../hooks/useAxios.js";
import {Card} from "primereact/card";
import {Avatar} from "primereact/avatar";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import HistoryDialog from "./HistoryDialog.jsx";
import Notification from "./Notification.jsx";
import {useParams} from "react-router-dom";

const ClientDetailsCard = ({}) => {
    const [client, setClient] = useState({});
    const axios = useAxios();
    const {id} = useParams();

    const [historyVisible, setHistoryVisible] = useState(false);
    const [selectedField, setSelectedField] = useState('');
    const [history, setHistory] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});


    const fetchClient = () => {
        console.log("fetching client", id);
        axios.get(apiEndpoints.client(id))
            .then(response => setClient(response.data.response))
            .catch(error => console.error(error));
    }

    useEffect(() => {

        fetchClient();

    }, []);


    const handleInputChange = (e, field) => {
        setClient({...client, [field]: e.target.value});
    };

    const handleSave = async (columnField) => {
        const endpoint = apiEndpoints.getClientUpdateEndpoint(id, columnField, client[columnField]?.id);
        const payload = {[columnField]: client[columnField]};
        await axios.patch(endpoint, payload).then(() => {
            fetchClient();
            setClient({...client, [columnField]: client[columnField]});
            setNotification({message: `Updated ${columnField} successfully`, type: 'success'});
        }).catch(error => {
            setNotification({message: `Failed to update ${columnField}: ${error}`, type: 'error'});

        });
    };


    const showHistory = (field) => {
        setSelectedField(field);
        setHistoryVisible(true);
        axios.get(apiEndpoints.clientHistoryByClientIdAndField(id, field))
            .then(response => setHistory(response.data.response))
            .catch(error => setNotification({message: 'Failed to fetch history' + error, type: 'error'}));
    };

    if (!client) return null;

    return (
        <>
            <Card className="p-m-4" title="Client Details">
                <div className="p-d-flex p-ai-center p-mb-3">
                    <Avatar label="JD" className="p-mr-3" size="large" shape="circle"/>
                    <h2>{client.name}</h2>
                </div>
                <div className="p-fluid">
                    {/* Name Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="name" className="p-mr-2">Name</label>
                        <InputText
                            id="name"
                            value={client.name || ''}
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

                    {/* Email Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="email" className="p-mr-2">Email</label>
                        <InputText
                            id="email"
                            value={client.email || ''}
                            onChange={(e) => handleInputChange(e, 'email')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('email')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('email')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* Phone Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="phone" className="p-mr-2">Phone</label>
                        <InputText
                            id="phone"
                            value={client.phone || ''}
                            onChange={(e) => handleInputChange(e, 'phone')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('phone')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('phone')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>

                    {/* Alternative Phone Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="phone" className="p-mr-2">Alternative Phone</label>
                        <InputText
                            id="alternative-phone"
                            value={client.alternativePhone || ''}
                            onChange={(e) => handleInputChange(e, 'alternativePhone')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('alternativePhone')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('alternativePhone')}
                            className="p-button-sm p-button-secondary"
                        />
                    </div>


                    {/* Country Field */}
                    <div className="p-field p-d-flex p-ai-center">
                        <label htmlFor="country" className="p-mr-2">Country</label>
                        <InputText
                            id="alternative-phone"
                            value={client.country || ''}
                            onChange={(e) => handleInputChange(e, 'country')}
                            className="p-mr-2"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={() => handleSave('country')}
                            className="p-button-sm p-mr-2"
                        />
                        <Button
                            label="Show History"
                            icon="pi pi-clock"
                            onClick={() => showHistory('country')}
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


        </>);
}
export default ClientDetailsCard;