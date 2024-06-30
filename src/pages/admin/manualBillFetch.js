import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, Card, Stack, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

//**  component */
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import FetchBillUpload from '../../components/manualBillTab/FetchBillUpload';
import NonFetchBillUpload from '../../components/manualBillTab/NonFetchBillUpload';
import HTBillUpload from '../../components/manualBillTab/HTBillUpload';
import BBPSLogo from '../../components/BBPSLogo';

//** hook */

const ManualBillFetch = () => {

    const [value, setValue] = React.useState('1');
    const handleChangeTabs = (event, newValue) => setValue(newValue);
    return (
        <>
            <Head>
                <title>
                    Individual Bill Upload
                </title>
            </Head>
            <Stack spacing={3} p={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
                    <Typography variant="h5" component="div">
                        Individual Bill Upload
                    </Typography>
                    <BBPSLogo />
                </Box>
                <TabContext value={value}>
                    <Card>
                        <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeTabs} >
                            <Tab label="Fetch Bill Upload" value="1" />
                            <Tab label="Non-Fetch Bill Upload" value="2" />
                            <Tab label="HT Bill Upload" value="3" />
                        </TabList>
                    </Card>
                    <TabPanel sx={{ p: 0 }} value="1">
                        <FetchBillUpload />
                    </TabPanel>
                    <TabPanel sx={{ p: 0 }} value="2">
                        <NonFetchBillUpload />
                    </TabPanel>
                    <TabPanel sx={{ p: 0 }} value="3">
                        <HTBillUpload />
                    </TabPanel>
                </TabContext>
            </Stack>
        </>);
}

ManualBillFetch.getLayout = (page) => (
    <DashboardLayoutAdmin>
        {page}
    </DashboardLayoutAdmin>
);

export default ManualBillFetch;