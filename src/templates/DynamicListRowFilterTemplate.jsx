import {MultiSelect} from "primereact/multiselect";

const DynamicListRowFilterTemplate = (options, list, listFieldName) => {
    return (
        <MultiSelect
            value={options.value || []}
            options={list.map((status) => ({label: status[listFieldName], value: status.id}))}
            onChange={(e) => options.filterApplyCallback(e.value)}
            placeholder="Any"
            className="p-column-filter"
            maxSelectedLabels={1}
            style={{minWidth: '14rem'}}
        />
    );
};
export default DynamicListRowFilterTemplate;