import Table from "../components/Table.jsx";
import {useEffect, useState} from 'react';
import {BASE_URL} from "../constants.js";


function Courses() {
    const columns = [
        //add name, email, phone number, country, city, address
        {
            name: 'Name',
            selector: row => row.name,
        },
        {
            name: 'Email',
            selector: row => row.email,
        },
        {
            name: 'Phone Number',
            selector: row => row.phone,
        },
        {
            name: 'Country',
            selector: row => row.country,
        },
        {
            name: 'Address',
            selector: row => row.address,
        },
        {
            name: 'Status',
            selector: row => row.clientStatus ? row.clientStatus.status : 'N/A',  // Safely access clientStatus.status
        },
        //referral source, same as above
        {
            name: 'Referral Source and new word is here',
            selector: row => row.referralSource ? row.referralSource.source : 'N/A',
        },
        //add modified date
        {
            name: 'Modified Date',
            selector: row => row.modifiedDate,
        },
        //add created date
        {
            name: 'Created Date',
            selector: row => row.createdDate,
        },


    ];
    const [clients, setClients] = useState([]);
    //add usestat for pagination info


    useEffect(() => {
        fetch(BASE_URL + 'client/find-paginated-and-filtered', {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            body:
                JSON.stringify({
                    pageNumber: 1,
                    pageSize: 2,
                    deletedRecords: false,
                    sortBy: "name",
                    sortDesc: true
                })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.response.result);
                setClients(data.response.result)
            })
            .catch(error => console.log(error));
    });
    console.log(clients);

    return (
        <>
            <Table columns={columns} data={clients}/>


        </>
    )
}

export default Courses;
