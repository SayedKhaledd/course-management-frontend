import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";

const DropDownCellTemplate = (rowData, columnField, listFieldName, editingState, listOptions, handlers, nestedField = '', isEditable = true) => {
    const isEditing = editingState.id === rowData.id && editingState.columnField === columnField;
    const getValue = () => {
        if (!editingState.editedValue) return null;
        if (nestedField) return editingState.editedValue[listFieldName][nestedField];
        return listFieldName ? editingState.editedValue[listFieldName] : editingState.editedValue;
    };

    const getOptions = () => listOptions.map(e => nestedField ? e[nestedField] : listFieldName ? e[listFieldName] : e);
    const getDisplayValue = () => {
        const fieldData = rowData[columnField];
        if (fieldData === null || fieldData === undefined) return null;

        if (nestedField) {
            const nestedData = fieldData[listFieldName];
            return nestedData ? nestedData[nestedField] : null;
        }

        if (listFieldName) return fieldData[listFieldName];
        return fieldData === true ? "Yes" : (fieldData === false ? "No" : fieldData);
    };
    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            {isEditing ? (
                <>
                    <Dropdown
                        value={getValue()}
                        options={getOptions()}
                        onChange={e => handlers.onOptionChange(e, columnField)}
                        optionLabel="name"
                        style={{marginRight: '8px'}}
                        placeholder="Select a value"
                        onClick={e => e.stopPropagation()}
                    />
                    <Button icon="pi pi-check" className="p-button-text p-button-success"
                            onClick={() => handlers.onSubmitEdit(rowData.id, columnField)}/>
                    <Button icon="pi pi-times" className="p-button-text p-button-danger"
                            onClick={handlers.onCancelEdit}/>
                </>
            ) : (
                <>
                    <span className="cell-content">{getDisplayValue()}</span>
                    {isEditable && (
                        <Button
                            icon="pi pi-pencil"
                            className="p-button-text p-button-secondary"
                            style={{marginLeft: '8px'}}
                            onClick={e => {
                                e.stopPropagation();
                                handlers.onEdit(rowData.id, columnField, rowData[columnField]);
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default DropDownCellTemplate;