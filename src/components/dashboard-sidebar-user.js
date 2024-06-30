import { useEffect } from 'react';
//** next */
import { useRouter } from 'next/router';

//** npm */
import PropTypes from 'prop-types';

//** mui */
import { Box, Button, Divider, Drawer, useMediaQuery } from '@mui/material';

//** icon */
import { RiHome4Line, RiGroupLine, RiSecurePaymentLine, RiLineChartLine } from "react-icons/ri";
import { Payments, PointOfSale, ReceiptLong, RecentActors, UploadFile } from '@mui/icons-material';
import { Users as UsersIcon } from '../icons/users';

//** component */
import { NavItem } from './nav-item';

const items = [
  {
    href: '/user/dashboardUser',
    icon: (<RiHome4Line fontSize="small" />),
    title: 'Dashboard'
  },
  {
    href: '',
    icon: (<RiGroupLine fontSize="small" />),
    title: 'Consumer Management',
    items: [
      {
        href: '/user/consumerRegistration',
        icon: (<UsersIcon fontSize="small" />),
        title: 'Consumer Registration'
      },
      {
        href: '/user/consumerList',
        icon: (<RecentActors fontSize="small" />),
        title: 'Registered Consumer List'
      },
      {
        href: '/user/consumerListVerification',
        icon: (<RecentActors fontSize="small" />),
        title: 'Verify Consumers'
      },
    ]
  },
  {
    href: '',
    icon: (<RiSecurePaymentLine fontSize="small" />),
    title: 'Bill Management',
    items: [
      {
        href: '/user/paymentVerification',
        icon: (<PointOfSale fontSize="small" />),
        title: 'Bill Verification'
      },
      {
        href: '/user/paymentClearance',
        icon: (<Payments fontSize="small" />),
        title: 'Bill Clearance'
      },
      {
        href: '/user/billStatus',
        icon: (<ReceiptLong fontSize="small" />),
        title: 'Bill Status'
      },
            {
        href: '/user/uploadBankStatement',
        icon: (<UploadFile fontSize="small" />),
        title: 'Upload Bank Statement'
      },

    ]
  },

  {
    href: '/user/reports',
    icon: (<RiLineChartLine fontSize="small" />),
    title: 'Reports'
  },
];

export const DashboardSidebarUser = (props) => {
  const { open, onClose } = props;
  const router = useRouter();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'), {
    defaultMatches: true,
    noSsr: false
  });

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      if (open) {
        onClose?.();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.asPath]
  );

  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',

        }}
      >
        <Box sx={{
          minHeight: 64,
          backgroundColor: "background.paper",
          pt: 2,
          pl: 2,
        }}>

          <img style={{ bottom: 0 }} alt='logo' height={"40"} width={"70"} src={"/static/B2P-Logo.png"} />
        </Box>
        <Button
          component="a"
          sx={{
            borderRadius: 1,
            color: 'primary.light',
            justifyContent: 'flex-start',
            px: 4,
            mt: 2,
            fontSize: 16,
            textAlign: 'left',
            textTransform: 'none',
            width: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {"Navigation"}
          </Box>
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          {items.map((item) => (
            <NavItem
              items={item.items}
              key={item.title}
              icon={item.icon}
              href={item.href}
              title={item.title}
            />
          ))}
        </Box>
        <Divider sx={{ borderColor: '#124887' }} />
      </Box>
    </>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'primary.dark',
            color: '#FFFFFF',
            width: 280
          }
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'primary.dark',
          color: '#FFFFFF',
          width: 280
        }
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

DashboardSidebarUser.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
