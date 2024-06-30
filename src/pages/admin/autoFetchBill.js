import * as React from 'react';

//** next */
import Head from 'next/head';

//** mui */
import { Box, Typography, Card, Tab, Stack } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

//** components */
import AutoBillFetchInvocation from '../../components/autoBillFetchTab/AutoBillFetchInvocation';
import AutoBillFetchReport from '../../components/autoBillFetchTab/AutoBillFetchReport';
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import BBPSLogo from '../../components/BBPSLogo';



const AutoFetchBill = () => {
    const [uploadTabValue, setUploadTabValue] = React.useState("0");
    const handleChangeUploadTab = (event, newValue) => setUploadTabValue(newValue)

    return (
        <>
            <Head>
                <title>
                    Bill Auto Fetched
                </title>
            </Head>
            <Stack spacing={3} p={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }} >
                    <Typography variant="h6" component="div">
                        Bill Auto Fetched
                    </Typography>
                    <BBPSLogo />
                </Box>
                <TabContext value={uploadTabValue}>
                    <Card>
                        <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeUploadTab} >
                            <Tab label={`Auto Bill Fetch Report`} value="0" />
                            <Tab label={`Auto Bill Fetch Invocation`} value="1" />
                        </TabList>
                    </Card>
                    <TabPanel sx={{ p: 0 }} value="0" >
                        <AutoBillFetchReport />
                    </TabPanel>
                    <TabPanel sx={{ p: 0 }} value="1" >
                        <AutoBillFetchInvocation />
                    </TabPanel>
                </TabContext>
            </Stack>
        </>
    )
}
AutoFetchBill.getLayout = (page) => (
    <DashboardLayoutAdmin>
        {page}
    </DashboardLayoutAdmin>
);


export default AutoFetchBill;