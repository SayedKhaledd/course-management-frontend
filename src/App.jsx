import './App.css'
import CustomSideBar from './components/CustomSideBar.jsx'
import CustomTable from "./components/CustomTable.jsx";

function App() {

    return (
        <>

            <footer className="footer">
                <p>Footer</p>
            </footer>

            <div className="content">
                <div className="sidebar">
                    <CustomSideBar/>
                </div>
                <main className="table">
                    <CustomTable/>
                </main>
            </div>


        </>
    )
}

export default App
