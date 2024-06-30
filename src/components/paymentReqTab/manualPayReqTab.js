import React from "react";
//** next */
import Head from "next/head";
// ** components
import StyledTableRow from "../../components/StyledTableRow";

//** mui */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Paper,
  TableRow,
  Button,
  Box,
  Card,
  CardActions,
  CardHeader,
  Chip,
  Divider,
  Stack,
  TablePagination,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  Tab,
  Grid,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

//** icon */

//** npm */
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";

import paymentData from '../../json/payment-request-manual.json'
//** service */
import {
  billerNameRequest,
  billerNameStates,
  bulkBillUploadAPI,
  downloadExcelFromAPI,
  payRequestList,
} from "../../utils/bbps/billerServices";

//** utils */
import { excelName } from "../../utils/excelDownloadManagement";
import { ddmmyy, formatDate, yyyymmdd } from "../../utils/dateFormat";
import { isEmpty, amountFormat, BILLER_CATEGORY } from "../../utils";

//** hook */
import { openAlertSnack } from "../../redux/slice/alertSnackSlice";
import useAlertDialog from "../../hook/useAlertDialog";
import { useLoader } from "../../Provider/LoaderContext";
import CustomModal from "../../components/CustomModal";
import { excelTemplateName } from "../../utils/excelDownloadManagement/excelName";
import ManualBillPaymentTable from "./manualBillPaymentTable";
import { singlePayRequestBill, singleRetryRequestBill } from "../../utils/bbps/singlePayRequestBill";
import { Download } from "@mui/icons-material";

