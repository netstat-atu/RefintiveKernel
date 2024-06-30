import React from 'react'

//** next */
import Head from 'next/head';
// ** components
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';

import BBPSLogo from '../../components/BBPSLogo';

//** mui */
import { Box, Card, Stack, Typography, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import ManualPayReqTab from '../../components/paymentReqTab/manualPayReqTab';
import AutoPayReqTab from '../../components/paymentReqTab/autoPayReqTab';

const PaymentRequest = () => {
    const [payTabValue, setPayTabValue] = React.useState("0");
    const handleChangePayTabs = (event, newValue) => {
        setPayTabValue(newValue)
    };
    return (
        <>
            <Head>
                <title>
                    B2P Payment Request
                </title>
            </Head>
            <Stack spacing={3} p={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }} >
                    <Typography variant="h5" component="div">
                        B2P Payment Request
                    </Typography>
                    <BBPSLogo />
                </Box>
                <TabContext value={payTabValue}>
                    <Card>
                        <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangePayTabs} >
                            <Tab label={`Manual Payment`} value="0" />
                            <Tab label={`Auto Payment`} value="1" />
                        </TabList>
                    </Card>
                    <TabPanel sx={{ p: 0 }} value="0" >
                       <ManualPayReqTab/>
                    </TabPanel >
                    <TabPanel sx={{ p: 0 }} value='1'>
                        <AutoPayReqTab/>
                    </TabPanel>
                </TabContext >
            </Stack >
        </>
    )
}

PaymentRequest.getLayout = (page) => (
    <DashboardLayoutAdmin>
        {page}
    </DashboardLayoutAdmin>
);

export default PaymentRequest;