import React from 'react'

//** next */
import Head from 'next/head';

//** mui */
import { Box, Container, Card, Tab, Stack } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

//** utils */
import { ORG_ID_LIST } from '../../utils';

//** redux */
import { useSelector } from 'react-redux';

//** component */
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import DeletedBatchTab from '../../components/paymentClearanceTab/deletedBatchTab';
import CustomBatchTab from '../../components/paymentClearanceTab/customBatchTab';
import NormalBatchTab from '../../components/paymentClearanceTab/normalBatchTab';
import BBPSLogo from '../../components/BBPSLogo';

const BatchVerification = () => {
    const { orgId } = useSelector(state => state.user);
    const [batchTab, setBatchTab] = React.useState("0");
    const handleChangeBatchTabs = (event, newValue) => setBatchTab(newValue)

    return (<>
        <Head>
            <title>
                Batch Verification
            </title>
        </Head>
        <Stack spacing={3} p={3} >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }} >
                <BBPSLogo />
            </Box>
            <TabContext value={batchTab}>
                <Card sx={{ mx: 3 }}>
                    <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeBatchTabs} >
                        <Tab label={`Admin Batch Created`} value="0" />
                        <Tab label={`NEFT Payment Batch`} value="1" />
                        {orgId == ORG_ID_LIST.ITL ? <Tab label={`Performa Invoice`} value="2" /> : null}
                        <Tab label={`Deleted Batch`} value="3" />
                    </TabList>
                </Card>
                <TabPanel sx={{ p: 0 }} value="0" >
                    <NormalBatchTab batchType={1} />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="1" >
                    <NormalBatchTab batchType={2} />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="2" >
                    <CustomBatchTab />
                </TabPanel>
                <TabPanel sx={{ p: 0 }} value="3" >
                    <DeletedBatchTab />
                </TabPanel>
            </TabContext>
        </Stack>
    </>
    );
}

BatchVerification.getLayout = (page) => (
    <DashboardLayoutAdmin>
        {page}
    </DashboardLayoutAdmin>
);

export default BatchVerification;
