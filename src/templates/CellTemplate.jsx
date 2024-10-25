import {Button} from "primereact/button";
import {InputText} from 'primereact/inputtext';


const CellTemplate = (rowData, columnField, editingState, handlers, isEditable = true) => {
    const isEditing = editingState.id === rowData.id && editingState.columnField === columnField;
    return (
        <div className="selectable-cell" style={{display: 'flex', alignItems: 'center'}}>
            {isEditing ? (
                <>
                    <InputText type="text" value={editingState.editedValue} onChange={handlers.onCellChange}
                    />
                    <Button icon="pi pi-check" className="p-button-text p-button-success"
                            onClick={() => handlers.onSubmitEdit(rowData.id, columnField)}/>
                    <Button icon="pi pi-times" className="p-button-text p-button-danger"
                            onClick={handlers.onCancelEdit}/>
                </>
            ) : (
                <>
                    <span className="cell-content">{rowData[columnField] + ""}</span>
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