import {Button} from "primereact/button";

const CellTemplate = (rowData, columnField, editingState, handlers, isEditable = true) => {
    const isEditing = editingState.clientId === rowData.id && editingState.columnField === columnField;
    return (
        <div className="selectable-cell" style={{display: 'flex', alignItems: 'center'}}>
            {isEditing ? (
                <>
                    <input type="text" value={editingState.editedValue} onChange={handlers.onCellChange}
                           style={{marginRight: '8px'}}/>
                    <Button icon="pi pi-check" className="p-button-text p-button-success"
                            onClick={() => handlers.onSubmitEdit(rowData.id, columnField)}/>
                    <Button icon="pi pi-times" className="p-button-text p-button-danger" onClick={handlers.onCancelEdit}/>
                </>
            ) : (
                <>
                    <span className="cell-content">{rowData[columnField]}</span>
                    {isEditable && (
                        <Button icon="pi pi-pencil" className="p-button-text p-button-secondary"
                                style={{marginLeft: '8px'}}
                                onClick={() => handlers.onEdit(rowData.id, columnField, rowData[columnField])}/>
                    )}
                </>
            )}
        </div>
    );
};

export default CellTemplate;