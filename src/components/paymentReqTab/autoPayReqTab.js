import React from 'react'

//** mui */
import { Card, Tab } from '@mui/material';

//** utils */
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ProcessReqBillTab from '../autoPaymentReqTab/processReqBillTab';
import NotProcessReqBillTab from '../autoPaymentReqTab/notProcessReqBillTab';
import PrepaidReqBillTab from '../autoPaymentReqTab/prepaidReqBillTab';
import NonFetchReqBillTab from '../autoPaymentReqTab/nonFetchReqBillTab';

//** component */


const AutoPayReqTab = () => {
    const [autoPaymentReqTabValue, setAutoPaymentTabValue] = React.useState("0");
    const handleChangeUploadTab = (event, newValue) => setAutoPaymentTabValue(newValue);
    return (
        <>
            <TabContext value={autoPaymentReqTabValue}>
                <Card>
                    <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeUploadTab} >
                        <Tab label={`Process Bill`} value="0" />
                        <Tab label={`Not Process Bill`} value="1" />
                        <Tab label={`Prepaid Bill`} value="2" />
                        <Tab label={`Non Fetch Bill`} value="3" />
                    </TabList>
                </Card>
                <TabPanel sx={{ p: 0 }} value="0" >
                    <ProcessReqBillTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="1" >
                    <NotProcessReqBillTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="2" >
                    <PrepaidReqBillTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="3" >
                    <NonFetchReqBillTab />
                </TabPanel>
            </TabContext>
        </>
    )
}

export default AutoPayReqTab;