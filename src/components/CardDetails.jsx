import React from "react";
import {Card} from "primereact/card";

import Notification from "./Notification.jsx";
import TextFieldTemplate from "../templates/TextFieldTemplate.jsx";
import DropDownFieldTemplate from "../templates/DropDownFieldTemplate.jsx";

const CardDetails = ({
                         header,
                         data,
                         columns,
                         notification

                     }) => {


    return (
        <>
            <Card title={header} className="p-m-4">
                <div className="p-fluid">
                    {columns.map(({field, type, options, handlers}) =>
                        type === 'dropdown' ?
                            <DropDownFieldTemplate
                                key={field}
                                field={field}
                                value={data[field]}
                                options={options}
                                handlers={handlers}
                            /> :
                            <TextFieldTemplate
                                key={field}
                                field={field}
                                value={data[field]}
                                handlers={handlers}
                            />
                    )}
                </div>
            </Card>
            <Notification status={notification.type} message={notification.message}/>
        </>
    );
};

export default CardDetails;
