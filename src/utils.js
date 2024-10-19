export function getURLPath(field) {
    return field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

}

export function simplifyDate(date) {
    return new Date(date).toLocaleString();
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
