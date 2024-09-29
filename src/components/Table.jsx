import DataTable from 'react-data-table-component';
import styles from '../styles/modules/Table.module.css';

const customStyles = {
    rows: {
        style: {
            minHeight: '60px', // Adjust row height
            backgroundColor: '#f8f9fa', // Background color for rows
            borderBottom: '1px solid #dee2e6', // Add border between rows
            '&:hover': {
                backgroundColor: '#e9ecef', // Highlight on hover
            },

        },
    },
    // headers: {
    //     style: {
    //         width:'fit-content', // Hide the sort icon
    //     }
    // }
    // ,
    headCells: {
        style: {
            backgroundColor: '#343a40', // Dark background for header
            color: '#ffffff', // White text color for header
            paddingLeft: '16px', // Increase left padding for head cells
            paddingRight: '16px', // Increase right padding for head cells
            fontSize: '16px', // Font size for header cells
            fontWeight: 'bold', // Bold text in header
            textAlign: 'center', // Center text in header cells,
            width: 'fit-content',
            wordWrap: 'break-word',

        },
    },
    cells: {
        style: {
            paddingLeft: '16px', // Increase left padding for data cells
            paddingRight: '16px', // Increase right padding for data cells
            fontSize: '14px', // Font size for data cells
            fontFamily: 'Roboto',
            textAlign: 'center', // Center text in cells

        },
    },
    pagination: {
        style: {
            display: 'flex', // Align pagination controls properly
            justifyContent: 'center', // Center the pagination below the table
            backgroundColor: '#ffffff', // White background for pagination
            color: '#343a40', // Dark text color for pagination
            borderTop: '1px solid #dee2e6', // Border above pagination
            padding: '10px 0', // Add padding to pagination area
        },
        pageButtonsStyle: {
            borderRadius: '50%', // Make pagination buttons round
            height: '40px',
            width: '40px',
            padding: '8px',
            margin: '0 4px',
            cursor: 'pointer',
            transition: '0.3s ease',
            '&:hover': {
                backgroundColor: '#6c757d', // Hover effect on pagination buttons
                color: '#ffffff',
            },
        },
    },
};

function Table({columns, data, paginationPerPage}) {
    return (
        <div className={styles.TableContainer}>
            <DataTable
                columns={columns}
                data={data} customStyles={customStyles}
                pagination={true} paginationPerPage={paginationPerPage}
                fixedHeaderScrollHeight="600px"
                fixedHeader={true}
                highlightOnHover
                striped
            />
        </div>
    );
}

export default Table;