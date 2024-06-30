import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
//** next */
import Router from "next/router";

//** mui */
import { AppBar, Box, Button, CircularProgress, FormControl, IconButton, InputLabel, ListItemIcon, Menu, MenuItem, Select, Toolbar, Tooltip, Typography } from '@mui/material';

//** icon */
import MenuIcon from '@mui/icons-material/Menu';
import { ArrowDropDown, DownloadingOutlined, Logout, VerifiedUser } from '@mui/icons-material';

//** redux */
import { setIsSignIn, setOrgId, setOrgName, setReduxReset } from '../redux/slice/userSlice';
import { setExtraReduxReset, setOrgField } from '../redux/slice/extraSlice';
import { useDownloadManagerModal } from '../Provider/DownloadMangerModalContext';
import { useDispatch, useSelector } from 'react-redux';
import { useLoader } from '../Provider/LoaderContext';

//** service */
import { pathNameBaseOnStage, theodore_api } from '../services/configHandle';
import { getOrgField } from '../utils/bbps/billerServices';

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3]
}));

export const DashboardNavbarAdmin = (props) => {
  const dispatch = useDispatch();
  const { token, orgName, orgId, givenName, lastName, organizationList } = useSelector((state) => state.user);
  const { openDownloadManager } = useDownloadManagerModal();
  const { showLoader, hideLoader, isLoading } = useLoader();
  const { onSidebarOpen, ...other } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [organizationIdName, setOrganizationIdName] = React.useState(orgId + "/" + orgName);

  const removeSessionManage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChangeOrganization = useCallback(async (event) => {
    const value = event.target.value;
    const [organizationId, organizationName] = value.split("/");
    if (orgId !== organizationId || orgName !== organizationName) {
      dispatch(setOrgId(organizationId));
      dispatch(setOrgName(organizationName));
      setOrganizationIdName(organizationId + "/" + organizationName);
      Router.reload();
    }
  }, []);


  const getOrgFieldSet = async () => {
    try {
      const orgField = await getOrgField(orgId);
      if (orgField?.length > 0) {
        dispatch(setOrgField(orgField));
      } else {
        dispatch(setOrgField([]));
      }
    } catch (error) {
      dispatch(setOrgField([]));
      console.log("🚀 ~ file: dashboard-navbar-admin.js:68 ~ getOrgFieldSet ~ error:", error)

    }
  }
  const renderedOrganizationList = useMemo(() => {
    if (organizationList && organizationList.length > 0) {
      return organizationList.map((val, index) => (
        <MenuItem key={`${val.orgId + index}`} value={val.orgId + "/" + val.name}>
          {val.name} {val.alias ? `( ${val.alias} )` : null}
        </MenuItem>
      ));
    }
    return null;
  }, [organizationList]);


  const removeAllData = () => {
    removeSessionManage()
    dispatch(setReduxReset());
    dispatch(setExtraReduxReset());
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

  const paperProps = {
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
  }

  React.useEffect(() => {
    getOrgFieldSet()
  }, [])

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
          {
            organizationList ?
              <FormControl size="small" sx={{ width: "50%" }}>
                <InputLabel id="singleSelectOrganization" >Choose Organization</InputLabel>
                <Select
                  required
                  labelId="singleSelectOrganization"
                  id="selectOrganization"
                  value={organizationIdName}
                  label="Choose Organization"
                  onChange={handleChangeOrganization}
                >
                  {renderedOrganizationList}
                </Select>
              </FormControl> : null
          }



          <Box sx={{ flexGrow: 1 }} />

          <div style={{ display: "flex", flex: 1, justifyContent: "flex-end", marginRight: 20 }}>
            <Tooltip title="Download Manager">
              <IconButton
                color="inherit"
                onClick={openDownloadManager}
              >
                <DownloadingOutlined fontSize="large" color='info' />
              </IconButton>
            </Tooltip>

          </div>
          <FormControl>
            <Button
              onClick={handleClick}
              size="small"
              endIcon={<ArrowDropDown />}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              sx={{ fontSize: 16, color: 'black', p: 0 }}
            >
              Hello! Admin
            </Button>
            <Typography variant='caption' sx={{ px: 1.5, }} color='GrayText' >{givenName} {lastName}</Typography>
          </FormControl>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={paperProps}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
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

DashboardNavbarAdmin.propTypes = {
  onSidebarOpen: PropTypes.func
};
