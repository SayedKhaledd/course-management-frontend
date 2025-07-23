import Installments, {FetchInstallmentType} from "../components/Installments.jsx";
import React from "react";

const InstallmentsPage = () => {


    return (<>
        <Installments fetchInstallmentType={FetchInstallmentType.DONE_AND_WAITING} header={"Current ongoing installments"}>

        </Installments>
        <div style={{margin: '10px'}}></div>
        <Installments fetchInstallmentType={FetchInstallmentType.ONLY_CANCELLED} header={"Cancelled Installments"}></Installments>

    </>);
}
export default InstallmentsPage;