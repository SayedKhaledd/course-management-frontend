import React from "react";
import {Card} from "primereact/card";

import Notification from "../Notification.jsx";

const CardDetails = ({
                         header,
                         data,
                         columns,
                         notification,

                     }) => {


    return (
        <>
            <Card title={header} className="p-m-4">
                <div className="p-fluid">
                    {columns.map((column, index) => (
                        <div key={index}>
                            {column.body(data)}
                        </div>
                    ))}
                </div>
            </Card>
            <Notification status={notification.type} message={notification.message}/>
        </>
    );
};

export default CardDetails;
