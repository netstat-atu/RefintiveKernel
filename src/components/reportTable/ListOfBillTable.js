import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, TextField, MenuItem, FormControl, Select, InputLabel, Typography, Button, Stack, Card, Divider, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** service */
import { billerNameRequest, billerNameStates, downloadExcelFromAPI, downloadPdfZipFromAPI, reportByFilter } from '../../utils/bbps/billerServices';

//** component */
import StyledTableRow from '../StyledTableRow';

//** mui */
import { IconButton, Table, TableBody, TableCell, TableContainer, Paper, TableRow, TableHead, TablePagination } from '@mui/material';

//** icon */
import { Download, PictureAsPdfRounded, Receipt } from '@mui/icons-material';

//** service */
import { pdfBillDownload } from '../../utils/bbps/billerServices';

//** utils */
import { ddmmyy } from '../../utils/dateFormat';
import { isEmpty, amountFormat, truncateString, adminStatus, clientStatus } from '../../utils';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { formatDate } from '../../utils/dateFormat';
import { BILLER_CATEGORY, convertToTitleCase } from '../../utils';



//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';
const billStatus = {
    "0": "Not Fetch",
    "1": "New Bill",
    "2": "Verified Bill",
    "3": "In Batch"
};
const ListOfBillTable = () => {
    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, role } = useSelector(state => state.user)
    const { orgField } = useSelector((state) => state.extra);

    const dispatch = useDispatch();
    const getArea = orgField && orgField.length > 0 ? orgField.find((e) => e.fieldName === "Area") : 0
    const extraBillAmountStatusTitle = {
        0: {
            title: "Normal Bill",
            color: "success.light"
        },
        1: {
            title: "Extra Amount Bill",
            color: "info.light"
        },
        2: {
            title: "Advance Amount Bill",
            color: "info.light"
        }
    }
    const billStatusTitle = {
        "0": "Not Fetch",
        "1": "New Bill",
        "2": "Verified Bill",
        "3": "In Batch",
    }

    const payStatusTitle = {
        "0": "In Batch",
        "1": "Invoice Paid",
        "2": "Bill Paid",
        "3": "Disable Bill",
        "4": "BBPS Bill Paid",
        "-1": "Unverified",
        "-2": "Unverified",
    }

    const initialStateOfBody = {
        "orgId": orgId,
        "userId": "",
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
        "batchId": "",
        "txnReferenceId": "",
    };

    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
    const [stateList, setStateList] = React.useState([]);
    const [billerName, setBillerName] = React.useState('');
    const [clearFlag, setClearFlag] = React.useState(false);
    const [billOfList, setBillOfList] = React.useState([]);
    const [listOfBillDataLength, setListOfBillDataLength] = React.useState(0);

    const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) })

    const getCostPerSqrMeter = (item) => {
        if (item?.Consumption && item[getArea?.fieldName]) {
            const Consumption = Number(item?.Consumption) / 100
            const area = Number(item[getArea?.fieldName]);
            const costPerSqrMeter = Consumption / area;
            return costPerSqrMeter.toFixed(2)
        }
    };

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

    const clearState = () => {
        setBillerName('')
        setStateName('')
        setFilterBody(initialStateOfBody);
        setClearFlag(!clearFlag)
    };

    const getSingleReport = async () => {
        showLoader()
        const body = {
            "type": "SingleReports",
            "data": filterBody,
            "role": role,
            "reportType": "LIST_OF_BILL"
        }
        await reportByFilter(body).then((resp) => {
            if (resp !== undefined) {
                setBillOfList(resp?.data)
                setListOfBillDataLength(resp?.Counts)
            }
        }).catch((error) => {
            console.log("🚀 ~ file: ListOfBillTable.js:40 ~ LIST_OF_BILL ~ error:", error)
        }).finally(() => {
            hideLoader()
        })
    };

    const downloadExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const bodyFilter = {
                "type": "SingleReports",
                "data": filterBody,
                "reportType": "LIST_OF_BILL",
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

    const downloadPdfZip = async () => {

        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
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

    React.useEffect(() => {
        getBillerName()
        getBillerStatesList()
        getSingleReport()
    }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo])

    const isDownloadButton = () => {
        if (filterBody.stateName || filterBody.billerId || filterBody.consumerNumber || filterBody.txnReferenceId || filterBody.batchId || filterBody.billDateFrom && filterBody.billDateTo || filterBody.billDueDateTo && filterBody.billDueDateFrom || filterBody.verifyDateFrom && filterBody.verifyDateTo || filterBody.paymentDateFrom && filterBody.paymentDateTo || filterBody.transactionDateFrom && filterBody.transactionDateTo) {
            return true
        } else {
            return false
        }
    }
    return (
        <>
            <Head>
                <title>
                    List Of Bill
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
                                <TextField fullWidth value={filterBody.consumerNumber} size="small" onChange={onChangeHandle} name='consumerNumber' id="outlined-basic" label="Consumer Number" variant="outlined" />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <TextField fullWidth value={filterBody.batchId} size="small" onChange={onChangeHandle} name='batchId' id="outlined-basic" label="Batch Number" variant="outlined" />
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
                                    label="Verify Date From"
                                    value={filterBody.verifyDateFrom || null}
                                    onChange={(e) => onChangeDate("verifyDateFrom", e)}
                                    renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Verify Date To"
                                    value={filterBody.verifyDateTo || null}
                                    onChange={(e) => onChangeDate("verifyDateTo", e)}
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
                                }) : null}
                        </Grid>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={"space-between"} p={1} >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                                <Button onClick={getSingleReport} variant="contained">Search Bill</Button>
                                <Button onClick={clearState} type='reset' variant="contained" color='inherit'>Clear</Button>
                            </Stack>
                            {isDownloadButton() ? <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                                <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
                                <Button startIcon={<Download />} onClick={downloadPdfZip} variant="contained">Download Bill PDF Zip</Button>
                                <Button startIcon={<Download />} onClick={downloadPaymentPdfZip} variant="contained">Download Receipt PDF Zip</Button>
                            </Stack> : null}
                        </Stack>
                    </Stack>
                </Card>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer >
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Customer ID</TableCell>
                                    <TableCell align="center">Consumer No.</TableCell>
                                    <TableCell align="center">Biller Name</TableCell>
                                    <TableCell align="center">Bill Number</TableCell>
                                    <TableCell align="center">Bill Amount</TableCell>
                                    <TableCell align="center">Convenience Fee</TableCell>
                                    <TableCell align="center">Total Bill Amount</TableCell>
                                    <TableCell align="center">Client Paid Amount</TableCell>
                                    <TableCell align="center">Admin Paid Amount</TableCell>
                                    <TableCell align="center">Bill Fetch Date</TableCell>
                                    <TableCell align="center">Bill Creation Date</TableCell>
                                    <TableCell align="center">Due Date</TableCell>
                                    <TableCell align="center">Consumption</TableCell>
                                    <TableCell align="center">Discount Date</TableCell>
                                    <TableCell align="center">Discount Amount</TableCell>
                                    <TableCell align="center">B2P Invoice</TableCell>
                                    {getArea ? <TableCell align="center">Consumption Per SqFt</TableCell> : null}
                                    {orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                                        if (field?.filterFlag === 1) {
                                            if (field?.fieldType === "char") {
                                                return <TableCell key={index} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                                            }
                                        }
                                    }) : null}
                                    {orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                                        if (field?.fieldName === "clientTrackId") {
                                            return <TableCell key={index} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                                        }
                                    }) : null}
                                    <TableCell align="center">Transaction ID</TableCell>
                                    <TableCell align="center">B2P Paid Date</TableCell>
                                    <TableCell align="center">Bill Client Paid Date</TableCell>
                                    <TableCell align="center">Bill PDF</TableCell>
                                    <TableCell align="center">Receipt PDF</TableCell>
                                    <TableCell align="center">Bill Status</TableCell>
                                    <TableCell align="center">Client Status</TableCell>
                                    <TableCell align="center">B2P Status</TableCell>
                                    <TableCell align="center">Verify Date</TableCell>
                                    <TableCell align="center">Remark</TableCell>
                                    <TableCell align="center">BillType</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {billOfList && billOfList.map((item, key) => {

                                    const payableAmount = Number(item?.amount) + (item?.taxAmount ? Number(item?.taxAmount) : 0);
                                    return (
                                        <StyledTableRow key={String(key)} >
                                            <TableCell align="center">{isEmpty(item.orgAlias)}</TableCell>
                                            <TableCell align="center">{isEmpty(item.ConsumerId)}</TableCell>
                                            <TableCell align="center">{isEmpty(item.BillerName)}</TableCell>
                                            <TableCell align="center">{isEmpty(item.BillNumber)}</TableCell>
                                            <TableCell align="center">{amountFormat(item.amount)}</TableCell>
                                            <TableCell align="center">{amountFormat(item.taxAmount)}</TableCell>
                                            <TableCell align="center">{amountFormat(payableAmount)}</TableCell>
                                            <TableCell align="center">{amountFormat(item.clientPaidAmount)}</TableCell>
                                            <TableCell align="center">{amountFormat(item.adminPaidAmount)}</TableCell>
                                            <TableCell align="center">{ddmmyy(item.fetchDate)}</TableCell>
                                            <TableCell align="center">{ddmmyy(item.billDate)}</TableCell>
                                            <TableCell align="center">{ddmmyy(item.dueDate)}</TableCell>
                                            <TableCell align="center">{isEmpty(item.Consumption)}</TableCell>
                                            <TableCell align="center">{ddmmyy(item.DiscountDate)}</TableCell>
                                            <TableCell align="center">{amountFormat(item.DiscountAmount)}</TableCell>
                                            <TableCell align="center">{isEmpty(item.batchId)}</TableCell>
                                            {getArea ? <TableCell align="center">{isEmpty(getCostPerSqrMeter(item))}</TableCell> : null}
                                            {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                                                if (field?.filterFlag === 1) {
                                                    if (field?.fieldType === "char") {
                                                        return <TableCell key={index} align="center">{isEmpty(item[field?.fieldName])}</TableCell>
                                                    }
                                                }
                                            }) : null}
                                            {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                                                if (field?.fieldName === "clientTrackId") {
                                                    return <TableCell key={index} align="center">
                                                        {isEmpty(item[field?.fieldName])}
                                                    </TableCell>
                                                }

                                            }) : null}
                                            <TableCell align="center">{isEmpty(item?.txnReferenceId)}</TableCell>
                                            <TableCell align="center">{ddmmyy(item.TransactionDate)}</TableCell>
                                            <TableCell align="center">{ddmmyy(item.PaymentDate)}</TableCell>
                                            <TableCell align="center">{item.pdfLink ? <IconButton color='info' onClick={() => pdfDownload(item.pdfLink)}  ><PictureAsPdfRounded /></IconButton> : "N/A"}</TableCell>
                                            <TableCell align="center">{item.paymentReceiptPdf ? <IconButton onClick={() => pdfDownload(item.paymentReceiptPdf)}  ><Receipt /></IconButton> : "N/A"}</TableCell>
                                            <TableCell align="center">{isEmpty(billStatus[item?.billStatus])}</TableCell>
                                            <TableCell align="center">{isEmpty(clientStatus[item?.clientStatus]?.title)}</TableCell>
                                            <TableCell align="center">{isEmpty(adminStatus[item?.adminStatus]?.title)}</TableCell>
                                            <TableCell align="center">{ddmmyy(item?.verifyDate)}</TableCell>
                                            <TableCell align="center">{isEmpty(truncateString(item?.remark))}</TableCell>
                                            <TableCell align="center" sx={{ color: "neutral.100", backgroundColor: extraBillAmountStatusTitle[item?.extraBillAmountStatus].color }} >{extraBillAmountStatusTitle[item?.extraBillAmountStatus].title}</TableCell>
                                        </StyledTableRow>
                                    )
                                })}

                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={listOfBillDataLength}
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


export default ListOfBillTable;