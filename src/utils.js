export function getURLPath(field) {
    return field.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

}

export function simplifyDate(date) {
    return new Date(date).toLocaleString();
}

export const downloadCSV = (clients) => {
    const headers = ['Name', 'Email', 'Phone', 'Alternative Phone', 'Status', 'Country', 'Nationality', 'Address', 'Created Date', 'Modified Date', 'Created By', 'Modified By'];
    const rows = clients.map(client => [
        client.name,
        client.email,
        client.phone,
        client.alternativePhone,
        client.clientStatus?.status,
        client.country,
        client.nationality,
        client.address,
        `"${simplifyDate(client.createdDate)}"`,  // Wrap dates in quotes to prevent issues with commas
        `"${simplifyDate(client.modifiedDate)}"`,  // Wrap dates in quotes to prevent issues with commas
        client.createdBy,
        client.modifiedBy
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'clients_data.csv');
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}
