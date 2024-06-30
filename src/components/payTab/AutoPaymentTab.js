import React from 'react'

//** mui */
import { Card, Tab } from '@mui/material';

//** utils */
import { TabContext, TabList, TabPanel } from '@mui/lab';

//** component */
import ProcessBillTab from '../autoPaymentTab/processBillTab';
import NotProcessBillTab from '../autoPaymentTab/notProcessBillTab';
import PrepaidBillTab from '../autoPaymentTab/prepaidBillTab';
import NonFetchBillTab from '../autoPaymentTab/nonFetchBillTab';
import UrgentBillTab from '../autoPaymentTab/urgentBillTab';
import { ORG_ID_LIST } from '../../utils';
import { useDispatch, useSelector } from 'react-redux';

const AutoPaymentTab = () => {
    const { orgId, userId, organizationList } = useSelector((state) => state.user);
    const [autoPaymentTabValue, setAutoPaymentTabValue] = React.useState("0");
    const handleChangeUploadTab = (event, newValue) => setAutoPaymentTabValue(newValue);
    return (
        <>
            <TabContext value={autoPaymentTabValue}>
                <Card>
                    <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeUploadTab} >
                        <Tab label={`Process Bill`} value="0" />
                        <Tab label={`Not Process Bill`} value="1" />
                        <Tab label={`Prepaid Bill`} value="2" />
                        <Tab label={`Non Fetch Bill`} value="3" />
                        {ORG_ID_LIST.ITL ==orgId ?<Tab label={`Urgent Bill`} value="4" />:null}
                    </TabList>
                </Card>
                <TabPanel sx={{ p: 0 }} value="0" >
                    <ProcessBillTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="1" >
                    <NotProcessBillTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="2" >
                    <PrepaidBillTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="3" >
                    <NonFetchBillTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="4" >
                    <UrgentBillTab />
                </TabPanel>
            </TabContext>
        </>
    )
}

export default AutoPaymentTab;