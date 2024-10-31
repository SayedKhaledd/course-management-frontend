import React from 'react';
import {Dropdown} from 'primereact/dropdown';
import {Button} from 'primereact/button';

const DropDownFieldTemplate = ({value, field, editingField, options, handlers, onChange}) => {
    const isEditing = editingField === field;

    return (
        <div className="p-field p-d-flex p-ai-center">
            <label htmlFor={field} className="p-mr-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            {isEditing ? (
                <>
                    <Dropdown
                        id={field}
                        value={value}
                        options={options}
                        onChange={(e) => handlers.onChange(e, field)}
                        className="p-mr-2"
                        placeholder="Select an option"
                    />
                    <Button
                        label="Save"
                        icon="pi pi-check"
                        onClick={() => handlers.onSave(field)}
                        className="p-button-sm p-mr-2"
                    />
                    <Button icon="pi pi-times" className="p-button-text p-button-danger"
                            onClick={handlers.onCancelEdit}/>
                </>
            ) : (
                <>
                    <span className="cell-content">{value || ''}</span>
                    <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        onClick={() => handlers.onEdit(field)}
                        className="p-button-sm p-mr-2"
                    />
                </>
            )}
            <Button
                label="Show History"
                icon="pi pi-clock"
                onClick={() => handlers.onShowHistory(field)}
                className="p-button-sm p-button-secondary"
            />
        </div>
    );
};

export default DropDownFieldTemplate;