const ManualPayReqTab = () => {
  const { showLoader, hideLoader } = useLoader();
  const { orgId, userId } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const alertDialog = useAlertDialog();

  const initialStateOfBody = {
    orgId: orgId,
    userId: "",
    consumerNumber: "",
    consumerName: "",
    stateName: "",
    billerId: "",
    clientTrackId: "",
    billDateFrom: "",
    billDateTo: "",
    billDueDateFrom: "",
    billDueDateTo: "",
    paymentDateFrom: "",
    paymentDateTo: "",
    rowPerPage: 10,
    pageNo: 0,
    payStatus: "ALL",
    payType: "ALL",
  };

  const [isPayModal, setIsPayModal] = React.useState(false);
  const [billBatch, setBillBatch] = React.useState([]);
  const [nonBillBatch, setNonBillBatch] = React.useState([]);
  const [isModal, setIsModal] = React.useState(false);
  const [dataLength, setDataLength] = React.useState(0);
  const [nonDataLength, setNonDataLength] = React.useState(0);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [selected, setSelected] = React.useState([]);
  const [paymentResponseList, setPaymentResponseList] = React.useState([]);
  const [clearFlag, setClearFlag] = React.useState(false);
  const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
  const [billPage, setBillPage] = React.useState(0);
  const [billRowsPerPage, setBillRowsPerPage] = React.useState(4);
  const [stateList, setStateList] = React.useState([]);
  const [stateName, setStateName] = React.useState("");
  const [billerNameListData, setBillerNameListData] = React.useState([]);
  const [billerName, setBillerName] = React.useState("");
  const [value, setValue] = React.useState("1");
  const [selectedFile, setSelectedFile] = React.useState("");
  const [selectedBillExcelList, setSelectedBillExcelList] = React.useState([]);
  const [isVerify, setIsVerify] = React.useState(false);
  const [payTabValue, setPayTabValue] = React.useState("0");
  const [payModeValue, setPayModeValue] = React.useState("Kotak");
  const [failedExcelVerificationBill, setFailedExcelVerificationBill] =
    React.useState([]);
  const [billUTRPage, setBillUTRPage] = React.useState(0);
  const [billUTRRowsPerPage, setBillUTRRowsPerPage] = React.useState(4);

  const handleChangeBillUTRRowsPerPage = (event) => {
    setBillUTRRowsPerPage(+event.target.value);
    setBillUTRPage(0);
  };

  const handleChangeBillUTRPage = (event, newPage) => setBillUTRPage(newPage);
  const openModalIsVerify = () => setIsVerify(true);
  const closeModalIsVerify = () => setIsVerify(false);
  const openAlertHandle = (type = "success", message = "Message") => {
    dispatch(openAlertSnack({ type: type, message: message }));
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;
  const openModal = () => setIsModal(true);
  const closeModal = () => setIsModal(false);

  const handleChangeTabs = (event, newValue) => {
    setValue(newValue);
    setFilterBody({ ...filterBody, pageNo: 0, rowPerPage: 10 });
  };

  const handleChangePayTabs = (event, newValue) => {
    setPayTabValue(newValue);
  };

  const handleChangeBillerName = (event) => {
    setBillerName(event.target.value);
    let billerNameCode = event.target.value.split("/");
    setFilterBody({
      ...filterBody,
      ["billerName"]: billerNameCode[1],
      ["billerId"]: billerNameCode[0],
    });
  };

  const onChangeHandle = (e) =>
    setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
  const onChangeDate = (name, value) =>
    setFilterBody({ ...filterBody, [name]: formatDate(value) });
  const onChangeSelectHandle = async (e) =>
    setFilterBody({ ...filterBody, payStatus: e.target.value });
  const onChangePaySelectHandle = (e) => setPayModeValue(e.target.value);

  const handleChangeStateName = async (event) => {
    setBillerName("");
    setFilterBody({
      ...filterBody,
      [event.target.name]:
        event.target.value === "ALL" ? "" : event.target.value,
      billerId: "",
      billerName: "",
    });
    setStateName(event.target.value);
    billerNameRequest(BILLER_CATEGORY, event.target.value).then((data) => {
      if (data) {
        setBillerNameListData(data);
      }
    });
  };

  const handleChangeBillRowsPerPage = (event) => {
    setBillRowsPerPage(+event.target.value);
    setBillPage(0);
  };
  const handleChangeBillPage = (event, newPage) => setBillPage(newPage);

  const handleChangePage = async (event, newPage) =>
    setFilterBody({ ...filterBody, pageNo: newPage });
  const handleChangeRowsPerPage = (event) =>
    setFilterBody({ ...filterBody, rowPerPage: event.target.value });

  const getBillerStatesList = async () => {
    await billerNameStates()
      .then((resp) => {
        if (resp?.length > 0) {
          setStateList([{ stateName: "All" }, ...resp]);
        } else {
          setStateList([]);
        }
      })
      .catch((error) => {
        console.log(
          "🚀 ~ file: billStatus.js:120 ~ await billerNameStates ~ error:",
          error
        );
        setStateList([]);
      });
  };

  const handlePayment = async () => {
    showLoader();
    await singlePayRequestBill(selected).then((resp) => {
      setPaymentResponseList(resp);
      openModal();
    })
      .catch((error) => {
        console.log(
          "🚀 ~ file: billPayment.js:161 ~ await singlePaymentBill ~ error:",
          error
        );
      })
      .finally(() => {
        setSelected([]);
        setTotalAmount(0);
        hideLoader();
      });
  };
  const handleRetry = async () => {
    showLoader();
    await singleRetryRequestBill(selected).then((resp) => {
    }).catch((error) => {
      console.log('error', error)
    })
      .finally(() => {
        setSelected([]);
        setTotalAmount(0);
        getBillPayList();
        hideLoader();
      });
  };


  const handleRetryOpen = () => {
    alertDialog({
      rightButtonFunction: () => handleRetry(),
      title: "Are you sure? update refId",
      desc: `No Of Bill:  ${selected?.length},Total Amount: ${amountFormat(totalAmount)}`,
      leftButtonText: "Cancel",
      rightButtonText: "Update",
    })
  }
  const handlePayOpen = () => {
    alertDialog({
      rightButtonFunction: () => handlePayment(),
      title: "Are you sure? payment",
      desc: `No Of Bill:  ${selected?.length},Total Amount: ${amountFormat(totalAmount)}`,
      leftButtonText: "Cancel",
      rightButtonText: "Pay",
    })
  }


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
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event, billListTable) => {
    if (event.target.checked) {
      let amount = 0;
      billListTable.map((row) => {
        amount += Number(row?.amount);
      });
      setTotalAmount(amount);
      setSelected(billListTable);
      return;
    }
    setTotalAmount(0);
    setSelected([]);
  };

  const getBillPayList = async () => {
    showLoader();
    try {
      const body = { "type": "MANUAL_PAYMENT_REQUEST", "data": filterBody }
      const resp = await payRequestList(body)
      if (resp.statusCode == 200) {
        const { fetchBill, nonFetchBill } = resp?.body;
        setBillBatch(fetchBill?.data);
        setDataLength(fetchBill?.Counts);
        setNonBillBatch(nonFetchBill?.data);
        setNonDataLength(nonFetchBill?.Counts);
      }
    } catch (error) {
      console.log('error', error)
    }
    hideLoader()
  };

  const downloadExcel = async () => {
    try {
      const id = uuid().toUpperCase();
      const body = {
        type: "CREATE",
        id: id,
        name: excelName.BILL_PAYMENT_REQUEST,
        data: { ...filterBody, ["fetchType"]: value },
        orgId: orgId,
        userId: userId,
      };
      await downloadExcelFromAPI(body);
      openAlertHandle(
        "success",
        "Check the download status in the Download Manager for the task in progress."
      );
    } catch (error) {
      console.log("🚀 ~ file: billPayment.js:258 ~ downloadExcel ~ error:", error);
    }
  };

  const handleUpdateUTROpen = () => {
    alertDialog({
      rightButtonFunction: () => billStatusUpdate(),
      title: "Are you sure? update UTR",
      desc: `No Of Bill:  ${selectedBillExcelList.length}`,
      leftButtonText: "Cancel",
      rightButtonText: "Update",
    });
  };

  const processSelectedBillExcelList = (list) => {
    return new Promise((resolve) => {
      const newData = list.map((e) => {
        if (
          e.AdminPaidAmount === "" ||
          e.AdminPaidAmount === null ||
          e.AdminPaidAmount === undefined
        ) {
          e["VerifyStatus"] = 1;
          e["Body"] = "Please fill the AdminPaidAmount";
        } else if (!e.TxnReferenceId || !e.TransactionDate) {
          e["VerifyStatus"] = 1;
          e["Body"] = "Please fill TxnReferenceId and TransactionDate";
        } else {
          e["VerifyStatus"] = 0;
          e["Body"] = "Valid";
        }
        return e;
      });

      resolve(newData);
    });
  };


  const billStatusUpdate = async () => {
    showLoader();
    const body = {
      type: "UPDATE_BILL",
      orgId: orgId,
      userId: userId,
      data: selectedBillExcelList,
    };
    await bulkBillUploadAPI(body)
      .then((resp) => {
        if (resp?.statusCode === 200) {
          openAlertHandle("success", resp?.data);
        } else {
          openAlertHandle("error", "Failed Bill Update");
        }
        clearState();
      })
      .catch((error) => {
        console.log(
          "🚀 ~ file: billPayment.js:270 ~ await bulkBillUploadAPI ~ error:",
          error
        );
        openAlertHandle(
          "error",
          "Failed Bill Update ! " + JSON.stringify(error)
        );
      })
      .finally(() => {
        hideLoader();
        closeModalIsVerify();
      });
  };

  const onFileChange = (e) => {
    e.preventDefault();
    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (json.length > 0) {
          console.log(
            "🚀 ~ file: billPayment.js:321 ~ reader.onload= ~ json:",
            json
          );
          setSelectedBillExcelList(json);
        } else {
          openAlertHandle("error", "Please Insert Data");
        }
      };
      if (reader && e.target.files[0]) reader?.readAsArrayBuffer(e.target.files[0]);
    }
    setSelectedFile(e.target.files[0]);
  };

  const downloadFailedBillExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(failedExcelVerificationBill);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      excelName.BILL_UPDATE_UTR_FAILED_LIST
    );
    XLSX.writeFile(
      workbook,
      `${excelTemplateName(excelName.BILL_UPDATE_UTR_FAILED_LIST)}`
    );
  };
  const clearState = () => {
    setSelected([]);
    setTotalAmount(0);
    setSelectedBillExcelList([]);
    setSelectedFile(null);
    setBillerName("");
    setStateName("");
    setFilterBody(initialStateOfBody);
    setClearFlag(!clearFlag);
  };

  React.useEffect(() => {
    getBillerStatesList();
  }, []);

  React.useEffect(() => {
    getBillPayList();
  }, [
    clearFlag,
    filterBody.rowPerPage,
    filterBody.pageNo,
    filterBody.payStatus,
  ]);

  const ModalRow = ({ row, index }) => {
    const statusLabel = {
      1: "Failure",
      0: "Success",
    };
    const statusColor = {
      1: "error",
      0: "success",
    };

    return (
      <StyledTableRow key={index}>
        <TableCell align="center">
          <Chip
            label={statusLabel[row?.billPaymentStatus?.status]}
            color={statusColor[row?.billPaymentStatus?.status]}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">{row?.billPaymentStatus?.reason}</TableCell>
        <TableCell align="center">
          {isEmpty(row?.billPaymentStatus?.txnId)}
        </TableCell>
        <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
        <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
        <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
        <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
        <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
      </StyledTableRow>
    );
  };
  const ModalVerifyBillRow = ({ row, index }) => {
    const statusLabel = {
      1: "Failure",
      0: "Success",
    };
    const statusColor = {
      1: "error",
      0: "success",
    };

    return (
      <StyledTableRow key={index}>
        <TableCell align="center">
          <Chip
            label={statusLabel[row?.VerifyStatus]}
            color={statusColor[row?.VerifyStatus]}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="center">{row?.Body}</TableCell>
        <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
        <TableCell align="center">{isEmpty(row?.TxnReferenceId)}</TableCell>
        <TableCell align="center">{isEmpty(row?.AdminPaidAmount)}</TableCell>
        <TableCell align="center">{yyyymmdd(row?.TransactionDate)}</TableCell>
      </StyledTableRow>
    );
  };

  return (
    <>
      <Head>
        <title>B2P Payment Request</title>
      </Head>
      <Stack>
        <Stack spacing={3}>
          <Card>
            <Box sx={{ display: "flex", justifyContent: "flex-start", p: 2 }}>
              <Typography variant="h6" component="div">
                Choose Filters
              </Typography>
            </Box>
            <Divider />
            <Stack>
              <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="demo-simple-select-label">
                      Choose Pay Status
                    </InputLabel>
                    <Select
                      onChange={onChangeSelectHandle}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={filterBody.payStatus}
                      label="Choose Pay Status"
                    >
                      <MenuItem value={"ALL"}>ALL</MenuItem>
                      <MenuItem value={"PENDING"}>Recharge Pending</MenuItem>
                      <MenuItem value={"SUCCESS"}>Recharge Success</MenuItem>
                      <MenuItem value={"FAILURE"}>Recharge Failure </MenuItem>
                      <MenuItem value={"TXN_LOCK"}>Txn Lock Bills</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <TextField
                    fullWidth
                    value={filterBody.clientTrackId}
                    size="small"
                    onChange={onChangeHandle}
                    name="clientTrackId"
                    id="outlined-basic"
                    label="QEB No."
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <TextField
                    fullWidth
                    value={filterBody.consumerNumber}
                    size="small"
                    onChange={onChangeHandle}
                    name="consumerNumber"
                    id="outlined-basic"
                    label="Consumer Number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="singleBillerNameLabel">
                      Select State
                    </InputLabel>
                    <Select
                      required
                      labelId="singleBillerNameLabel"
                      id="singleBillerName"
                      value={stateName}
                      label="Select State"
                      name="stateName"
                      onChange={handleChangeStateName}
                    >
                      {stateList.length > 0
                        ? stateList
                          .sort((a, b) =>
                            a.stateName > b.stateName ? 1 : -1
                          )
                          .map((val, index) => {
                            return (
                              <MenuItem
                                key={`${index + 15}`}
                                value={val.stateName}
                              >
                                {val.stateName}
                              </MenuItem>
                            );
                          })
                        : null}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="bulkBillerNameLabel">
                      Select Biller Name
                    </InputLabel>
                    <Select
                      label="Select Biller Name"
                      id="bulkBillerName"
                      name="billerName"
                      value={billerName}
                      onChange={handleChangeBillerName}
                    >
                      {billerNameListData.length > 0
                        ? billerNameListData
                          .sort((a, b) =>
                            a.billerName > b.billerName ? 1 : -1
                          )
                          .map((val, index) => {
                            return (
                              <MenuItem
                                key={`${index + 15}`}
                                value={val.billerId + "/" + val.billerName}
                              >
                                {val.billerName}
                              </MenuItem>
                            );
                          })
                        : null}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <DatePicker
                    inputFormat="dd/MM/yyyy"
                    label="Bill Creation Date From"
                    value={filterBody.billDateFrom || null}
                    onChange={(e) => onChangeDate("billDateFrom", e)}
                    renderInput={(params) => (
                      <TextField
                        disabled
                        fullWidth
                        size="small"
                        {...params}
                        helperText={null}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={2} sm={4} md={4} p={1}>
                  <DatePicker
                    inputFormat="dd/MM/yyyy"
                    label="Bill Creation Date To"
                    value={filterBody.billDateTo || null}
                    onChange={(e) => onChangeDate("billDateTo", e)}
                    renderInput={(params) => (
                      <TextField
                        disabled
                        fullWidth
                        size="small"
                        {...params}
                        helperText={null}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <DatePicker
                    inputFormat="dd/MM/yyyy"
                    label="Due Date From"
                    value={filterBody.billDueDateFrom || null}
                    onChange={(e) => onChangeDate("billDueDateFrom", e)}
                    renderInput={(params) => (
                      <TextField
                        disabled
                        fullWidth
                        size="small"
                        {...params}
                        helperText={null}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <DatePicker
                    inputFormat="dd/MM/yyyy"
                    label="Due Date To"
                    value={filterBody.billDueDateTo || null}
                    onChange={(e) => onChangeDate("billDueDateTo", e)}
                    renderInput={(params) => (
                      <TextField
                        disabled
                        fullWidth
                        size="small"
                        {...params}
                        helperText={null}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={2} sm={4} md={4} p={1}>
                  <DatePicker
                    inputFormat="dd/MM/yyyy"
                    label="Payment Date From"
                    value={filterBody.paymentDateFrom || null}
                    onChange={(e) => onChangeDate("paymentDateFrom", e)}
                    renderInput={(params) => (
                      <TextField
                        disabled
                        fullWidth
                        size="small"
                        {...params}
                        helperText={null}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2} sm={4} md={4} p={1}>
                  <DatePicker
                    inputFormat="dd/MM/yyyy"
                    label="Payment Date To"
                    value={filterBody.paymentDateTo || null}
                    onChange={(e) => onChangeDate("paymentDateTo", e)}
                    renderInput={(params) => (
                      <TextField
                        disabled
                        fullWidth
                        size="small"
                        {...params}
                        helperText={null}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent={"space-between"}
                p={1}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button onClick={getBillPayList} variant="contained">
                    Search Bill
                  </Button>
                  <Button
                    onClick={clearState}
                    variant="contained"
                    color="inherit"
                  >
                    Clear
                  </Button>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    startIcon={<Download />}
                    onClick={downloadExcel}
                    variant="contained"
                  >
                    Download Bill
                  </Button>
                  {/* <Button
                    startIcon={<Upload />}
                    variant="outlined"
                    component="label"
                  >
                    {selectedFile
                      ? selectedFile?.name
                      : "Upload Update Bills File"}
                    <input
                      accept=".xls,.xlsx,.csv"
                      onChange={onFileChange}
                      type="file"
                      hidden
                    />
                  </Button>
                  {selectedFile && selectedBillExcelList.length > 0 ? (
                    <Button
                      variant="contained"
                      component="label"
                      onClick={verifyBillForUpdate}
                    >
                      Verify
                    </Button>
                  ) : null} */}
                </Stack>
              </Stack>
            </Stack>
          </Card>
          <TabContext value={value}>
            <Card>
              <TabList
                variant="scrollable"
                allowScrollButtonsMobile
                onChange={handleChangeTabs}
              >
                <Tab label={`Fetch Bills (${dataLength})`} value="1" />
                <Tab label={`Non-Fetch Bills (${nonDataLength})`} value="2" />
              </TabList>
            </Card>
            <TabPanel sx={{ p: 0 }} value="1">
              <ManualBillPaymentTable
                handleClick={handleClick}
                handleSelectAllClick={handleSelectAllClick}
                billList={billBatch}
                dataLength={dataLength}
                filterBody={filterBody}
                selected={selected}
                isSelected={isSelected}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                clearState={clearState}
                handlePayOpen={handlePayOpen}
                handleRetryOpen={handleRetryOpen}
                setTotalAmount={setTotalAmount}
                totalAmount={totalAmount}
                key={"1"}
              />

            </TabPanel>
            <TabPanel sx={{ p: 0 }} value="2">
              <ManualBillPaymentTable
                handleClick={handleClick}
                handleSelectAllClick={handleSelectAllClick}
                billList={nonBillBatch}
                dataLength={nonDataLength}
                filterBody={filterBody}
                selected={selected}
                isSelected={isSelected}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                clearState={clearState}
                handlePayOpen={handlePayOpen}
                handleRetryOpen={handleRetryOpen}
                setTotalAmount={setTotalAmount}
                totalAmount={totalAmount}
                key={"2"}
              />
            </TabPanel>
          </TabContext>
        </Stack>
        <CustomModal open={isModal}>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <CardHeader title="Paid Bill Details" />
            <TableContainer>
              <Table
                size="medium"
                sx={{ minWidth: 650 }}
                aria-label="a Table dense table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Reason</TableCell>
                    <TableCell align="center">Txn Reference Id</TableCell>
                    <TableCell align="center">Consumer No.</TableCell>
                    <TableCell align="center">Consumer Name</TableCell>
                    <TableCell align="center">Amount</TableCell>
                    <TableCell align="center">Bill Creation Date</TableCell>
                    <TableCell align="center">Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentResponseList &&
                    paymentResponseList
                      ?.slice(
                        billPage * billRowsPerPage,
                        billPage * billRowsPerPage + billRowsPerPage
                      )
                      .map((row, index) => (
                        <ModalRow key={index} row={row} index={index} />
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[3, 10, 20, 50]}
              component="div"
              count={paymentResponseList?.length}
              rowsPerPage={billRowsPerPage}
              page={billPage}
              onPageChange={handleChangeBillPage}
              onRowsPerPageChange={handleChangeBillRowsPerPage}
            />
            <CardActions>
              <Button variant="outlined" onClick={() => {
                getBillPayList();
                closeModal()
              }}>
                Close
              </Button>
            </CardActions>
          </Paper>
        </CustomModal>
        <CustomModal open={isVerify}>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <CardHeader title="Verify Bill For Update UTR" />
            {failedExcelVerificationBill &&
              failedExcelVerificationBill.length > 0 ? (
              <>
                <TableContainer>
                  <Table
                    size="medium"
                    sx={{ minWidth: 650 }}
                    aria-label="a dense table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Reason</TableCell>
                        <TableCell align="center">Batch Id</TableCell>
                        <TableCell align="center">Consumer No.</TableCell>
                        <TableCell align="center">Admin Paid Amount</TableCell>
                        <TableCell align="center">TxnReferenceId</TableCell>
                        <TableCell align="center">Transaction Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {failedExcelVerificationBill
                        .slice(
                          billUTRPage * billUTRRowsPerPage,
                          billUTRPage * billUTRRowsPerPage + billUTRRowsPerPage
                        )
                        .map((row, index) => {
                          return (
                            <ModalVerifyBillRow
                              key={String(row?.ConsumerId) + String(index)}
                              row={row}
                              index={index}
                            />
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[4, 10, 20, 50]}
                  component="div"
                  count={failedExcelVerificationBill.length}
                  rowsPerPage={billUTRRowsPerPage}
                  page={billUTRPage}
                  onPageChange={handleChangeBillUTRPage}
                  onRowsPerPageChange={handleChangeBillUTRRowsPerPage}
                />
                <CardActions>
                  <Button variant="outlined" onClick={downloadFailedBillExcel}>
                    Download Failed Bills
                  </Button>
                </CardActions>
              </>
            ) : null}
            {selectedBillExcelList && selectedBillExcelList?.length > 0 ? (
              <>
                <Typography mx={2}>
                  {selectedBillExcelList.length} Bill Are Ready To UTR Update{" "}
                </Typography>
                <CardActions>
                  <Button
                    variant="contained"
                    onClick={() => {
                      closeModalIsVerify();
                      handleUpdateUTROpen();
                    }}
                  >
                    Update UTR
                  </Button>
                </CardActions>
              </>
            ) : null}
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => {
                  clearState();
                  closeModalIsVerify();
                }}
              >
                Close
              </Button>
            </CardActions>
          </Paper>
        </CustomModal>
      </Stack>
    </>
  );
};

export default ManualPayReqTab;
