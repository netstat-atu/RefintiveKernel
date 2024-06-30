import * as React from 'react';

//** next */
import Head from 'next/head';
import Router from 'next/router';

//** mui */
import { Box, Card, Tab, Typography } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

//** icon */

//** service */
import { pathNameBaseOnStage } from '../../services/configHandle';

//** component */
import CButton from '../../components/CButton';
import SingleConsumerRegistrationComponent from '../../components/consumerRegistration/SingleConsumerRegistrationComponent';
import BulkConsumerRegistrationComponent from '../../components/consumerRegistration/BulkConsumerRegistrationComponent';
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import BBPSLogo from '../../components/BBPSLogo';

//** redux */
import { useDispatch } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';


const ConsumerRegistration = () => {
  
  const dispatch = useDispatch();
  const [value, setValue] = React.useState('1');
  const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))
  const handleChangeTabs = (event, newValue) => setValue(newValue);
  const goToPage = (path) => Router.push(pathNameBaseOnStage(path))

  return (
    <>
      <Head>
        <title>
          Consumer Registration
        </title>
      </Head>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center", p: 3 }}>
        <Box>
          <Typography variant="h5"
            component="div">
            Consumer Registration
          </Typography>
          <CButton onClick={() => goToPage('/admin/consumerList')} title="Registered Consumer List" />
        </Box>
        <BBPSLogo />
      </Box>

      <TabContext value={value}>
        <Card sx={{ mx: 3 }}>
          <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeTabs} >
            <Tab label="Individual Registration" value="1" />
            <Tab label="Bulk Registration" value="2" />
          </TabList>
        </Card>
        <TabPanel value="1">
          <Card sx={{ pb: 2, }} >
            <Box component="main" sx={{ flexGrow: 1 }}>
              <SingleConsumerRegistrationComponent openAlertHandle={openAlertHandle} />
            </Box>
          </Card>
        </TabPanel>
        <TabPanel value="2">
          <Card sx={{ pb: 2, }} >
            <Box component="main" sx={{ flexGrow: 1 }}>
              <BulkConsumerRegistrationComponent openAlertHandle={openAlertHandle} />
            </Box>
          </Card>
        </TabPanel>
      </TabContext>
    </>);
}

ConsumerRegistration.getLayout = (page) => (
  <DashboardLayoutAdmin>
    {page}
  </DashboardLayoutAdmin>
);

export default ConsumerRegistration;