import React from 'react'

//** mui */
import { Button, Table, TableHead, Paper, TableRow, TableContainer, TableCell, TableBody, Box, Card, Divider, Stack, TextField, Typography, Grid, Select, FormControl, InputLabel, MenuItem, TablePagination, Chip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** service */
import { billerNameRequest, billerNameStates, downloadExcelFromAPI, payRequestList } from '../../utils/bbps/billerServices';

//** utils */
import { ddmmyy, formatDate } from '../../utils/dateFormat';
import { BILLER_CATEGORY, amountFormat, isEmpty } from '../../utils';
import { excelName } from '../../utils/excelDownloadManagement';

//** redux */
import { useDispatch, useSelector } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

//** component */
import StyledTableRow from '../StyledTableRow';

//** npm */
import { v4 as uuid } from 'uuid';
import { Download } from '@mui/icons-material';

const NotProcessReqBillTab = () => {
    const { orgId, organizationList, userId } = useSelector((state) => state.user);
    const { showLoader, hideLoader, isLoading } = useLoader();
    const dispatch = useDispatch();

    const initialFilterBody = {
        "orgId": orgId,
        "userId": "",
        "consumerNumber": "",
        "consumerName": "",
        "stateName": "",
        "billerId": "",
        "billDateFrom": "",
        "billDateTo": "",
        "billDueDateFrom": "",
        "billDueDateTo": "",
        "paymentDateFrom": "",
        "paymentDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0
    };


    const payThreshold = organizationList?.find((e) => e?.orgId == orgId)?.payThreshold ? organizationList?.find((e) => e?.orgId == orgId)?.payThreshold : 0;

    //** state */
    const [billerName, setBillerName] = React.useState('');
    const [stateName, setStateName] = React.useState('');
    const [filterBody, setFilterBody] = React.useState(initialFilterBody);
    const [stateList, setStateList] = React.useState([]);
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [billList, setBillList] = React.useState([]);
    const [dataLength, setDataLength] = React.useState(0);
    const [clearFlag, setClearFlag] = React.useState(false);
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
        setFilterBody({ ...filterBody, [event.target.name]: event.target.value === "ALL" ? "" : event.target.value, "billerId": "", "billerName": "" });
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

    const getNotProcessBill = async () => {
        showLoader()
        let body = {
            "type": excelName.NOT_PROCESS_REQ_BILL,
            "data": filterBody
        }

        try {
            const resp = await payRequestList(body);
            if (resp.statusCode === 200) {
                const { data, Counts } = resp.body;
                setBillList(data);
                setDataLength(Counts);
            }
        } catch (error) {
            console.log("🚀 ~ file: processBillTab.js:279 ~ getNotProcessBill ~ error:", error)
        } finally {
            hideLoader()
        }

    };

    const downloadExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
                "id": id,
                "name": excelName.NOT_PROCESS_REQ_BILL,
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
        setBillerName("");
        setStateName("");
        setFilterBody(initialFilterBody)
        setClearFlag(!clearFlag)

    };

    React.useEffect(() => {
        getNotProcessBill()
        getBillerStatesList()
        getBillerName()
    }, [clearFlag, filterBody.pageNo, filterBody.rowPerPage]);

    return (
        <Stack spacing={3} pt={3}>
            <Typography variant='body2'>
                {`NOTE : Fetch bills supported by an API that exceed a margin greater than approximately ± ${payThreshold}%.`}
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
                                label="Payment Date From"
                                value={filterBody.paymentDateFrom || null}
                                onChange={(e) => onChangeDate("paymentDateFrom", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Payment Date To"
                                value={filterBody.paymentDateTo || null}
                                onChange={(e) => onChangeDate("paymentDateTo", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={"space-between"} p={1} >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                            <Button disabled={isLoading} onClick={getNotProcessBill} variant="contained" >Search</Button>
                            <Button onClick={clearState} variant="contained" color='inherit'>Clear</Button>
                        </Stack>
                        <Button startIcon={<Download />} variant='contained' onClick={downloadExcel}>Download Bill</Button>
                    </Stack>
                </Stack>

            </Card>
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
                                    0: "Pending",
                                    1: "Pending",
                                }
                                const statusColor = {
                                    0: "#AEE2FF",
                                    1: "#FFC6D3",
                                }

                                return (
                                    <StyledTableRow key={index}  >
                                        <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.clientPaidAmount)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.PaymentDate)}</TableCell>
                                        <TableCell align="center"><Chip label={statusLabel[row?.payStatus]} color='primary' style={{ color: "black", backgroundColor: statusColor[row?.payStatus] }} /></TableCell>
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
        </Stack>


    )
}

export default NotProcessReqBillTab