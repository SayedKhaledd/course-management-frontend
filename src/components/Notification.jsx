import React, {useEffect, useRef} from 'react';
import {Toast} from 'primereact/toast';

const Notification = ({status, message}) => {
    const toast = useRef(null);

    useEffect(() => {
        if (status && message) {
            if (status === 'success') {
                toast.current.show({severity: 'success', summary: 'Success', detail: message, life: 3000});
            } else if (status === 'error') {
                toast.current.show({severity: 'error', summary: 'Error', detail: message, life: 3000});
            }
        }
    }, [status, message]);

    return <Toast ref={toast} position="bottom-right"/>;
}

export default Notification;
