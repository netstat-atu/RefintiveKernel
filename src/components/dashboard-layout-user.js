import React, { useState } from 'react';

//** mui */
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

//** component */
import { DashboardNavbarUser } from './dashboard-navbar-user';
import { DashboardSidebarUser } from './dashboard-sidebar-user';
import { DashboardFooterUser } from './dashboard-footer-user';
import PrivateRoute from './PrivateRoute';

//** hook */
import { useLoader } from '../Provider/LoaderContext';

const DashboardLayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  paddingTop: 64,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 280
  }
}));

export const DashboardLayoutUser = (props) => {
  const { isLoading } = useLoader();
  const { children } = props;
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const style = {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    width: '100%'
  }
  return (
    <PrivateRoute>
      <DashboardLayoutRoot><Box sx={style}>{children}</Box></DashboardLayoutRoot>
      <DashboardFooterUser onSidebarOpen={() => setSidebarOpen(true)} />
      <DashboardNavbarUser onSidebarOpen={() => setSidebarOpen(true)} />
      <DashboardSidebarUser onClose={() => setSidebarOpen(false)} open={isSidebarOpen} />
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress />
      </Backdrop>
    </PrivateRoute>
  );
};
