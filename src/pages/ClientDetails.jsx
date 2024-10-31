import Enrollment from "../components/Enrollment.jsx";
import {useParams} from "react-router-dom";
import React from "react";
import ClientDetailsCard from "../components/ClientDetailsCard.jsx";

const ClientDetails = () => {
    const {id} = useParams();
    return (
        <>
            <ClientDetailsCard/>
            <Enrollment clientId={id}/>

        </>
    );
}
export default ClientDetails;