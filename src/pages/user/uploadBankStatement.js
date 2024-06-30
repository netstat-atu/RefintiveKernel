import * as React from 'react';

//** next */
import Head from 'next/head';

//** mui */
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Card, Divider, TextField, TablePagination, Chip, FormControl, InputLabel, Select, MenuItem, Typography, Container, Grid, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** component */
import { DashboardLayoutUser } from '../../components/dashboard-layout-user';
import StyledTableRow from '../../components/StyledTableRow';
import BBPSLogo from '../../components/BBPSLogo';

//** redux */
import { useDispatch, useSelector } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** service */
import { billerNameRequest, billerNameStates, billStatusFilter, downloadExcelFromAPI, kotakFileUpload, statementUpload } from '../../utils/bbps/billerServices';

//** npm */
import { v4 as uuid } from 'uuid';

//** icon */
import { Download } from '@mui/icons-material';

//** utils */
// import { ddmmyy, formatDate, getMonthAndYear } from '../../utils/dateFormat';
// import { excelName } from '../../utils/excelDownloadManagement';
// import { isEmpty, amountFormat, BILLER_CATEGORY, convertToTitleCase } from '../../utils';

//** hook */
import { useLoader } from '../../Provider/LoaderContext';
import DropzoneComponent from '../../components/DropzoneComponent';

const BillStatus = () => {
  const { showLoader, hideLoader } = useLoader();
    const [radioValue, setRadioValue] = React.useState('kotak');

  const handleChange = (event) => {
    setRadioValue(event.target.value);
  };

  const dispatch = useDispatch();

  const openAlertHandle = (type, message ) => {
    dispatch(openAlertSnack({ type: type, message: message }))
  };



  const handleFileData =async (fileData) => {
    // console.log("Received binary data from child component:", fileData);
    // Handle the binary data as needed
        showLoader();
    await statementUpload(fileData,radioValue,openAlertHandle)
      .then((resp) => {
                         hideLoader();
      })
      .catch((error) => {
        console.log(error)
        console.log("🚀 ~ file: uploadStatementCall.js:62 ~ await uploadKotakFile ~ error:", error);
                     hideLoader();
      })
      .finally(() => {
        hideLoader();
      });
      hideLoader();

  };

  return (
    <>
      <Head>
        <title>
          Bill Status
        </title>
      </Head>
      <Stack component="main" p={3} spacing={3}  >
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }} >
          <Typography variant="h5"
            component="div">
           Upload Bank Statement
          </Typography>
          <BBPSLogo />
        </Box>
        <Paper>
            <Box sx={{padding:3}}>
<Typography sx={{fontSize:"16px"}}>Select Report Type</Typography>
  <div style={{ display: 'flex', paddingTop:'10px'}}>
      <FormControl style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '20px' }}>
        <RadioGroup
          aria-labelledby="upload_radios"
          name="upload-radio-buttons-group"
          value={radioValue}
          onChange={handleChange}
          row
        >
          <FormControlLabel value="kotak" control={<Radio />} label="Kotak (CSV)" />
          <FormControlLabel value="icici" control={<Radio />} label="Icici (Excel)" />
        </RadioGroup>
      </FormControl>
    </div>
      <DropzoneComponent validation={radioValue} onFileRead={handleFileData}/>
            </Box>
        </Paper>
        <Card>
        </Card>
      </Stack>
    </>
  )
};

BillStatus.getLayout = (page) => (
  <DashboardLayoutUser>
    {page}
  </DashboardLayoutUser>
);

export default BillStatus;