import React from 'react'

//** next */
import Head from 'next/head';
import Router from 'next/router';

//** mui */
import { Box, Container, Typography, Button, Stack, Card, CircularProgress, Dialog, DialogTitle, DialogContent, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

//** component */
import { DashboardLayoutUser } from '../../components/dashboard-layout-user';
import CButton from '../../components/CButton';
import { useLoader } from '../../Provider/LoaderContext';
import NormalBatchTab from '../../components/paymentClearanceTab/normalBatchTab';
import DeletedBatchTab from '../../components/paymentClearanceTab/deletedBatchTab';
import CustomBatchTab from '../../components/paymentClearanceTab/customBatchTab';
import BBPSLogo from '../../components/BBPSLogo';

//** utils */
import { clientPaymentRequest, userInfoS3Store } from '../../utils/bbps/billerServices';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** service */
import { config, paymentRedirectUrl, paymentVenderToPayUrl } from '../../services/configHandle';
import { pathNameBaseOnStage } from '../../services/configHandle';

//** icon */
import { Cancel, CheckCircleOutline } from '@mui/icons-material';

//** redux */
import { setIsAdmin, setIsSignIn, setOrgId, setOrgName, setUser } from '../../redux/slice/userSlice';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';


const PaymentClearance = () => {

  //** var */
  const { orgId, userId } = useSelector(state => state.user);
  const { showLoader, hideLoader } = useLoader();
  const reduxUser = useSelector(state => state.user);
  const dispatch = useDispatch()
  const [payLoader, setPayLoader] = React.useState(false);
  const [isRefresh, setIsRefresh] = React.useState(false);
  const [batchTab, setBatchTab] = React.useState("0");
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [failedOpen, setFailedOpen] = React.useState(false);

  const handleSuccessClose = () => setSuccessOpen(false);
  const handleSuccessOpen = () => setSuccessOpen(true);
  const handleFailedClose = () => setFailedOpen(false);
  const handleFailedOpen = () => setFailedOpen(true);
  const toggleRefresh = () => setIsRefresh(!isRefresh);

  const goToPage = (path) => Router?.push(pathNameBaseOnStage(path));

  const handleChangeBatchTabs = (event, newValue) => {
    setBatchTab(newValue)
  };

  const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))

  const goToPaymentPortal = async (batch, type) => {
    showLoader();
    let totalAmount = 0;
    if (type === true) {
      totalAmount = Number(batch.amount) / 100;
    } else {
      totalAmount = Number(batch.totalClientPaidAmountWithTax) / 100;
    }
    const body = {
      "type": "SAVE",
      "userId": userId,
      "data": reduxUser,
    }
    const resp = await userInfoS3Store(body);
    if (resp?.statusCode == 200) {
      const uid = uuid()
      const data = {
        "CustomerCode": orgId,
        "TrackID": uid,
        "Amount": totalAmount,
        "OrderNo": uid,
        "Remarks": "",
        "RedirectUrl": paymentRedirectUrl(uid, userId),
        "UDF1": batch.batchId,
        "UDF2": orgId,
        "UDF3": type ? "ADVANCE_PAYMENT" : "",
        "UDF4": "",
        "UDF5": "",
        "Uid": "",
        "Vid": "33"
      };

      const body = {
        "type": "accessToken",
        "env": config.prod,
        "data": {
          "accessTokenData": data
        }
      }
      await clientPaymentRequest(body)
        .then(async result => {
          if (result) {
            if (result.accessToken) {
              Router.push(`${paymentVenderToPayUrl()}${result.accessToken}`);
              hideLoader()
            }
          }
        })
        .catch(error => console.log('error', error));
    }
    hideLoader()
  };

  const getPaymentStatus = async (trackId, userId) => {

    setPayLoader(true)
    const resp = await asyncStorageStore(userId);
    if (resp?.statusCode == 200) {
      const data = { "TrackID": trackId };

      const body = {
        "type": "tranStatus",
        "env": config.prod,
        "data": {
          "tranStatusData": data
        }
      }
      await clientPaymentRequest(body)
        .then((e) => {
          if (e) {
            if (e?.TransactionStatus == "CAPTURED") {
              handleSuccessOpen();
            } else {
              handleFailedOpen();
            }
          } else {
            handleSuccessOpen()
            openAlertHandle("success", "Payment Successfully");
          }
        })
        .catch(error => console.log('error', error))
      setPayLoader(false)
    } else {
      handleFailedOpen();
    }
    setPayLoader(false)

  };

  const asyncStorageStore = async (userId) => {
    const body = {
      "type": "GET",
      "userId": userId,
    }
    const resp = await userInfoS3Store(body);
    if (resp?.statusCode === 200) {
      const user = resp?.body
      dispatch(setOrgId(user?.orgId))
      dispatch(setOrgName(user?.orgName))
      dispatch(setUser(user))
      dispatch(setIsSignIn(user?.isSignIn))
      dispatch(setIsAdmin(user?.isAdmin))
      return resp;
    }
  };

  const removeQueryParam = () => Router?.replace(pathNameBaseOnStage('/user/paymentClearance'), undefined, { shallow: true });

  React.useEffect(() => {
    if (Router?.query) {
      if (Router?.query?.trackId && Router?.query?.userId) {
        getPaymentStatus(Router.query?.trackId, Router?.query?.userId)
      }
    }

  }, [Router?.query]);

  return (<>
    <Head>
      <title>
        Bill Clearance
      </title>
    </Head>
    <Stack component="main" spacing={3} p={3} >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }} >
        <Box>
          <Typography variant="h5" component="div">
            Bill Clearance
          </Typography>
          <CButton onClick={() => goToPage('/user/paymentVerification')} title="Bill Verification" />
        </Box>
        <BBPSLogo />
      </Box>
      <TabContext value={batchTab}>
        <Card>
          <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeBatchTabs} >
            <Tab label={`Payment Batch`} value="0" />
            <Tab label={`Performa Invoice`} value="1" />
            <Tab label={`Deleted Batch`} value="2" />
          </TabList>
        </Card>
        <TabPanel sx={{ p: 0 }} value="0" >
          <NormalBatchTab goToPaymentPortal={goToPaymentPortal} isRefresh={isRefresh} batchType={""} />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value="1" >
          <CustomBatchTab goToPaymentPortal={goToPaymentPortal} isRefresh={isRefresh} />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value="2" >
          <DeletedBatchTab />
        </TabPanel>
      </TabContext>
      <Dialog open={successOpen}>
        <DialogTitle>Payment Status</DialogTitle>
        <DialogContent>
          <Stack px={2} style={{ alignItems: "center" }} spacing={3}  >
            <CheckCircleOutline sx={{ fontSize: 200, mx: 2 }} color='success' />
            <Typography>
              Successful Payment Done
            </Typography>
            <Button
              onClick={() => {
                handleSuccessClose()
                removeQueryParam()
                toggleRefresh()
              }} color='success'>OK</Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <Dialog open={failedOpen}>
        <DialogTitle>Payment Status</DialogTitle>
        <DialogContent>
          <Stack px={2} style={{ alignItems: "center" }} spacing={3}  >
            <Cancel sx={{ fontSize: 200, mx: 2 }} color='error' />
            <Typography>
              Failed Payment
            </Typography>
            <Button
              onClick={() => {
                handleFailedClose()
                removeQueryParam()
                toggleRefresh()
              }} color='success'>OK</Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <Dialog open={payLoader}>
        <DialogContent>
          <Stack justifyContent={"center"} sx={{ p: 10 }} spacing={3} alignItems={"center"}>
            <CircularProgress size={100} />
            <Box>
              <Typography variant='h3' >Please Wait...</Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  </>
  );
}

PaymentClearance.getLayout = (page) => (
  <DashboardLayoutUser>
    {page}
  </DashboardLayoutUser>
);

export default PaymentClearance;
