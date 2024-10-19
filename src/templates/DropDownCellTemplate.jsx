import {Button} from "primereact/button";
import {Dropdown} from "primereact/dropdown";

const DropDownCellTemplate = (rowData, columnField, listFieldName, editingState, listOptions,
                              handlers, isEditable = true) => {
    const isEditing = editingState.clientId === rowData.id && editingState.columnField === columnField;

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            {isEditing ? (
                <>
                    <Dropdown
                        value={editingState.editedValue ? editingState.editedValue[listFieldName] : null}
                        options={listOptions.map(e => e[listFieldName])}
                        onChange={e => handlers.onOptionChange(e, columnField)}
                        optionLabel="name"
                        style={{marginRight: '8px'}}
                        placeholder="Select Status"
                        onClick={(e) => e.stopPropagation()}

                    />
                    <Button icon="pi pi-check" className="p-button-text p-button-success" onClick={() =>
                        handlers.onSubmitEdit(rowData.id, columnField)}/>
                    <Button icon="pi pi-times" className="p-button-text p-button-danger"
                            onClick={handlers.onCancelEdit}/>
                </>
            ) : (
                <>
                    <span
                        className="cell-content">{rowData[columnField] ? rowData[columnField][listFieldName] : null}</span>
                    {isEditable && (
                        <Button icon="pi pi-pencil" className="p-button-text p-button-secondary"
                                style={{marginLeft: '8px'}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlers.onEdit(rowData.id, columnField, rowData[columnField]);
                                }
                                }
                        />
                    )}
                </>
            )}
        </div>
    );
};
export default DropDownCellTemplate;