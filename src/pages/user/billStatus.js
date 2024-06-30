import * as React from 'react';

//** next */
import Head from 'next/head';

//** mui */
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Card, Divider, TextField, TablePagination, Chip, FormControl, InputLabel, Select, MenuItem, Typography, Container, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** component */
import { DashboardLayoutUser } from '../../components/dashboard-layout-user';
import StyledTableRow from '../../components/StyledTableRow';
import BBPSLogo from '../../components/BBPSLogo';

//** redux */
import { useDispatch, useSelector } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** service */
import { billerNameRequest, billerNameStates, billStatusFilter, downloadExcelFromAPI } from '../../utils/bbps/billerServices';

//** npm */
import { v4 as uuid } from 'uuid';

//** icon */
import { Download } from '@mui/icons-material';

//** utils */
import { ddmmyy, formatDate, getMonthAndYear } from '../../utils/dateFormat';
import { excelName } from '../../utils/excelDownloadManagement';
import { isEmpty, amountFormat, BILLER_CATEGORY, convertToTitleCase } from '../../utils';

//** hook */
import { useLoader } from '../../Provider/LoaderContext';

const BillStatus = () => {
  const { showLoader, hideLoader } = useLoader();
  const { orgId, userId } = useSelector((state) => state.user);
  const { orgField } = useSelector((state) => state.extra);
  const dispatch = useDispatch();

  const initialStateOfBody = {
    "userId": userId,
    "orgId": orgId,
    "consumerNumber": "",
    "consumerName": "",
    "billerName": "",
    "billDateFrom": "",
    "billDateTo": "",
    "billDueDateFrom": "",
    "billDueDateTo": "",
    "billStatus": 0,
    "rowPerPage": 10,
    "pageNo": 0,
    "stateName": "",
    "billerId": "",
    "monthYear": getMonthAndYear()
  };

  const statusColor = {
    "Bill Not Fetched": "error",
    "In Process": "warning",
    "Paid": "success"
  };
  const [billStatusList, setBillStatusList] = React.useState([]);
  const [dataLength, setDataLength] = React.useState(0);
  const [billerNameListData, setBillerNameListData] = React.useState([]);
  const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
  const [stateName, setStateName] = React.useState('');
  const [billerName, setBillerName] = React.useState('');
  const [stateList, setStateList] = React.useState([]);

  const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
  const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
  const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });


  const openAlertHandle = (type = "success", message = "Message") => {
    dispatch(openAlertSnack({ type: type, message: message }))
  };

  const handleChangeBillerName = (event) => {
    setBillerName(event.target.value);
    let billerNameCode = event.target.value.split('/');
    setFilterBody({ ...filterBody, ["billerName"]: billerNameCode[1], ["billerId"]: billerNameCode[0] });

  };

  const getBillerStatesList = async () => {
    await billerNameStates().then((resp) => {
      if (resp?.length > 0) {
        setStateList([{ stateName: "All" }, ...resp])
      } else {
        setStateList([])
      }
    }).catch((error) => {
      console.log("🚀 ~ file: billStatus.js:120 ~ await billerNameStates ~ error:", error)
      setStateList([])
    });
  }


  const getBillerName = async () => {
    await billerNameRequest(BILLER_CATEGORY).then((resp) => {
      if (resp?.length > 0) {
        setBillerNameListData(resp);
      } else {
        setBillerNameListData([]);
      }
    }).catch((error) => {
      console.log("🚀 ~ file: billStatus.js:156 ~ await billerNameRequest ~ error:", error);
      setBillerNameListData([]);
    });

  }

  const handleChangeStateName = async (event) => {
    showLoader();
    setBillerName('');
    setFilterBody({ ...filterBody, [event.target.name]: event.target.value === "ALL" ? "" : event.target.value, "billerId": "", "billerName": "" });
    setStateName(event.target.value)
    await billerNameRequest(BILLER_CATEGORY, event.target.value).then((resp) => {
      if (resp?.length > 0) {
        setBillerNameListData(resp);
      } else {
        setBillerNameListData([]);
      }
    }).catch((error) => {
      console.log("🚀 ~ file: billStatus.js:145 ~ billerNameRequest ~ error:", error)
      setBillerNameListData([]);
    }).finally(() => {
      hideLoader();
    });
  };

  const getBillStatus = async () => {
    showLoader();
    await getBillerStatesList();
    await billStatusFilter(filterBody).then((resp) => {
      if (resp?.data) {
        setBillStatusList(resp?.data);
        setDataLength(resp?.Counts);
      }
    }).catch((error) => {
      console.log("🚀 ~ file: billStatus.js:177 ~ await billStatusFilter ~ error:", error);
    }).finally(() => {
      hideLoader()
    })
  }

  const clearStatus = () => {
    setBillerName("");
    setStateName("");
    setFilterBody(initialStateOfBody)
    getBillStatus();
    getBillerName();
  }

  const downloadExcel = async () => {
    try {
      const id = uuid().toUpperCase();
      const body = {
        "type": "CREATE",
        "id": id,
        "name": excelName.BILL_STATUS,
        "data": filterBody,
        "orgId": orgId,
        "userId": userId
      }
      await downloadExcelFromAPI(body);
      openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")
    } catch (error) {
      console.log("🚀 ~ file: billPayment.js:258 ~ downloadExcel ~ error:", error)
    }
  };

  React.useEffect(() => {
    getBillerName();
  }, []);

  React.useEffect(() => {
    getBillStatus()
  }, [filterBody.rowPerPage, filterBody.pageNo]);

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
            Bill Status
          </Typography>
          <BBPSLogo />
        </Box>
        <Card>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }}>
            <Typography variant="h6"
              component="div">
              Choose Filters
            </Typography>
          </Box>
          <Divider />
          <Stack component="form"  >
            <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <TextField fullWidth value={filterBody.consumerNumber} size="small" onChange={onChangeHandle} name='consumerNumber' id="outlined-basic" label="Consumer Number" variant="outlined" />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <FormControl size="small" fullWidth>
                  <InputLabel id="singleBillerNameLabel">Select State</InputLabel>
                  <Select
                    required
                    labelId="singleBillerNameLabel"
                    id="singleBillerName"
                    value={stateName}
                    label="Select State"
                    name="stateName"
                    onChange={handleChangeStateName}
                  >
                    {stateList.length > 0 ? stateList.sort((a, b) => a.stateName > b.stateName ? 1 : -1).map((val, index) => {
                      return (<MenuItem key={`${index + 15}`} value={val.stateName}>{val.stateName}</MenuItem>)
                    }) : null
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <FormControl fullWidth size='small'>
                  <InputLabel id="bulkBillerNameLabel">Select Biller Name</InputLabel>
                  <Select
                    label="Select Biller Name"
                    id="bulkBillerName"
                    name='billerName'
                    value={billerName}
                    onChange={handleChangeBillerName}
                  >
                    {billerNameListData.length > 0 ? billerNameListData.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                      return (<MenuItem key={`${index + 15}`} value={val.billerId + '/' + val.billerName}>{val.billerName}</MenuItem>)
                    }) : null
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <FormControl size='small' fullWidth>
                  <InputLabel id="demo-simple-select-label">Bill Status</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={filterBody.billStatus}
                    label="billStatus"
                    name='billStatus'
                    onChange={onChangeHandle}
                  >
                    <MenuItem value={0}>All Bill </MenuItem>
                    <MenuItem value={1}>Not Fetched Bill</MenuItem>
                    <MenuItem value={2}>In Process Bill</MenuItem>
                    <MenuItem value={3}>Paid Bill</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                if (field?.filterFlag === 1) {
                  if (field?.fieldType === "char") {
                    return <Grid key={index} item xs={2} sm={4} md={4} p={1} >
                      <TextField
                        key={field?.fieldId}
                        fullWidth
                        size="small"
                        id="outlined-basic"
                        label={convertToTitleCase(field?.fieldName)}
                        name={field.fieldName}
                        value={filterBody[field?.fieldName]}
                        onChange={onChangeHandle}
                        variant="outlined"
                      />
                    </Grid>
                  }
                }
              }) : null}
            </Grid>
            <Stack justifyContent={'space-between'} spacing={3} direction={{ xs: 'column', sm: 'row' }} p={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} >
                <Button onClick={getBillStatus} variant="contained">Search Bill</Button>
                <Button type='reset' onClick={clearStatus} color='inherit' variant="contained">Clear</Button>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} >
                <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Consumer No.</TableCell>
                  <TableCell align="center">Consumer Name</TableCell>
                  {orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                    if (field?.filterFlag === 1) {
                      if (field?.fieldType === "char") {
                        return <TableCell key={index} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                      }
                    }
                  }) : null}
                  <TableCell align="center">Biller Name</TableCell>
                  <TableCell align="center">Bill Amount</TableCell>
                  <TableCell align="center">Tentative Bill Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billStatusList && billStatusList?.map((row, index) => {
                  const varDate = row?.TentativeBillDate ? new Date(row?.TentativeBillDate) : null;
                  const today = new Date();
                  const colorRow = row.Status === "Paid" ? null : varDate ? (today > varDate) ? "#FED8B1" : null : null;
                  return (
                    <StyledTableRow key={row.ConsumerId.toString() + index.toString()} color={colorRow}>
                      <TableCell align="center">{isEmpty(row.ConsumerId)}</TableCell>
                      <TableCell align="center">{isEmpty(row.ConsumerName)}</TableCell>
                      {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                        if (field?.filterFlag === 1) {
                          if (field?.fieldType === "char") {
                            return <TableCell key={index} align="center">{isEmpty(row[field?.fieldName])}</TableCell>
                          }
                        }
                      }) : null}
                      <TableCell align="center">{isEmpty(row.BillerName)}</TableCell>
                      <TableCell align="center">{amountFormat(row.amount)}</TableCell>
                      <TableCell align="center">{ddmmyy(row.TentativeBillDate)}</TableCell>
                      <TableCell align="center">
                        <Chip variant='outlined' label={isEmpty(row.Status)} color={statusColor[row.Status]} />
                      </TableCell>
                    </StyledTableRow>
                  )
                }
                )
                }
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 30, 50, 100]}
            component="div"
            count={dataLength}
            rowsPerPage={filterBody.rowPerPage}
            page={filterBody.pageNo}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
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