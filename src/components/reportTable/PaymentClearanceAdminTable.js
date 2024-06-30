import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, Container, TextField, Typography, Button, Stack, Card, Divider, Grid, Chip } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, Paper, TableRow, TableHead, TablePagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** service */
import { downloadExcelFromAPI, reportByFilter } from '../../utils/bbps/billerServices';

//** utils */
import { ddmmyy } from '../../utils/dateFormat';
import { isEmpty, amountFormat, payStatusAdminSideTitle, adminStatus } from '../../utils';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { formatDate } from '../../utils/dateFormat';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

//** component */
import StyledTableRow from '../StyledTableRow';
import { Download } from '@mui/icons-material';


const PaymentClearanceAdminTable = () => {
    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, role } = useSelector(state => state.user)
    const dispatch = useDispatch();
    const initialStateOfBody = {
        "orgId": orgId,
        "userId": "",
        "billerName": "",
        "consumerName": "",
        "rowPerPage": 10,
        "pageNo": 0,
        "paymentDateFrom": "",
        "paymentDateTo": "",
        "stateName": "",
        "billerId": "",
        "batchId": "",
        "batchCreationDateFrom": "",
        "batchCreationDateTo": ""
    };

    const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
    const [clearFlag, setClearFlag] = React.useState(false);
    const [dataLengthClearance, setDataLengthClearance] = React.useState(0);
    const [clearanceReportList, setClearanceReportList] = React.useState([]);

    const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) })
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))

    const clearState = () => {
        setFilterBody(initialStateOfBody);
        setClearFlag(!clearFlag)
    };


    const getSingleReport = async () => {
        showLoader()
        await reportByFilter({
            "type": "SingleReports",
            "data": filterBody,
            "reportType": "CLEARANCE_ADMIN"
        }).then((resp) => {
            if (resp !== undefined) {
                setClearanceReportList(resp?.data)
                setDataLengthClearance(resp?.Counts)
            }
        }).catch((error) => {
            console.log("🚀 ~ file: TransactionReport.js:42 ~ getSingleReport ~ error:", error)
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
                "reportType": "CLEARANCE_ADMIN",
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
        getSingleReport()
    }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo])

    return (
        <>
            <Head>
                <title>
                    Payment Clearance
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
                                <TextField
                                    fullWidth
                                    size="small"
                                    name='batchId'
                                    value={filterBody.batchId}
                                    onChange={onChangeHandle}
                                    id="outlined-basic"
                                    label="Batch Number"
                                    variant="outlined" />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Batch Creation Date From"
                                    value={filterBody.batchCreationDateFrom || null}
                                    onChange={(e) => onChangeDate("batchCreationDateFrom", e)}
                                    renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Batch Creation Date To"
                                    value={filterBody.batchCreationDateTo || null}
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
                        </Grid>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={"space-between"} p={1} >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
                                <Button onClick={getSingleReport} variant="contained">Search Batch</Button>
                                <Button onClick={clearState} type='reset' variant="contained" color='inherit'>Clear</Button>
                            </Stack>
                            <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Batch</Button>
                        </Stack>
                    </Stack>
                </Card>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">CustomerName</TableCell>
                                    <TableCell align="center">PAN Number</TableCell>
                                    <TableCell align="center">BatchId</TableCell>
                                    <TableCell align="center">No Of Bill</TableCell>
                                    <TableCell align="center">Batch Creation Date</TableCell>
                                    <TableCell align="center">Total Bill Amount</TableCell>
                                    <TableCell align="center">Total Client Paid Amount</TableCell>
                                    <TableCell align="center">Total Admin Paid Amount</TableCell>
                                    <TableCell align="center">Total Conv Fee Amount</TableCell>
                                    <TableCell align="center">Total GST Amount</TableCell>
                                    <TableCell align="center">Total ConvFee With GST Amount</TableCell>
                                    <TableCell align="center">Total Client Paid With Conv GST Amount</TableCell>
                                    <TableCell align="center">Client Paid Date</TableCell>
                                    <TableCell align="center">B2P Paid Date</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            {<TableBody>
                                {clearanceReportList.length > 0 && clearanceReportList.map((row, index) => {
                                    return <StyledTableRow key={String(index) + String(row.batchId)} >
                                        <TableCell align="center">{isEmpty(row?.CustomerName)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.PANNumber)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.BatchId)}</TableCell>
                                        <TableCell align="center">{isEmpty(row?.NoOfBill)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.BatchCreationDate)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.TotalBillAmount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.TotalClientPaidAmount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.TotalAdminPaidAmount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.TotalConvFeeAmount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.TotalGSTAmount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.TotalConvFeeWithGSTAmount)}</TableCell>
                                        <TableCell align="center">{amountFormat(row?.TotalClientPaidWithConvGSTAmount)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.PaymentDate)}</TableCell>
                                        <TableCell align="center">{ddmmyy(row?.TransactionDate)}</TableCell>
                                        <TableCell align="center"><Chip variant='outlined' label={adminStatus[row?.adminStatus]?.title} color={adminStatus[row?.adminStatus]?.color} /></TableCell>
                                    </StyledTableRow>
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


export default PaymentClearanceAdminTable;
