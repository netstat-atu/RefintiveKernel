import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

//** next */
import Router from "next/router";

//** mui */
import { AppBar, Box, Button, CircularProgress, FormControl, IconButton, ListItemIcon, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@mui/material';


//** icon */
import MenuIcon from '@mui/icons-material/Menu';
import { ArrowDropDown, DownloadingOutlined, Logout, VerifiedUser } from '@mui/icons-material';

//** redux */
import { useDownloadManagerModal } from '../Provider/DownloadMangerModalContext';
import { setIsSignIn, setReduxReset } from '../redux/slice/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useLoader } from '../Provider/LoaderContext';

//** service */
import { pathNameBaseOnStage, theodore_api } from '../services/configHandle';
import { setExtraReduxReset } from '../redux/slice/extraSlice';

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3]
}));

export const DashboardNavbarUser = (props) => {
  const dispatch = useDispatch()
  const { token, givenName, orgName, lastName } = useSelector((state) => state.user);
  const { openDownloadManager } = useDownloadManagerModal();
  const { showLoader, hideLoader, isLoading } = useLoader();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const { onSidebarOpen, ...other } = props;

  const removeSessionManage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  const removeAllData = () => {
    if ('localStorage' in window) {
      localStorage.clear();
    }
    if ('sessionStorage' in window) {
      sessionStorage.clear();
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        registrations.forEach(function (registration) {
          registration.unregister();
        });
      });
    }
    removeSessionManage()
    dispatch(setExtraReduxReset());
    dispatch(setReduxReset());
    dispatch(setIsSignIn(false));
    Router.push(pathNameBaseOnStage('/login'))
  }
  const logOut = async () => {
    showLoader()
    if (token) {
      const headers = {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Authorization": `Bearer ${token}`
      }
      let requestOptions = {
        method: 'POST',
        headers: headers
      };
      await fetch(theodore_api + '/logout', requestOptions)
        .then(response => {
          if (response.status == 200) {
            removeAllData()
          } else {
            removeAllData()
          }
        })
        .catch(error => {
          removeAllData()
        });
    } else {
      removeAllData()
    }
    hideLoader()
  }

  return (
    <>
      <DashboardNavbarRoot
        sx={{
          left: {
            lg: 280
          },
          width: {
            lg: 'calc(100% - 280px)'
          }
        }}
        {...other}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            left: 0,
            px: 2
          }}
        >
          <IconButton
            onClick={onSidebarOpen}
            sx={{
              display: {
                xs: 'inline-flex',
                lg: 'none'
              }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <div style={{ display: "flex", flex: 1, justifyContent: "flex-end", marginRight: 20 }}>
            <Tooltip title="Download Manager">
              <IconButton color="inherit" onClick={openDownloadManager}>
                <DownloadingOutlined fontSize="large" color='info' />
              </IconButton>
            </Tooltip>
          </div>
          <FormControl>
            <Button onClick={handleClick}
              size="small"
              endIcon={<ArrowDropDown />}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              sx={{ fontSize: 16, color: 'black', p: 0 }}
            >
              Hello {givenName}
            </Button>
            <Typography variant='caption' sx={{ px: 1.5, }} color='GrayText' >{orgName}</Typography>
          </FormControl>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem   >
              <ListItemIcon >
                {isLoading ? <CircularProgress size={"small"} color="primary" /> : <VerifiedUser fontSize="small" />}
              </ListItemIcon>
              {givenName} {lastName}
            </MenuItem>
            <MenuItem onClick={logOut}  >
              <ListItemIcon >
                {isLoading ? <CircularProgress size={"small"} color="primary" /> : <Logout fontSize="small" />}
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>


      </DashboardNavbarRoot>
    </>
  );
};

DashboardNavbarUser.propTypes = {
  onSidebarOpen: PropTypes.func
};
