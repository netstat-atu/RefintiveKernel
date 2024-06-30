import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, Container, TextField, MenuItem, FormControl, Select, InputLabel, Typography, Button, Stack, Card, Divider, Grid, Chip, IconButton, Toolbar, Checkbox } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, Paper, TableRow, TableHead, TablePagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

//** service */
import { billerNameRequest, billerNameStates, downloadExcelFromAPI, downloadPdfZipFromAPI, getPaymentReceipt, pdfBillDownload, reportByFilter } from '../../utils/bbps/billerServices';

//** utils */
import { ddmmyy } from '../../utils/dateFormat';
import { isEmpty, amountFormat, ORG_ID_LIST } from '../../utils';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { formatDate } from '../../utils/dateFormat';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { BILLER_CATEGORY } from '../../utils';

//** redux */
import { useLoader } from '../../Provider/LoaderContext';

//** component */
import StyledTableRow from '../StyledTableRow';
import { Download, Receipt } from '@mui/icons-material';
import useAlertDialog from '../../hook/useAlertDialog';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BillPaidHistoryTable = () => {

  const { showLoader, hideLoader } = useLoader();
  const { orgId, userId, role } = useSelector(state => state.user)
  const dispatch = useDispatch();
  const alertDialog = useAlertDialog();

  const initialStateOfBody = {
    "orgId": orgId,
    "userId": "",
    "batchId": "",
    "consumerNumber": "",
    "billerName": "",
    "consumerName": "",
    "rowPerPage": 10,
    "pageNo": 0,
    "billDateFrom": "",
    "billDateTo": "",
    "billDueDateFrom": "",
    "billDueDateTo": "",
    "verifyDateFrom": "",
    "verifyDateTo": "",
    "paymentDateFrom": "",
    "paymentDateTo": "",
    "transactionDateFrom": "",
    "transactionDateTo": "",
    "stateName": "",
    "billerId": "",
    "txnReferenceId": "",

  };

  const [billerNameListData, setBillerNameListData] = React.useState([]);
  const [stateName, setStateName] = React.useState('');
  const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
  const [stateList, setStateList] = React.useState([]);
  const [billerName, setBillerName] = React.useState('');
  const [clearFlag, setClearFlag] = React.useState(false);
  const [dataLengthPaidHistory, setDataLengthPaidHistory] = React.useState(0);
  const [paidHistoryList, setPaidHistoryList] = React.useState([]);
  const [paymentAmountList, setPaymentAmountList] = React.useState([])
  const [selected, setSelected] = React.useState([]);
  const isSelected = (name) => selected.indexOf(name) !== -1;


  const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
  const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
  const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
  const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) })

  const openAlertHandle = (type = "success", message = "Message") => {
    dispatch(openAlertSnack({ type: type, message: message }))
  };

  const handleChangeStateName = async (event) => {
    setBillerName('');
    setFilterBody({ ...filterBody, [event.target.name]: event.target.value === "ALL" ? "" : event.target.value, "billerId": "", "billerName": "" });
    setStateName(event.target.value)
    billerNameRequest(BILLER_CATEGORY, event.target.value).then((data) => {
      if (data) {
        setBillerNameListData(data);
      }
    });
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
  };

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

  };

  const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },

    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: new Date().getFullYear(),
        data: paymentAmountList,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  const clearState = () => {
    setBillerName('')
    setStateName('')
    setFilterBody(initialStateOfBody);
    setClearFlag(!clearFlag)
  };

  const getSingleReport = async () => {
    showLoader()
    await reportByFilter({
      "type": "SingleReports",
      "data": filterBody,
      "reportType": "BILL_PAID_HISTORY"
    }).then((resp) => {
      if (resp !== undefined) {
        setPaidHistoryList(resp.data)
        setDataLengthPaidHistory(resp.Counts)
      }
    }).catch((error) => {
      console.log("🚀 ~ file: BillPaidHistoryTable.js:42 ~ getSingleReport ~ error:", error)
    }).finally(() => {
      hideLoader()
    })
  }

  const downloadExcel = async () => {
    try {
      const id = uuid().toUpperCase();
      const bodyFilter = {
        "type": "SingleReports",
        "data": filterBody,
        "reportType": "BILL_PAID_HISTORY",
        "role": role
      }
      const body = {
        "type": "CREATE",
        "id": id,
        "name": excelName.BILL_REPORT,
        "data": bodyFilter,
        "orgId": orgId,
        "userId": userId
      }
      await downloadExcelFromAPI(body);
      openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")

    } catch (error) {
      console.log("🚀 ~ file: billsFetched.js:170 ~ downloadExcel ~ error:", error)
    }

  };


  const getReports = async () => {
    showLoader()
    await reportByFilter({
      "type": "Reports",
      "data": filterBody
    }).then((resp) => {
      if (resp.length > 0) {
        setPaymentAmountList(resp)
      } else {
        setPaymentAmountList([])
      }
    }).catch((error) => {
      console.log("🚀 ~ file: reports.js:145 ~ getReports ~ error:", error)
    }).finally(() => {
      hideLoader()
    })
  };

  const pdfDownload = async (pdfLink) => {
    const body = {
      key: pdfLink
    }
    await pdfBillDownload(body).then((data) => {
      window.open(data)
    }).catch((error) => {
      console.log(error);
    })
  }

  const isReceiptButtonShow = () => {
    if (filterBody.batchId || filterBody.billDateFrom && filterBody.billDateTo || filterBody.billDueDateFrom && filterBody.billDueDateTo || filterBody.paymentDateFrom && filterBody.paymentDateTo || filterBody.transactionDateFrom && filterBody.transactionDateTo || filterBody.billerId || filterBody.consumerNumber) {
      return true
    }
    return false
  }

  const generatePaymentReceipt = async () => {

    showLoader()
    const body = {
      "type": "RECEIPT_GENERATE",
      "data": filterBody
    }
    await getPaymentReceipt(body).then((resp) => {
      if (resp?.statusCode == 200)
        openAlertHandle("success", "Successfully completed the receipt generation process.");
    }).catch((error) => {
      console.log("🚀 ~ file: ProcessBillTab.js:153 ~ await getPaymentReceipt ~ error:", error)
    }).finally(() => {
      hideLoader()
      console.log('finally :>> ');
      getSingleReport()

    });

  }
  const generateSelectBillReceipt = async () => {

    showLoader()
    const body = {
      "type": "START",
      "data": selected
    }
    await getPaymentReceipt(body).then((resp) => {
      if (resp?.statusCode == 200)
        openAlertHandle("success", "Successfully completed the receipt generation process.");
    }).catch((error) => {
      console.log("🚀 ~ file: ProcessBillTab.js:153 ~ await getPaymentReceipt ~ error:", error)
    }).finally(() => {
      setSelected([])
      hideLoader()
      console.log('finally :>> ');
      getSingleReport()
    });

  }

  const downloadPaymentPdfZip = async () => {
    try {
      const id = uuid().toUpperCase();
      const body = {
        "type": "CREATE_PAYMENT_PDF",
        "id": id,
        "zipName": "PDF-ZIP",
        "data": filterBody,
        "userId": userId,
        "orgId": orgId
      }
      downloadPdfZipFromAPI(body);
      openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")
    } catch (error) {
      console.log("🚀 ~ file: reports.js:258 ~ downloadPdfZip ~ error:", error)
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const nSelected = paidHistoryList;
      const newSelected = nSelected.map((n) => n.ID);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const EnhancedTableToolbar = (props) => {
    const { numSelected } = props;
    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          bgcolor: 'action.selected'
        }}
      >
        {numSelected > 0 ? (
          <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div" >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div" >
            Paid Bills
          </Typography>
        )}
        {numSelected > 0 ? (
          <IconButton onClick={() => {
            alertDialog({
              desc: "Are you sure you want to generate PDF ?",
              rightButtonText: "Okay",
              rightButtonFunction: generateSelectBillReceipt,
            })
          }} size='small' color='error' >
            <Chip label={"Generate PDF"} color={"warning"} variant='outlined' />
          </IconButton>
        ) : null}
      </Toolbar>
    );
  };

  React.useEffect(() => {
    getBillerName()
    getBillerStatesList()
    getSingleReport()
    getReports()
  }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo])



  return (
    <>
      <Head>
        <title>
          Bill Paid History
        </title>
      </Head>
      <Stack spacing={3}>
        <Card>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
            <Typography variant="h6" component="div">
              Choose Filters
            </Typography>
          </Box>
          <Divider />
          <Stack component={"form"}>
            <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <TextField fullWidth value={filterBody.batchId} size="small" onChange={onChangeHandle} name='batchId' id="outlined-basic" label="Batch Id" variant="outlined" />
              </Grid>
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
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="Bill Creation Date From"
                  value={filterBody.billDateFrom || null}
                  onChange={(e) => onChangeDate("billDateFrom", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="Bill Creation Date To"
                  value={filterBody.billDateTo || null}
                  onChange={(e) => onChangeDate("billDateTo", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="Due Date From"
                  value={filterBody.billDueDateFrom || null}
                  onChange={(e) => onChangeDate("billDueDateFrom", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="Due Date To"
                  value={filterBody.billDueDateTo || null}
                  onChange={(e) => onChangeDate("billDueDateTo", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="Client Paid Date From"
                  value={filterBody.paymentDateFrom || null}
                  onChange={(e) => onChangeDate("paymentDateFrom", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="Client Paid Date To"
                  value={filterBody.paymentDateTo || null}
                  onChange={(e) => onChangeDate("paymentDateTo", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="B2P Paid Date From"
                  value={filterBody.transactionDateFrom || null}
                  onChange={(e) => onChangeDate("transactionDateFrom", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <DatePicker
                  inputFormat="dd/MM/yyyy"
                  label="B2P Paid Date To"
                  value={filterBody.transactionDateTo || null}
                  onChange={(e) => onChangeDate("transactionDateTo", e)}
                  renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1} >
                <TextField fullWidth value={filterBody.txnReferenceId} size="small" onChange={onChangeHandle} name='txnReferenceId' id="outlined-basic" label="UTR" variant="outlined" />
              </Grid>
            </Grid>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={"space-between"} p={1} >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                <Button onClick={getSingleReport} variant="contained">Search Bill</Button>
                <Button onClick={clearState} type='reset' variant="contained" color='inherit'>Clear</Button>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                {isReceiptButtonShow() ?
                  <>
                    <Button startIcon={<Download />} onClick={downloadPaymentPdfZip} variant="contained">Download Receipt PDF Zip</Button>
                    <Button onClick={generatePaymentReceipt} variant="contained">Generate Receipt PDF</Button>
                  </>
                  : null}
                <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>
        <Card sx={{ p: 2 }}>
          <Line options={options} data={data} />
        </Card>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {
            selected.length ?
              <EnhancedTableToolbar numSelected={selected.length} /> : null
          }
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < paidHistoryList.length}
                      checked={paidHistoryList && selected.length === paidHistoryList.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell align="center">Batch Id</TableCell>
                  <TableCell align="center">Consumer No.</TableCell>
                  <TableCell align="center">Consumer Name</TableCell>
                  <TableCell align="center">Biller Name</TableCell>
                  <TableCell align="center">Bill Amount</TableCell>
                  <TableCell align="center">Convenience Fee</TableCell>
                  <TableCell align="center">GST Amount</TableCell>
                  <TableCell align="center">Bill Received Amount</TableCell>
                  <TableCell align="center">Total Amount Paid</TableCell>
                  <TableCell align="center">Bill Creation Date</TableCell>
                  <TableCell align="center">Due Date</TableCell>
                  <TableCell align="center">Client Paid Date</TableCell>
                  <TableCell align="center">Transaction ID</TableCell>
                  <TableCell align="center">B2P Paid Date</TableCell>
                  <TableCell align="center">Receipt PDF</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paidHistoryList && paidHistoryList.length > 0 && paidHistoryList.map((row, index) => {
                  const isItemSelected = isSelected(row.ID);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <StyledTableRow key={String(index) + String(row.ConsumerId)} >
                      <TableCell padding="checkbox">
                        <Checkbox
                          onClick={(event) => handleClick(event, row.ID)}
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">{isEmpty(row?.batchId)}</TableCell>
                      <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                      <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
                      <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
                      <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
                      <TableCell align="center">{amountFormat(row?.convFee)}</TableCell>
                      <TableCell align="center">{amountFormat(row?.gstAmount)}</TableCell>
                      <TableCell align="center">{amountFormat(row?.billReceivedAmount)}</TableCell>
                      <TableCell align="center">{amountFormat(row?.totalAmountPaid)}</TableCell>
                      <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
                      <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
                      <TableCell align="center">{ddmmyy(row?.PaymentDate)}</TableCell>
                      <TableCell align="center">{isEmpty(row?.txnReferenceId)}</TableCell>
                      <TableCell align="center">{ddmmyy(row?.TransactionDate)}</TableCell>
                      <TableCell align="center">{row?.paymentReceiptPdf ? <IconButton onClick={() => pdfDownload(row?.paymentReceiptPdf)}  ><Receipt /></IconButton> : "N/A"}</TableCell>
                      <TableCell align="center">
                        <Chip label={"Paid"} color={"primary"} variant="outlined" />
                      </TableCell>
                    </StyledTableRow>
                  )
                }
                )}

              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={-1}
            rowsPerPage={filterBody.rowPerPage}
            page={filterBody.pageNo}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Stack>
    </>
  )
}


export default BillPaidHistoryTable;

