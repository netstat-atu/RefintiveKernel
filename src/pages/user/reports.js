import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, Typography, Card, Tab, Stack } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

//** component */
import ListOfBillTable from '../../components/reportTable/ListOfBillTable';
import ReversalBillTable from '../../components/reportTable/ReversalBillTable';
import BillAverageTable from '../../components/reportTable/BillAverageTable';
import BillPaidHistoryTable from '../../components/reportTable/BillPaidHistoryTable';
import AutoBatchReport from '../../components/reportTable/AutoBatchReport';
import { DashboardLayoutUser } from '../../components/dashboard-layout-user';
import BBPSLogo from '../../components/BBPSLogo';
import { useSelector } from 'react-redux';
import PDFParameterReport from '../../components/reportTable/PDFParameterReport';
import { ORG_ID_LIST } from '../../utils';

const Reports = () => {
  const { orgId, userId } = useSelector((state) => state.user);
  const [reportTypeTabValue, setReportTypeTabValue] = React.useState("blank");
  const handleChangeUploadTab = (event, newValue) => setReportTypeTabValue(newValue)
  return (
    <>
      <Head>
        <title>
          Reports
        </title>
      </Head>
      <Stack component="main" p={3} spacing={3} >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
          <Typography variant="h5" component="div">Reports</Typography>
          <BBPSLogo />
        </Box>
        <TabContext value={reportTypeTabValue}>
          <Card>
            <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeUploadTab} >
              <Tab label={`#`} value="-1" />
              <Tab label={`List Of Bill`} value="0" />
              <Tab label={`Bill Average`} value="1" />
              <Tab label={`Paid History`} value="2" />
              <Tab label={`Reversal Bill`} value="3" />
              {ORG_ID_LIST.ITL === orgId ? <Tab label={`Auto Batch Creation Report`} value="4" /> : null}
              {ORG_ID_LIST.ITL === orgId || ORG_ID_LIST.HDFC === orgId ? <Tab label={`PDF Parameter Report`} value="5" /> : null}
            </TabList>
          </Card>
          <TabPanel sx={{ p: 0 }} value="blank" >
            <Typography variant='body1' >
              {`Please Choose Report`}
            </Typography>
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="0" >
            <ListOfBillTable />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="1" >
            <BillAverageTable />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="2" >
            <BillPaidHistoryTable />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="3" >
            <ReversalBillTable />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="4" >
            <AutoBatchReport />
          </TabPanel>
          <TabPanel sx={{ p: 0 }} value="5" >
            <PDFParameterReport />
          </TabPanel>
        </TabContext>
      </Stack>
    </>
  )
}
Reports.getLayout = (page) => (
  <DashboardLayoutUser>
    {page}
  </DashboardLayoutUser>
);

export default Reports;