import Enrollment from "../components/Enrollment.jsx";
import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import ClientDetailsCard from "../components/cards/ClientDetailsCard.jsx";
import apiEndpoints from "../apiEndpoints.js";
import useAxios from "../hooks/useAxios.js";
import Notification from "../components/Notification.jsx";

const ClientDetails = () => {
    const {id} = useParams();
    const axios = useAxios();
    const [client, setClient] = useState(null);
    const [clientStatusOptions, setClientStatusOptions] = useState([]);
    const [referralSourceOptions, setReferralSourceOptions] = useState([]);
    const [initialCourseOptions, setInitialCourseOptions] = useState([]);
    const [notification, setNotification] = useState({message: '', type: ''});

    const fetchClient = () => {
        axios.get(apiEndpoints.client(id))
            .then(response => setClient(response.data.response))
            .catch(error => console.error(error));
    }
    const fetchClientStatuses = () => {
        axios.get(apiEndpoints.clientStatuses)
            .then(response => {
                setClientStatusOptions(response.data.response);
            })
            .catch(error => console.error(error));
    }
    const fetchReferralSourceOptions = () => {
        axios.get(apiEndpoints.referralSources)
            .then(response => {
                setReferralSourceOptions(response.data.response.map(source => ({
                    source: source.source,
                    id: source.id
                })));
            }).catch(error => {
            setNotification({message: 'Failed to fetch referral source options' + error, type: 'error'});
        });
    }
    const fetchInitialCourseOptions = () => {
        axios.get(apiEndpoints.initialCourses)
            .then(response =>
                setInitialCourseOptions(response.data.response.map(course => ({
                    id: course.id,
                    name: course.name
                }))))
            .catch(error =>
                setNotification({message: `Failed to fetch initial course options: ${error}`, type: 'error'})
            );
    }


    useEffect(() => {

        fetchClient();
        fetchClientStatuses();
        fetchInitialCourseOptions();
        fetchReferralSourceOptions();
    }, []);

    if (!client) return null;

    return (
        <>
            <ClientDetailsCard
                setNotification={setNotification} notification={notification} client={client}
                setClient={setClient} clientStatusOptions={clientStatusOptions}
                referralSourceOptions={referralSourceOptions}
                initialCourseOptions={initialCourseOptions}
                fetchClient={fetchClient}/>
            <Enrollment
                client={client}
                fetchClient={fetchClient}
                referralSourceOptions={referralSourceOptions}
                setNotification={setNotification}
            />
            <Notification status={notification.type} message={notification.message}/>


        </>
    );
}
export default ClientDetails;