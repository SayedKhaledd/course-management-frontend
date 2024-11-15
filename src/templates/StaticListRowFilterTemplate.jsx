import {MultiSelect} from "primereact/multiselect";

const staticListRowFilterTemplate = (options, list, isBoolean = false) => {
    return (
        <MultiSelect
            value={options.value || []}
            options={list.map((listValue) => ({label: listValue, value: isBoolean? listValue === "Yes": listValue}))}
            onChange={(e) => options.filterApplyCallback(e.value)}
            placeholder="Any"
            className="p-column-filter"
            style={{minWidth: '14rem'}}
        />
    );
};
export default staticListRowFilterTemplate;