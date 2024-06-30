import React from 'react'
//** mui */
import { Button, Table, TableHead, Paper, TableRow, TableContainer, TableCell, TableBody, Box, Card, Divider, IconButton, Stack, TextField, Typography, Grid, Select, FormControl, InputLabel, MenuItem, TablePagination, Chip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** icon */
import { Download, FilePresent } from '@mui/icons-material';

//** service */
import { adminAutoPayment, adminAutoPaymentManage, billerNameRequest, billerNameStates, downloadExcelFromAPI, getAutoBillFilter } from '../../utils/bbps/billerServices';

//** utils */
import { ddmmyy, formatDate } from '../../utils/dateFormat';
import { BILLER_CATEGORY, amountFormat, isEmpty, payStatusAdminSideTitle } from '../../utils';
import { excelName } from '../../utils/excelDownloadManagement';


//** redux */
import { useDispatch, useSelector } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

//** component */
import StyledTableRow from '../StyledTableRow';
import PaymentDialog from '../PaymentDialog';

//** npm */
import { v4 as uuid } from 'uuid';

const UrgentBillTab = () => {
    const { orgId, userId, organizationList } = useSelector((state) => state.user);
    const { showLoader, hideLoader, isLoading } = useLoader();
    const dispatch = useDispatch();

    const initialFilterBody = {
        "orgId": orgId,
        'batchId': "",
        "billerId": "",
        "stateName": "",
        "paymentDate": "",
        "batchCreationDate": "",
        "transactionDate": "",
        "rowPerPage": 10,
        "pageNo": 0,
    }


    const payThreshold = organizationList?.find((e) => e?.orgId == orgId)?.payThreshold ? organizationList?.find((e) => e?.orgId == orgId)?.payThreshold : 0;
    //** state */
    const [clearFlag, setClearFlag] = React.useState(false);
    const [billerName, setBillerName] = React.useState('');
    const [stateName, setStateName] = React.useState('');
    const [isPayModal, setIsPayModal] = React.useState(false);
    const [payModeValue, setPayModeValue] = React.useState("Kotak");
    const [filterBody, setFilterBody] = React.useState(initialFilterBody);
    const [paymentDownloadReportList, setPaymentDownloadReportList] = React.useState([]);
    const [stateList, setStateList] = React.useState([]);
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [paymentStatusResponse, setPaymentStatusResponse] = React.useState({});
    const [billList, setBillList] = React.useState([]);
    const [dataLength, setDataLength] = React.useState(0);
    const onChangePaySelectHandle = (e) => setPayModeValue(e.target.value);
    const handlePayOpen = () => setIsPayModal(true)
    const handlePayClose = () => setIsPayModal(false)
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))
    const handleChangePage = async (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const getBillerStatesList = async () => {
        await billerNameStates().then((resp) => {
            if (resp?.length > 0) {
                setStateList([{ stateName: "ALL" }, ...resp])
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


    const handleChangeBillerName = (event) => {
        setBillerName(event.target.value);
        let billerNameCode = event.target.value.split('/');
        setFilterBody({ ...filterBody, ["billerName"]: billerNameCode[1], ["billerId"]: billerNameCode[0] });
    };

    const handleChangeStateName = async (event) => {
        showLoader()
        setBillerName('');
        setFilterBody({ ...filterBody, [event.target.name]: event.target.value === "ALL" ? "" : event.target.value, "billerId": "", "billerName": "", "stateName": event.target.value });
        setStateName(event.target.value);
        await billerNameRequest(BILLER_CATEGORY, event.target.value).then((resp) => {
            if (resp?.length > 0) {
                setBillerNameListData(resp);
            } else {
                setBillerNameListData([]);
            }
        }).catch((error) => {
            console.log("🚀 ~ file: billStatus.js:156 ~ await billerNameRequest ~ error:", error);
            setBillerNameListData([]);
        }).finally(() => {
            hideLoader()
        });
    };



    const initiatePayment = async () => {
        showLoader()
        //**  initiatePayment */
        const body = {
            "type": "pay",
            "payMode": "URGENT",
            "data": {
                "PaymentDate": filterBody.paymentDate,
                "BatchCreationDate": filterBody.batchCreationDate,
                "billerId": filterBody.billerId,
                "orgId": filterBody.orgId,
                "batchId": filterBody.batchId,
            }
        };
        await adminAutoPayment(body).then(() => {
            openAlertHandle('success', "Auto payment initiation was successful. You will receive an email, and after that, you can initiate your next payment.")
        }).catch((error) => {
            console.log("🚀 ~ file: UrgentBillTab.js:69 ~ await adminAutoPayment ~ error:", error);
        }).finally(() => {
            hideLoader()
            console.log('finally :>> ');
        });
    }

    const statusPayment = async () => {

        //**  statusPayment */

        if (filterBody.paymentDate || filterBody.billerId || filterBody.batchId || filterBody.batchCreationDate) {
            showLoader()
            const body = {
                "type": "urgent_status",
                "data": {
                    "PaymentDate": filterBody.paymentDate,
                    "BatchCreationDate": filterBody.batchCreationDate,
                    "billerId": filterBody.billerId,
                    "batchId": filterBody.batchId,
                    "orgId": filterBody.orgId,
                }
            };
            await adminAutoPaymentManage(body).then((resp) => {
                setPaymentStatusResponse(resp)
                handlePayOpen();
            }).catch((error) => {
                console.log("🚀 ~ file: UrgentBillTab.js:94 ~ await adminAutoPaymentManage ~ error:", error)
            }).finally(() => {
                hideLoader()
            });
        } else {
            openAlertHandle("error", "Please choose filter");
        }
    }

    const downloadPaymentReport = async (link) => {
        //**  downloadPaymentReport*/
        showLoader()
        const body = {
            "type": "download",
            "data": {
                "key": link
            }
        }
        await adminAutoPaymentManage(body).then((resp) => {
            window.open(resp);
        }).catch((error) => {
            console.log("🚀 ~ file: UrgentBillTab.js:115 ~ await adminAutoPaymentManage ~ error:", error)
        }).finally(() => {
            hideLoader()
        });
    }

    const getPaymentList = async () => {
        //**  getPaymentList*/
        showLoader()
        const body = {
            "type": "list",
            "data": {
                "prefixDate": formatDate(filterBody.transactionDate)
            }
        }
        await adminAutoPaymentManage(body).then((resp) => {
            if (resp?.Contents?.length > 0) {
                setPaymentDownloadReportList(resp?.Contents);
            } else {
                openAlertHandle("error", "No auto payment bill found !");
            }
        }).catch((error) => {
            console.log("🚀 ~ file: UrgentBillTab.js:155 ~ await adminAutoPaymentManage ~ error:", error)
        }).finally(() => {
            hideLoader()
        });
    }



    const getProcessBill = async () => {

        showLoader()
        let body = {
            "type": "URGENT_BILL",
            "data": filterBody
        }

        try {
            const resp = await getAutoBillFilter(body);
            if (resp.statusCode === 200) {
                const { data, Counts } = resp.body;
                setBillList(data);
                setDataLength(Counts);
            }
        } catch (error) {
            console.log("🚀 ~ file: UrgentBillTab.js:279 ~ getProcessBill ~ error:", error)
        } finally {
            hideLoader()
        }

    }

    const downloadExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
                "id": id,
                "name": excelName.URGENT_BILL,
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

    const clearState = () => {
        setClearFlag(!clearFlag)
        setBillerName("");
        setStateName("");
        setFilterBody(initialFilterBody)
        setPaymentDownloadReportList([])
    }
    React.useEffect(() => {
        getBillerStatesList()
        getBillerName()
        getProcessBill()

    }, [clearFlag, filterBody.pageNo, filterBody.rowPerPage]);

    return (
        <Stack spacing={3} pt={3}>
            <Typography variant='body2'>
                {`NOTE : Fetch bills supported by an API within a range of approximately ± ${payThreshold}%.`}
            </Typography>
            <Card>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
                    <Typography variant="h6"
                        component="div">
                        Choose Filters
                    </Typography>
                </Box>
                <Divider />
                <Stack>
                    <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <TextField fullWidth value={filterBody.batchId} size="small" onChange={onChangeHandle} name='batchId' id="outlined-basic" label="Batch Id" variant="outlined" />
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
                                    {billerNameListData?.length > 0 ? billerNameListData?.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                                        return (<MenuItem key={`${index + 15}`} value={val.billerId + '/' + val.billerName}>{val.billerName}</MenuItem>)
                                    }) : null
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Swipe Date"
                                value={filterBody.paymentDate || null}
                                onChange={(e) => onChangeDate("paymentDate", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Batch Creation Date"
                                value={filterBody.batchCreationDate || null}
                                onChange={(e) => onChangeDate("batchCreationDate", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>

                    </Grid>
                    <Stack spacing={2} p={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={'space-between'} >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                                <Button onClick={getProcessBill} variant="contained" >Search Bill</Button>
                                <Button startIcon={<Download />} variant='contained' onClick={downloadExcel}>Download Bill</Button>
                                <Button onClick={clearState} variant="contained" color='inherit'>Clear</Button>
                            </Stack>
                            {filterBody.orgId ? <Button disabled={isLoading} onClick={statusPayment} variant="contained" >Initiate Payment</Button> : null}
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                            <Grid>
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Transaction Date"
                                    value={filterBody.transactionDate || null}
                                    onChange={(e) => onChangeDate("transactionDate", e)}
                                    renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Button disabled={isLoading} onClick={getPaymentList} variant="contained" >Get Auto Payment Report</Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Card>
            {paymentDownloadReportList && paymentDownloadReportList?.length > 0 ?
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">File Name</TableCell>
                                    <TableCell align="center">Download Link</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paymentDownloadReportList.map((row, index) => {
                                    const fileName = row.Key.split("/")[1];
                                    return (
                                        <StyledTableRow key={index}  >
                                            <TableCell align="center">{fileName}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    disabled={isLoading}
                                                    onClick={() => {
                                                        if (row.Key !== null && row.Key !== "") {
                                                            downloadPaymentReport(row.Key);
                                                        }
                                                    }}  >
                                                    <FilePresent color='info' />
                                                </IconButton>
                                            </TableCell>
                                        </StyledTableRow>
                                    )
                                })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
                : null}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="a dense table" size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Batch Id</TableCell>
                                <TableCell align="center">Consumer No.</TableCell>
                                <TableCell align="center">Consumer Name</TableCell>
                                <TableCell align="center">Biller Name</TableCell>
                                <TableCell align="center">Amount</TableCell>
                                <TableCell align="center">Client Paid Amount</TableCell>
                                <TableCell align="center">Bill Creation Date</TableCell>
                                <TableCell align="center">Due Date</TableCell>
                                <TableCell align="center">Payment Date</TableCell>
                                <TableCell align="center">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {billList && billList?.length > 0 && billList?.map((row, index) => {

                                const statusLabel = {
                                    0: "In Batch Bills",
                                    1: "Client Payment Done",
                                }
                                const statusColor = {
                                    0: "#AEE2FF",
                                    1: "#FFC6D3",
                                }

                                return (
                                    <StyledTableRow key={index}  >
                                        <TableCell align="center">{isEmpty(row?.batchId)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.clientPaidAmount)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.PaymentDate)}</TableCell>
                                        <TableCell align="center"><Chip variant='outlined' label={payStatusAdminSideTitle[row?.clientStatus]?.title} color={payStatusAdminSideTitle[row?.clientStatus]?.color} /></TableCell>

                                    </StyledTableRow>
                                )
                            })}
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
            <PaymentDialog
                isModal={isPayModal}
                handlePay={initiatePayment}
                handlePayClose={handlePayClose}
                payModeValue={payModeValue}
                onChangePaySelectHandle={onChangePaySelectHandle}
                desc={`Total Bills ${paymentStatusResponse?.TotalBills},  Time Taken in ${paymentStatusResponse?.TimeTakenInSecond / 60} minute`}
            />
        </Stack>


    )
}

export default UrgentBillTab