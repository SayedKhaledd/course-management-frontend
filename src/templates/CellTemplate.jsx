import {Button} from "primereact/button";
import {InputTextarea} from "primereact/inputtextarea";


const CellTemplate = (rowData, columnField, editingState, handlers, isEditable = true) => {
    const isEditing = editingState.id === rowData.id && editingState.columnField === columnField;
    return (
        <div className="selectable-cell" style={{display: 'flex', alignItems: 'center'}}>
            {isEditing ? (
                <>
                    <InputTextarea type="text" value={editingState.editedValue} onChange={handlers.onCellChange}
                    />
                    <Button icon="pi pi-check" className="p-button-text p-button-success"
                            onClick={() => handlers.onSubmitEdit(rowData.id, columnField)}/>
                    <Button icon="pi pi-times" className="p-button-text p-button-danger"
                            onClick={handlers.onCancelEdit}/>
                </>
            ) : (
                <>
                    <div style={{
                        width: '100%',
                        whiteSpace: 'pre-wrap',
                        overflowY: 'auto',
                        maxHeight: '100px'
                    }}>
                        {rowData[columnField] === null ? "" : rowData[columnField] + ""}
                    </div>
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