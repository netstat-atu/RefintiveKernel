import * as React from 'react';

//** next */

//** mui */
import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, Paper, TableRow, Button, Stack, Card, Divider, TablePagination, InputLabel, FormControl, Select, MenuItem, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** service */
import { billerNameRequest, billerNameStates, downloadExcelFromAPI, fetchBillFetchReports } from '../../utils/bbps/billerServices';

//** redux */
import { useDispatch, useSelector } from 'react-redux';

//** components */
import StyledTableRow from '../../components/StyledTableRow';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { v4 as uuid } from 'uuid';
import { isEmpty, BILLER_CATEGORY } from '../../utils';
import { formatDate } from '../../utils/dateFormat';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';
import { Download } from '@mui/icons-material';

const AutoBillFetchReport = () => {
    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId } = useSelector(state => state.user);
    const dispatch = useDispatch();
    // variable
    const initialBody = {
        "userId": userId,
        "orgId": orgId,
        "consumerNumber": "",
        "billerId": "",
        "creationReportDateFrom": "",
        "creationReportDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0,
        "stateName": "",
    }

    // state
    const [fetchBill, setFetchBill] = React.useState([]);
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [stateList, setStateList] = React.useState([]);
    const [dataLength, setDataLength] = React.useState(0);
    const [filterBody, setFilterBody] = React.useState(initialBody);
    const [billerName, setBillerName] = React.useState('');
    const [clearFlag, setClearFlag] = React.useState(false);


    // function
    const openAlertHandle = (type, message) => dispatch(openAlertSnack({ type: type, message: message }));
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const handleChangePage = async (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = (event) => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });

    const handleChangeBillerName = (event) => {
        setBillerName(event.target.value);
        let billerNameCode = event.target.value.split('/');
        setFilterBody({ ...filterBody, ["billerId"]: billerNameCode[0] });

    };

    const handleChangeStateName = async (event) => {
        setBillerName('');
        setFilterBody({ ...filterBody, [event.target.name]: event.target.value === "ALL" ? "" : event.target.value, "billerId": "" });
        setStateName(event.target.value);
        billerNameRequest(BILLER_CATEGORY, event.target.value).then((data) => {
            if (data) {
                setBillerNameListData(data);
            }
        });
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

    const downloadExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
                "id": id,
                "name": excelName.AUTO_BILL_FETCH_REPORT,
                "data": filterBody,
                "orgId": orgId,
                "userId": userId
            }
            await downloadExcelFromAPI(body);
            openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")
        } catch (error) {
            console.log("🚀 ~ file: billsFetched.js:170 ~ downloadExcel ~ error:", error)
        }
    };

    const getBillFetchReports = React.useCallback(async () => {

        showLoader()

        const body = {
            "type": "AUTO_FETCH_REPORT",
            "data": filterBody
        }
        await fetchBillFetchReports(body).then((resp) => {
            if (resp?.statusCode == 200) {
                setFetchBill(resp?.body?.data);
                setDataLength(resp?.body?.Counts)
            } else {
                setDataLength(0)
                setFetchBill([])
            }
        }).catch(error => {
            console.log("🚀 ~ file: billsFetched.js:181 ~ await getBillFetchReports ~ error:", error)
        }).finally(() => {
            hideLoader()
        });

    }, [stateName, billerName, filterBody]);



    const clearState = () => {
        setBillerName("")
        setStateName("")
        setFilterBody(initialBody)
        setClearFlag(!clearFlag)
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

    React.useEffect(() => {
        getBillerName()
        getBillerStatesList()
    }, []);

    React.useEffect(() => {
        getBillFetchReports()
    }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo, filterBody.billStatus]);

    return (
        <Stack spacing={3}>
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
                            <TextField fullWidth value={filterBody.consumerNumber} size="small" onChange={onChangeHandle} name='consumerNumber' id="outlined-basic" label="Consumer Number" variant="outlined" />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Creation Report Date From"
                                value={filterBody.creationReportDateFrom || null}
                                onChange={(e) => onChangeDate("creationReportDateFrom", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Creation Report Date To"
                                value={filterBody.creationReportDateTo || null}
                                onChange={(e) => onChangeDate("creationReportDateTo", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={"space-between"} p={1} >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                            <Button onClick={getBillFetchReports} variant="contained">Search Bill</Button>
                            <Button onClick={clearState} variant="contained" color='inherit'>Clear</Button>
                        </Stack>
                        <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
                    </Stack>
                </Stack>
            </Card>
            <Paper>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Customer Name</TableCell>
                                <TableCell align="center">Consumer Id</TableCell>
                                <TableCell align="center">Consumer Name</TableCell>
                                <TableCell align="center">Biller Code</TableCell>
                                <TableCell align="center">Bill Amount</TableCell>
                                <TableCell align="center">Bill Creation Date</TableCell>
                                <TableCell align="center">Bill Due Date</TableCell>
                                <TableCell align="center">Bill Number</TableCell>
                                <TableCell align="center">Previous Amount</TableCell>
                                <TableCell align="center">Previous BillDate</TableCell>
                                <TableCell align="center">Previous DueDate</TableCell>
                                <TableCell align="center">BBPS BillDate</TableCell>
                                <TableCell align="center">BBPS DueDate</TableCell>
                                <TableCell align="center">Response</TableCell>
                                <TableCell align="center">additionalInfoList</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetchBill ? fetchBill.length > 0 && fetchBill.map((row, key) => {
                                return <StyledTableRow key={key}  >
                                    <TableCell align="center">{isEmpty(row?.CustomerName)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.BillerCode)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.Amount)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.BillDate)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.DueDate)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.BillNumber)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.PreviousAmount)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.PreviousBillDate)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.PreviousDueDate)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.BBPSBillDate)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.BBPSDueDate)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.Response)}</TableCell>
                                    <TableCell align="center">{isEmpty(row?.additionalInfoList)}</TableCell>
                                </StyledTableRow>
                            })
                                : <Typography> No Data Available</Typography>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 20, 50, 100]}
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



export default AutoBillFetchReport;