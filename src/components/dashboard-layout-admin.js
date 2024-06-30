import React, { useState } from 'react';

//** mui */
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

//** component */
import { DashboardNavbarAdmin } from './dashboard-navbar-admin';
import { DashboardSidebarAdmin } from './dashboard-sidebar-admin';
import { DashboardFooterAdmin } from './dashboard-footer-admin';
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

export const DashboardLayoutAdmin = (props) => {
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
      <DashboardFooterAdmin onSidebarOpen={() => setSidebarOpen(true)} />
      <DashboardNavbarAdmin onSidebarOpen={() => setSidebarOpen(true)} />
      <DashboardSidebarAdmin onClose={() => setSidebarOpen(false)} open={isSidebarOpen} />
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress />
      </Backdrop>
    </PrivateRoute>
  );
};
