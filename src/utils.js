import 'jspdf';
// import * as jspdf from 'jspdf-autotable';
import jsPDF from "jspdf";
import "jspdf-autotable";


export function getURLPath(field) {
    return field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

}

export function simplifyDate(date) {
    return new Date(date).toLocaleString();
}

export function formatDateToLocalDateTime(userInputDate) {
    return userInputDate + "T00:00:00";  // Defaulting time to 00:00:00

}

export const downloadCSV = (data, columns, name) => {
    const headers = columns.map(col => col.header);
    const rows = data.map(client => columns.map(col => {
        const field = col.field;
        const value = client[field];

        if (typeof value === 'object' && value !== null) {
            return value[col.listFieldName];
        }
        return value;
    }));

    let csvContent = "data:text/csv;charset=utf-8,"
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', name + '.csv');
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}

export const exportPdf = (exportColumns, data, filename = 'exportedFile') => {
    const doc = new jsPDF('l');
    const columnStyles = {};
    exportColumns.forEach((col, index) => {
        columnStyles[index] = {cellWidth: col.cellWidth || 'auto'};
    });
    doc.autoTable({
        head: [exportColumns.map(col => col.header)],
        body: data.map(row => exportColumns.map(col => {
            if (col.field === 'createdDate' || col.field === 'modifiedDate' ||
                col.field === 'startDate' || col.field === 'endDate' ||
                col.field === 'paymentDate' || col.field === 'paymentDueDate') {
                return new Date(row[col.field]).toLocaleString();
            }
            if (col.nestedField) {
                return row[col.field][col.listFieldName][col.nestedField];
            }
            if (col.listFieldName) {
                return row[col.field][col.listFieldName];
            }
            return row[col.field];
        })),
        columnStyles: columnStyles,
        width: 'auto'
    });

    doc.save(filename + '.pdf');
};

export const genericSortFunction = (e, field, subField, nestedField = null) => {
    const sortedData = [...e.data];

    if (nestedField) {
        sortedData.sort((a, b) => {
            const valueA = a?.[field]?.[subField]?.[nestedField]?.toLowerCase() ?? '';
            console.log("value a", valueA);
            const valueB = b?.[field]?.[subField]?.[nestedField]?.toLowerCase() ?? '';
            console.log("value b", valueB);
            if (e.order === 1) {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        });
        return sortedData;
    }

    sortedData.sort((a, b) => {
        const valueA = a?.[field]?.[subField]?.toLowerCase() ?? '';
        const valueB = b?.[field]?.[subField]?.toLowerCase() ?? '';
        if (e.order === 1) {
            return valueA.localeCompare(valueB);
        } else {
            return valueB.localeCompare(valueA);
        }
    });
    return sortedData;
};