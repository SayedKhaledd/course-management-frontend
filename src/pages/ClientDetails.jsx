import React, {useEffect, useState} from 'react';
import {Card} from 'primereact/card';
import {Avatar} from 'primereact/avatar';
import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {BASE_URL} from "../constants.js";
import useAxios from "../useAxios.js";
import {useLocation, useParams} from 'react-router-dom'; // Import useParams for URL params
import '../styles/Client_Details.css';
import {getURLPath, simplifyDate} from "../utils.js";
import Notification from "../components/Notification.jsx";


const ClientDetails = () => {
    const location = useLocation();
    const {id} = useParams(); // Get client ID from the URL
    const [client, setClient] = useState(location.state?.client || null); // Use location.state initially or null
    const axios = useAxios();

    const [historyVisible, setHistoryVisible] = useState(false);
    const [selectedField, setSelectedField] = useState('');
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const countries = [
        {name: 'United States', code: 'US'},
        {name: 'Egypt', code: 'EG'},
        {name: 'Germany', code: 'DE'},
        {name: 'Japan', code: 'JP'}
    ];

    const fetchClient = () => {
        axios.get(`${BASE_URL}client/${id}`)
            .then(response => setClient(response.data.response))
            .catch(error => console.error(error));
    }

    useEffect(() => {
        if (!client) {
            fetchClient();
        }
    }, [id, client, axios]);

    const handleInputChange = (e, field) => {
        const value = e.target.value;
        setClient({...client, [field]: value});
    };

    const getUpdateEndpoint = (clientId, column) => {
        return `${BASE_URL}client/${clientId}/${getURLPath(column)}`;
    };

    const handleSave = async (columnField) => {
        const endpoint = getUpdateEndpoint(id, columnField);
        try {
            const payload = {[columnField]: client[columnField]};
            await axios.patch(endpoint, payload);
            console.log(`Updated ${columnField} successfully`);
            fetchClient();
            setStatus('success');
            setMessage(`Updated ${columnField} successfully`);

        } catch (error) {
            console.error(`Failed to update ${columnField}:`, error);
            setStatus('error');
            setMessage(`Failed to update ${columnField}: ${error}`);
        }
    };

    const showHistory = (field) => {
        setSelectedField(field);
        setHistoryVisible(true);
        axios.get(BASE_URL + `client-history/client/${id}/field/${getURLPath(field)}`,)
            .then(response => setHistory(response.data.response))
            .catch(error => console.error(error));
    };

    // const fieldHistory = history.filter((entry) => entry.field === selectedField);
    if (!client) {
        return <div>Loading client data...</div>; // Show a loading state while data is being fetched
    }
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
                        <Dropdown
                            id="country"
                            value={client.country || ''}
                            options={countries}
                            onChange={(e) => handleInputChange(e, 'country')}
                            optionLabel="name"
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
                <Dialog
                    header={`History of ${selectedField}`}
                    visible={historyVisible}
                    style={{width: '50vw'}}
                    onHide={() => setHistoryVisible(false)}
                >
                    {/* History Table */}
                    <DataTable
                        value={history.map((entry) => {
                            entry.modifiedDate = simplifyDate(entry.modifiedDate);
                            return entry;

                        })}>
                        <Column field="oldValue" header="Old Value"/>
                        <Column field="newValue" header="New Value"/>
                        <Column field="modifiedBy" header="Modified By"/>
                        <Column field="modifiedDate" header="Modified Date"/>
                    </DataTable>
                </Dialog>
            </Card>
            <Notification status={status} message={message}/>

        </>

    );
};

export default ClientDetails;
