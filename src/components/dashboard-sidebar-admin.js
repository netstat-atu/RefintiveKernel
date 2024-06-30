import { useEffect } from 'react';

//** next */
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

//** mui */
import { Box, Button, Divider, Drawer, List, useMediaQuery } from '@mui/material';

//** icon */
import { RiHome4Line, RiGroupLine, RiSecurePaymentLine, RiLineChartLine, RiBillFill, RiBillLine, RiPaypalLine } from "react-icons/ri";
import { AccountBalanceSharp, AutoAwesome, BatchPrediction, Description, DocumentScanner, Receipt, ReceiptLong, RecentActors, RequestQuote } from '@mui/icons-material';
import { Users as UsersIcon } from '../icons/users';
//** component */
import { NavItem } from './nav-item';
import { useSelector } from 'react-redux';
import { ORG_ID_LIST } from '../utils';


export const DashboardSidebarAdmin = (props) => {

  const { orgId, organizationList, userId } = useSelector((state) => state.user);

  const removeObjectFromArray = (arr, titles) => {
    const filteredArr = [];
    for (let i = 0; i < arr.length; i++) {
      if (!titles.includes(arr[i].title)) {
        const clonedObj = { ...arr[i] };
        if (clonedObj.items) {
          clonedObj.items = removeObjectFromArray(clonedObj.items, titles);
        }
        filteredArr.push(clonedObj);
      }
    }

    return filteredArr;
  }

  const titlesToRemove = ['B2P Payment Request'];

  let items = [
    {
      href: '/admin/dashboardAdmin',
      icon: (<RiHome4Line fontSize="small" />),
      title: 'Dashboard'
    },
    {
      href: '',
      icon: (<RiGroupLine fontSize="small" />),
      title: 'Consumer Management',
      items: [
        {
          href: '/admin/consumerRegistration',
          icon: (<UsersIcon fontSize="small" />),
          title: 'Consumer Registration'
        },
        {
          href: '/admin/consumerList',
          icon: (<RecentActors fontSize="small" />),
          title: 'Registered Consumer List'
        },
      ]
    },
    {
      href: '',
      icon: (<RiBillLine fontSize="small" />),
      title: 'Bill Management',
      items: [
        {
          href: '/admin/billsFetched',
          icon: (<Receipt fontSize="small" />),
          title: 'Bill Fetch List'
        },
        {
          href: '/admin/autoFetchBill',
          icon: (<AutoAwesome fontSize="small" />),
          title: 'Auto Bill Fetch List'
        },
        {
          href: '/admin/manualBillFetch',
          icon: (<ReceiptLong fontSize="small" />),
          title: 'Individual Bill Upload'
        },
        {
          href: '/admin/billUpload',
          icon: (<DocumentScanner fontSize="small" />),
          title: 'Bulk Bill Upload',
        },
        {
          href: '/admin/billStatus',
          icon: (<Description fontSize="small" />),
          title: 'Bill Status'
        }
      ]
    },
    {
      href: '',
      icon: (<RiSecurePaymentLine fontSize="small" />),
      title: 'Payment Management',
      items: [
        {
          href: '/admin/batchVerification',
          icon: (<BatchPrediction fontSize="small" />),
          title: 'Batch Verification'
        },
        {
          href: '/admin/balanceStatement',
          icon: (<AccountBalanceSharp fontSize="small" />),
          title: 'Balance Statement'
        },
        {
          href: '/admin/paymentRequest',
          icon: (<RiPaypalLine fontSize="small" />),
          title: 'B2P Payment Request'
        },
        {
          href: '/admin/billPayment',
          icon: (<RequestQuote fontSize="small" />),
          title: 'Bill Payment'
        },

      ]
    },
    {
      href: '/admin/reports',
      icon: (<RiLineChartLine fontSize="small" />),
      title: 'Reports'
    }
  ];

  items = orgId !== ORG_ID_LIST.ITL ? removeObjectFromArray(items, titlesToRemove) : items

  const { open, onClose } = props;
  const router = useRouter();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'), {
    defaultMatches: true,
    noSsr: false
  });

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (open) {
      onClose?.();
    }
  }, [router.asPath]);

  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
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
          <List component="nav">
            {items.map((item) => (
              <NavItem
                items={item.items}
                key={item.title}
                icon={item.icon}
                href={item.href}
                title={item.title}
              />
            ))}
          </List>

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

DashboardSidebarAdmin.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool
};
