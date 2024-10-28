import {useEffect, useState} from 'react';
import useAxios from "../hooks/useAxios.js";
import 'primeicons/primeicons.css';
import Table from "../components/Table.jsx";
import Notification from "../components/Notification.jsx";
import apiEndpoints from "../apiEndpoints.js";

function Users() {
    const [notification, setNotification] = useState({message: '', type: ''});
    const [users, setUsers] = useState([]);
    const axios = useAxios();
    const [roleOptions, setRoleOptions] = useState([]);

    const fetchUsers = () => {
        axios.get(apiEndpoints.users)
            .then(response => {
                setUsers(response.data.response);
            }).catch(error =>
            setNotification({message: 'Failed to fetch users ' + error, type: 'error'})
        );
    }

    const fetchRoles = () => {
        axios.get(apiEndpoints.roles)
            .then(response => {
                console.log(response.data)
                setRoleOptions(response.data.response);
                console.log(response.data.response)
            }).catch(error =>
            setNotification({message: 'Failed to fetch roles ' + error, type: 'error'})
        );
    }

    useEffect(() => {
        fetchUsers();
        fetchRoles();

    }, []);


    const columns = [
        {
            field: 'firstName',
            header: 'First Name',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.firstName
            }
        },
        {
            field: 'lastName',
            header: 'Last Name',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.lastName
            }
        },
        {
            field: 'email',
            header: 'Email',
            cellWidth: 60,
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.email
            }
        },
        {
            field: 'phoneNumber',
            header: 'Phone Number',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.phoneNumber
            }
        },
        {
            field: 'role',
            header: 'Role',
            sortable: true,
            filter: true,
            body: (rowData) => {
                return rowData.role}
        }

    ]


    return (
        <>
            <Table
                header={<h2>Users</h2>}
                data={users}
                columns={columns}
                paginatorLeftHandlers={[fetchUsers]}
                setNotification={setNotification}
                downloadFileName={'users'}


            ></Table>

            <Notification message={notification.message} type={notification.type}/>
        </>
    );
}

export default Users;
