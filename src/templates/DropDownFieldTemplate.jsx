import React from 'react';
import {Button} from 'primereact/button';
import {Dropdown} from "primereact/dropdown";

const DropDownFieldTemplate = ({
                                   value,
                                   field,
                                   listFieldName,
                                   editingState,
                                   listOptions,
                                   handlers,
                                   nestedField = '',
                                   isEditable = true
                               }) => {

    const isEditing = editingState?.columnField === field;
    const getValue = () => {
        if (!value) return null;
        if (nestedField) return value[listFieldName][nestedField];
        if (listFieldName) return value[listFieldName];
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return value;
    };
    const getOptions = () => listOptions.map(e => nestedField ? e[nestedField] : listFieldName ? e[listFieldName] : e);
    const getDisplayValue = () => {
        const source = editingState?.editedValue ?? value;
        return nestedField ? source?.[listFieldName]?.[nestedField] : source?.[listFieldName] ?? source;
    };

    const getFinalDisplayValue = (value) => (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value);

    return (
        <div className="p-field p-d-flex p-ai-center" style={{display: 'flex', alignItems: 'center'}}>
            <label htmlFor={field} className="p-mr-2"
                   style={{marginRight: '8px'}}
            >{field.charAt(0).toUpperCase() + field.slice(1)} : </label>
            {isEditing ? (
                <>
                    <Dropdown
                        value={getFinalDisplayValue(getDisplayValue())}
                        options={getOptions()}
                        onChange={e => handlers.onOptionChange(e, field)}
                        optionLabel="name"
                        style={{marginRight: '8px'}}
                        placeholder="Select a value"
                        onClick={e => e.stopPropagation()}
                    />

                    <Button icon="pi pi-times" className="p-button-text p-button-danger"
                            onClick={handlers.onCancelEdit}/>
                    <Button
                        label="Save"
                        icon="pi pi-check"
                        onClick={() => handlers.onSubmitEdit(field)}
                        style={{width: 'fit-content'}}
                    />
                </>
            ) : (
                <>

                    <span className="cell-content"
                          style={{marginRight: '8px'}}
                    >{getValue() || ''}</span>
                    <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        onClick={() => {
                            handlers.onEdit(value, field);
                        }}
                        className="p-button-text p-button-secondary"
                        style={{width: 'fit-content'}}

                    />

                </>
            )}
            <Button
                label="Show History"
                icon="pi pi-clock"
                onClick={() => handlers.onShowHistory(field)}
                className="p-button-text p-button-secondary"
                style={{width: 'fit-content'}}

            />
        </div>
    );
};

export default DropDownFieldTemplate;
