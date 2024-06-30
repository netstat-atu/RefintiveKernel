import React from 'react'

//** next */
import Head from 'next/head';

//** mui */
import { Box, Card, Stack, Tab, Typography } from '@mui/material';

//** component */
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import AmountSyncBillUpload from '../../components/billUploadTab/AmountSyncBillUpload';
import PrepaidAmountUpload from '../../components/billUploadTab/PrepaidAmountUpload';
import ReversalBillUpload from '../../components/billUploadTab/ReversalBillUpload';
import BulkBillUpload from '../../components/billUploadTab/BulkBillUpload';
import BBPSLogo from '../../components/BBPSLogo';

//** utils */
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ORG_ID_LIST } from '../../utils';

//** redux */
import { useSelector } from 'react-redux';
import FetchBulkBillUpload from '../../components/billUploadTab/FetchBulkBillUpload';
import PDFDataUpload from '../../components/billUploadTab/PDFDataUpload';

const BillUpload = () => {
    const { orgId } = useSelector(state => state.user);
    const [uploadTabValue, setUploadTabValue] = React.useState("0");
    const handleChangeUploadTab = (event, newValue) => setUploadTabValue(newValue)
    return (
        <>
            <Head>
                <title>
                    Bill Upload
                </title>
            </Head>
            <Stack spacing={3} p={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }} >
                    <Typography variant="h6" component="div">
                        Bill Upload
                    </Typography>
                    <BBPSLogo />
                </Box>
                <TabContext value={uploadTabValue}>
                    <Card>
                        <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeUploadTab} >
                            <Tab label={`Bulk Bill Upload`} value="0" />
                            <Tab label={`Reversal Bill Upload`} value="1" />
                            {orgId === ORG_ID_LIST.ITL ? <Tab label={`Bill Upload For Batch Create`} value="2" /> : null}
                            <Tab label={`Prepaid Balance`} value="3" />
                            <Tab label={`Fetch Bill Upload`} value="4" />
                            {/* <Tab label={`Bill PDF Data Upload`} value="5" />  */}
                        </TabList>
                    </Card>
                    <TabPanel sx={{ p: 0 }} value="0" >
                        <BulkBillUpload />
                    </TabPanel>
                    <TabPanel sx={{ p: 0 }} value="1" >
                        <ReversalBillUpload />
                    </TabPanel>
                    <TabPanel sx={{ p: 0 }} value="2" >
                        <AmountSyncBillUpload />
                    </TabPanel>
                    <TabPanel sx={{ p: 0 }} value="3" >
                        <PrepaidAmountUpload />
                    </TabPanel>
                    <TabPanel sx={{ p: 0 }} value="4" >
                        <FetchBulkBillUpload />
                    </TabPanel>
                    {/* <TabPanel sx={{ p: 0 }} value="5" >
                        <PDFDataUpload />
                    </TabPanel> */}
                </TabContext>
            </Stack>
        </>
    )
}

BillUpload.getLayout = (page) => (
    <DashboardLayoutAdmin>
        {page}
    </DashboardLayoutAdmin>
);

export default BillUpload;