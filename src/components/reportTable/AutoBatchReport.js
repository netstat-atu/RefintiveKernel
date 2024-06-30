import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, Container, TextField, MenuItem, FormControl, Select, InputLabel, Typography, Button, Stack, Card, Divider, Grid } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, Paper, TableRow, TableHead, TablePagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** service */
import { billerNameRequest, billerNameStates, downloadExcelFromAPI, reportByFilter } from '../../utils/bbps/billerServices';

//** utils */
import { ddmmyy } from '../../utils/dateFormat';
import { formatDate } from '../../utils/dateFormat';
import { excelName } from '../../utils/excelDownloadManagement';
import { isEmpty, amountFormat, convertToTitleCase } from '../../utils';

//** component */
import StyledTableRow from '../StyledTableRow';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { BILLER_CATEGORY } from '../../utils';
import { useLoader } from '../../Provider/LoaderContext';
import { Download } from '@mui/icons-material';

const AutoBatchReport = () => {

    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, role, organizationList } = useSelector(state => state.user);
    const { orgField } = useSelector((state) => state.extra);
    const payTh = organizationList?.find((e) => e?.orgId == orgId)?.payThreshold ? organizationList?.find((e) => e?.orgId == orgId)?.payThreshold : 0;
    const dispatch = useDispatch();
    const initialStateOfBody = {
        "orgId": orgId,
        "userId": "",
        "consumerNumber": "",
        "billerName": "",
        "rowPerPage": 10,
        "pageNo": 0,
        "billDateFrom": "",
        "billDateTo": "",
        "billDueDateFrom": "",
        "billDueDateTo": "",
        "paymentDateFrom": "",
        "paymentDateTo": "",
        "transactionDateFrom": "",
        "transactionDateTo": "",
        "batchCreationDateFrom": "",
        "batchCreationDateTo": "",
        "stateName": "",
        "billerId": "",
    };

    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
    const [stateList, setStateList] = React.useState([]);
    const [billerName, setBillerName] = React.useState('');
    const [clearFlag, setClearFlag] = React.useState(false);
    const [dataLengthPaymentReport, setDataLengthPaymentReport] = React.useState(0);
    const [paymentReportList, setPaymentReportList] = React.useState([]);

    const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) })
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))

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
            "reportType": "AUTO_BATCH_CREATION_REPORT"
        }).then((resp) => {
            if (resp !== undefined) {
                setPaymentReportList(resp.data)
                setDataLengthPaymentReport(resp.Counts)
            }
        }).catch((error) => {
            console.log("🚀 ~ file: PaymentReport.js:42 ~ getSingleReport ~ error:", error)
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
                "reportType": "AUTO_BATCH_CREATION_REPORT",
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



    React.useEffect(() => {
        getBillerName()
        getBillerStatesList()
        getSingleReport()
    }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo])

    const template = {
        "S.No": null,
        "Request Date": null,
        "Indus OU Name": null,
        "Trading Partner": null,
        "Supplier Num": null,
        "Supplier Site Name": null,
        "Invoice Date": null,
        "Invoice No.": null,
        "Invoice Amount": null,
        "Indus Lot No.": null,
        "Indus ID": null,
        "Discom Name": null,
        "Account Number": null,
        "Due Date": null,
        "B2P Remarks": null,
        "Receipt Amount": null,
        "Receipt No": null,
        "Receipt Date": null,
        "Difference": null,
        "Status": null,

    }



    return (
        <>
            <Head>
                <title>
                    Auto Batch Creation Report
                </title>
            </Head>
            <Stack spacing={3}>
                <Card>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
                        <Typography variant="h6" component="div">Choose Filters</Typography>
                    </Box>
                    <Divider />
                    <Stack component={"form"}>
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
                                    label="Batch Creation Date From"
                                    value={filterBody.batchCreationDateFrom}
                                    onChange={(e) => onChangeDate("batchCreationDateFrom", e)}
                                    renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Batch Creation Date To"
                                    value={filterBody.batchCreationDateTo}
                                    onChange={(e) => onChangeDate("batchCreationDateTo", e)}
                                    renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
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
                            {
                                orgField && orgField.length > 0 ? orgField.map((field, index) => {

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
                                        } else if (field?.fieldType === "date" && true) {
                                            return <>
                                                <Grid key={index} item xs={2} sm={4} md={4} p={1} >
                                                    <DatePicker
                                                        key={field?.fieldId}
                                                        inputFormat="dd/MM/yyyy"
                                                        label={convertToTitleCase(field?.fieldName + "From")}
                                                        value={filterBody[field?.fieldName + "From"] || null}
                                                        onChange={(ele) => { setFilterBody({ ...filterBody, [field?.fieldName + "From"]: formatDate(ele) }); }}
                                                        renderInput={(params) => <TextField fullWidth size='small' {...params} helperText={null} />}
                                                    />
                                                </Grid>
                                                <Grid key={index} item xs={2} sm={4} md={4} p={1} >
                                                    <DatePicker
                                                        key={field?.fieldId}
                                                        inputFormat="dd/MM/yyyy"
                                                        label={convertToTitleCase(field?.fieldName + "To")}
                                                        value={filterBody[field?.fieldName + "To"] || null}
                                                        onChange={(ele) => { setFilterBody({ ...filterBody, [field?.fieldName + "To"]: formatDate(ele) }); }}
                                                        renderInput={(params) => <TextField fullWidth size='small' {...params} helperText={null} />}
                                                    />
                                                </Grid>
                                            </>
                                        }
                                    } else if (field.fieldName === "clientTrackId") {
                                        return <Grid key={index} item xs={2} sm={4} md={4} p={1} >
                                            <TextField
                                                key={field?.fieldId}
                                                fullWidth
                                                size="small"
                                                id="outlined-basic"
                                                label={convertToTitleCase(field.fieldName)}
                                                name={field.fieldName}
                                                value={filterBody[field?.fieldName]}
                                                onChange={onChangeHandle}
                                                variant="outlined"

                                            />
                                        </Grid>
                                    }

                                }) : null
                            }
                        </Grid>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={"space-between"} p={1} >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                                <Button onClick={getSingleReport} variant="contained">Search Bill</Button>
                                <Button onClick={clearState} type='reset' variant="contained" color='inherit'>Clear</Button>
                            </Stack>
                            <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
                        </Stack>
                    </Stack>
                </Card>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">S.No</TableCell>
                                    <TableCell align="center">Request Date</TableCell>
                                    <TableCell align="center">Request Type</TableCell>
                                    <TableCell align="center">Indus OU Name</TableCell>
                                    <TableCell align="center">Trading Partner</TableCell>
                                    <TableCell align="center">Supplier Num</TableCell>
                                    <TableCell align="center">Supplier Site Name</TableCell>
                                    <TableCell align="center">Invoice Date</TableCell>
                                    <TableCell align="center">Invoice No.</TableCell>
                                    <TableCell align="center">Invoice Amount</TableCell>
                                    <TableCell align="center">Indus Lot No.</TableCell>
                                    <TableCell align="center">Indus ID</TableCell>
                                    <TableCell align="center">Discom Name</TableCell>
                                    <TableCell align="center">Account Number</TableCell>
                                    <TableCell align="center">Due Date</TableCell>
                                    <TableCell align="center">Pre/Post</TableCell>
                                    <TableCell align="center">Indus Remarks</TableCell>
                                    <TableCell align="center">Parameter 2</TableCell>
                                    <TableCell align="center">Value 2</TableCell>
                                    <TableCell align="center">Receipt Amount</TableCell>
                                    <TableCell align="center">Receipt No</TableCell>
                                    <TableCell align="center">Receipt Date</TableCell>
                                    <TableCell align="center">Difference</TableCell>
                                    <TableCell align="center">Diff %Age</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">B2P Remarks</TableCell>
                                    <TableCell align="center">Batch Id</TableCell>
                                </TableRow>
                            </TableHead>
                            {<TableBody>
                                {
                                    paymentReportList && paymentReportList.length > 0 && paymentReportList.map((row, index) => {

                                        // const getInBound = () => {
                                        //     const adminPaidAmount = parseFloat(row.adminPaidAmount);
                                        //     const clientPaidAmount = parseFloat(row.clientPaidAmount);
                                        //     const payThreshold = parseFloat(payTh);
                                        //     const lowerBound = clientPaidAmount - (clientPaidAmount * payThreshold) / 100;
                                        //     const upperBound = clientPaidAmount + (clientPaidAmount * payThreshold) / 100;

                                        //     if (adminPaidAmount >= lowerBound && adminPaidAmount <= upperBound) {
                                        //         return true
                                        //     }

                                        //     // if (adminPaidAmount >= lowerBound && adminPaidAmount <= upperBound) {
                                        //     //     return "Paid 5%"
                                        //     //   }

                                        //     //   if (adminPaidAmount > upperBound) {
                                        //     //     return "Paid - Greater than 5%"
                                        //     //   }

                                        //     //   if (adminPaidAmount < lowerBound) {
                                        //     //     return "Paid - Less than 5%"
                                        //     //   }

                                        //     return false
                                        // }
                                        // const isWithinRange = getInBound();

                                        // const checkAmountDifference = (clientPaidAmount, adminPaidAmount) => {
                                        //     adminPaidAmount = adminPaidAmount ? Number(adminPaidAmount) : 0;
                                        //     clientPaidAmount = clientPaidAmount ? Number(clientPaidAmount) : 0;
                                        //     let diff = Math.abs(adminPaidAmount - clientPaidAmount);
                                        //     diff = (diff * 100) / clientPaidAmount;
                                        //     if (adminPaidAmount >= clientPaidAmount) {
                                        //         return diff;
                                        //     } else {
                                        //         return -diff;
                                        //     }
                                        // }
                                        // const getDifference = () => {
                                        //     if (row?.clientPaidAmount && row?.adminPaidAmount) {
                                        //         return Number(row?.adminPaidAmount) - Number(row?.clientPaidAmount)
                                        //     } else {
                                        //         return 0
                                        //     }
                                        // }
                                        // const getStatus = () => {
                                        //     if (row.adminStatus == 1 || row.adminStatus == 3) {
                                        //         if (row?.adminPaidAmount == 0) {
                                        //             return "Failed"
                                        //         }
                                        //         if (row?.clientPaidAmount == row?.adminPaidAmount) {
                                        //             return "Successful";
                                        //         }
                                        //         return isWithinRange ? "Paid 5%" : "Successful";
                                        //     }
                                        //     return "Failed"
                                        // }

                                        return (
                                            <StyledTableRow key={String(index) + String(row.ConsumerId)}>
                                                <TableCell align="center">{isEmpty(index + 1)}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Request Date"])}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Request Type"])}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Indus OU Name"])}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Trading Partner"])}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Supplier Num"])}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Supplier Site Name"])}</TableCell>
                                                <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
                                                <TableCell align="center">{isEmpty(row["clientTrackId"])}</TableCell>
                                                <TableCell align="center">{amountFormat(row?.clientPaidAmount)}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Indus Lot No."])}</TableCell>
                                                <TableCell align="center">{isEmpty(row["IndusSiteID"])}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                                                <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.payType)}</TableCell>
                                                <TableCell align="center">{isEmpty(row["Indus Remarks"])}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.Parameter2)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.Value2)}</TableCell>
                                                <TableCell align="center">{amountFormat(row?.adminPaidAmount)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.txnReferenceId)}</TableCell>
                                                <TableCell align="center">{ddmmyy(row?.TransactionDate)}</TableCell>
                                                <TableCell align="center">{amountFormat(row?.Difference)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.DiffAge)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.Status)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.remark)}</TableCell>
                                                <TableCell align="center">{isEmpty(row?.batchId)}</TableCell>
                                            </StyledTableRow>
                                        )
                                    }
                                    )}

                            </TableBody>
                            }
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


export default AutoBatchReport;

