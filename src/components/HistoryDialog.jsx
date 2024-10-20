import {Dialog} from "primereact/dialog";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {simplifyDate} from "../utils.js";

const HistoryDialog = ({visible, setVisible, history, selectedField}) => {
    return <Dialog
        header={`History of ${selectedField}`}
        visible={visible}
        style={{width: '50vw'}}
        onHide={() => setVisible(false)}
    >
        {/* History Table */}
        <DataTable
            value={history.map((entry) => {
                entry.modifiedDate = simplifyDate(entry.modifiedDate);
                return entry;

            })}>
            <Column field="oldValue" header="Old Value"/>
            <Column field="newValue" header="New Value"/>
            <Column field="modifiedBy" header="Modified By"/>
            <Column field="modifiedDate" header="Modified Date"/>
        </DataTable>
    </Dialog>;
}
export default HistoryDialog;