import React from 'react';

//** next */
import Router from 'next/router';
import Head from 'next/head';

//** mui */
import { Button, Stack, Typography } from '@mui/material';

//** component */
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import CButton from '../../components/CButton';

//** service */
import { pathNameBaseOnStage } from '../../services/configHandle';

//** redux */
import { useSelector } from 'react-redux';

//** icon */
import { ArrowRightAlt } from '@mui/icons-material';
import { RiFileUserLine, RiGroupLine, RiSecurePaymentLine, RiExchangeLine } from "react-icons/ri";

//** utils */

//** hook */
import DashboardData from '../../components/DashboardData';
import { DashboardLayoutUser } from '../../components/dashboard-layout-user';



const DashboardUser = () => {

  //** redux */
  const { orgName } = useSelector((state) => state.user);
  const [isShow, setIsShow] = React.useState(false);
  const hideDashboard = () => setIsShow(false)
  const showDashboard = () => setIsShow(true)

  const goToPage = (path) => Router.push(pathNameBaseOnStage(path))
  return (
    <>
      <Head>
        <title>
          Dashboard | Utility Portal
        </title>
      </Head>
      <Stack component="main"
        sx={{
          display: 'flex',
          flex: 1,
          py: 2
        }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ my: 2, }}>
          <CButton fullWidth icon={<RiGroupLine color='#2196F3' />} onClick={() => goToPage('/user/consumerRegistration')} title="Consumer Registration" />
          <CButton fullWidth icon={<RiFileUserLine color='#2196F3' />} onClick={() => goToPage('/user/consumerList')} title="Registered Consumer List" />
          <CButton fullWidth icon={<RiSecurePaymentLine color="#2196F3" />} onClick={() => goToPage('/user/paymentVerification')} title="Bill Verification" />
          <CButton fullWidth icon={<RiExchangeLine color="#2196F3" />} onClick={() => goToPage('/user/paymentClearance')} title="Bill Clearance" />
        </Stack>
        {isShow ?
          <DashboardData hideDashboard={hideDashboard} /> :
          <Stack justifyContent={'center'} style={{ flex: 1, display: 'flex' }}>
            <Stack justifyContent={'space-evenly'} alignItems={'center'}>
              <Typography variant='h1' align="center" >
                {`Welcome ${orgName}`}
              </Typography>
              <Typography variant="body1" align="center">
                Effortless bulk payments for all biller boards. Secure. Convenient. Smart.
              </Typography>
              <Button endIcon={<ArrowRightAlt />} onClick={showDashboard} variant='contained' sx={{ my: 2, borderRadius: '20px', width: 200 }}>
                Dashboard
              </Button>
            </Stack>
          </Stack>}
      </Stack>
    </>
  );
}


DashboardUser.getLayout = (page) => (
  <DashboardLayoutUser>
    {page}
  </DashboardLayoutUser>
);

export default DashboardUser;