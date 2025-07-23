import React from 'react';
import {Button} from 'primereact/button';
import {InputTextarea} from "primereact/inputtextarea";


const TextFieldTemplate = ({value, field, editingState, handlers, isEditable = true}) => {
    const isEditing = editingState?.columnField === field;
    return (
        <div className="p-field p-d-flex p-ai-center" style={{display: 'flex', alignItems: 'center'}}>
            <label htmlFor={field} className="p-mr-2"
                   style={{marginRight: '8px'}}
            >{field.charAt(0).toUpperCase() + field.slice(1)} : </label>
            {!isEditable? <span className="cell-content"
                               style={{marginRight: '8px'}}>{value || ''}</span>
            :
            isEditing ?
                <>
                    <InputTextarea
                        id={field}
                        value={editingState?.editedValue}
                        onChange={handlers.onChange}
                        className="p-mr-2"
                        style={{width: 'fit-content'}}
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
            :
                <>
                    <div style={{
                        width: '30%',
                        whiteSpace: 'pre-wrap',
                        overflowY: 'auto',
                        maxHeight: '40px'
                    }}>
                        {value || ''}
                    </div>

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
            }
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

export default TextFieldTemplate;
