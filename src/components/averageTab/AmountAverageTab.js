import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, TextField, MenuItem, FormControl, Select, InputLabel, Typography, Button, Stack, Card, Divider, Grid } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, Paper, TableRow, TableHead, TablePagination } from '@mui/material';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** service */
import { billerNameRequest, billerNameStates, downloadExcelFromAPI, reportByFilter } from '../../utils/bbps/billerServices';

//** utils */
import { isEmpty, amountFormat } from '../../utils';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { formatDate } from '../../utils/dateFormat';
import { BILLER_CATEGORY } from '../../utils';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

//** component */
import StyledTableRow from '../StyledTableRow';
import { Download } from '@mui/icons-material';

const AmountAverageTab = () => {
    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, role } = useSelector(state => state.user);
    const dispatch = useDispatch();
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
    };

    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
    const [stateList, setStateList] = React.useState([]);
    const [billerName, setBillerName] = React.useState('');
    const [clearFlag, setClearFlag] = React.useState(false);
    const [dataLengthBillAverage, setDataLengthBillAverage] = React.useState(0);
    const [billAverageList, setBillAverageList] = React.useState([]);



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
            "reportType": "BILL_AVERAGE_AMOUNT"
        }).then((resp) => {
            if (resp !== undefined) {
                setBillAverageList(resp?.data);
                setDataLengthBillAverage(resp?.Counts);
            }
        }).catch((error) => {
            console.log("🚀 ~ file: AmountAverageTab.js:43 ~ getSingleReport ~ error:", error)
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
                "reportType": "BILL_AVERAGE_AMOUNT",
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

    return (
        <>
            <Head>
                <title>
                    Bill Average
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
                        </Grid>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={"space-between"} p={1} >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                                <Button onClick={getSingleReport} variant="contained">Search Bill</Button>
                                <Button onClick={clearState} type='reset' variant="contained" color='inherit'>Clear</Button>
                            </Stack>
                            <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
                        </Stack>
                    </Stack>
                </Card >
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Consumer No.</TableCell>
                                    <TableCell align="center">Consumer Name</TableCell>
                                    <TableCell align="center">Biller Name</TableCell>
                                    <TableCell align="center">Rolling Average</TableCell>
                                    <TableCell align="center">3 Month Rolling Average</TableCell>
                                    <TableCell align="center">Type Of Supply</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {billAverageList && billAverageList.map((row, index) => {
                                    return (
                                        <StyledTableRow key={String(index) + String(row.ConsumerId)} >
                                            <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.rollingAverage)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.threeMonthAvg)}</TableCell>
                                            <TableCell align="center">{isEmpty(row.typeOfSupply)}</TableCell>
                                        </StyledTableRow>)
                                })}
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


export default AmountAverageTab;
