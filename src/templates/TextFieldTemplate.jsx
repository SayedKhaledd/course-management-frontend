import React from 'react';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';

const TextFieldTemplate = ({value, field, editingField, handlers}) => {
    const isEditing = editingField === field;

    return (
        <div className="p-field p-d-flex p-ai-center" style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor={field} className="p-mr-2"
                   style={{ marginRight: '8px' }}
            >{field.charAt(0).toUpperCase() + field.slice(1)} : </label>
            {isEditing ? (
                <>
                    <InputText
                        id={field}
                        value={value}
                        onChange={(e) => onChange(e, field)}
                        className="p-mr-2"
                    />
                    <Button icon="pi pi-times" className="p-button-text p-button-danger"
                            onClick={handlers.onCancelEdit}/>
                    <Button
                        label="Save"
                        icon="pi pi-check"
                        onClick={() => handlers.onSubmitEdit(field)}
                        className="p-button-sm p-mr-2"
                    />
                </>
            ) : (
                <>

                    <span className="cell-content"
                            style={{ marginRight: '8px' }}
                    >{value || ''}</span>
                    <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        onClick={() => handlers.onEdit(field)}
                        className="p-button-sm p-mr-2"
                        style={{ width: 'fit-content'  }}

                    />

                </>
            )}
            <Button
                label="Show History"
                icon="pi pi-clock"
                onClick={() => handlers.onShowHistory(field)}
                className="p-button-sm p-button-secondary"
                style={{ width: 'fit-content' }}

            />
        </div>
    );
};

export default TextFieldTemplate;
