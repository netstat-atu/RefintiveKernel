import * as React from 'react';
import Head from 'next/head';

//** mui */
import { Box, TextField, Typography, Button, Stack, Card, Divider, Grid } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, Paper, TableRow, TableHead, TablePagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** service */
import { downloadExcelFromAPI, reportByFilter } from '../../utils/bbps/billerServices';

//** utils */
import { ddmmyy } from '../../utils/dateFormat';
import { isEmpty, amountFormat } from '../../utils';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { formatDate } from '../../utils/dateFormat';

//** redux  */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

//** component */
import StyledTableRow from '../StyledTableRow';
import { Download } from '@mui/icons-material';


const TransactionReportTable = () => {

    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, role } = useSelector(state => state.user)
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
        "batchId": ""
    };

    const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
    const [clearFlag, setClearFlag] = React.useState(false);
    const [dataLengthTransactionReport, setDataLengthTransactionReport] = React.useState(0);
    const [transactionReportList, setTransactionReportList] = React.useState([]);

    const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) })
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }));

    const clearState = () => {
        setFilterBody(initialStateOfBody);
        setClearFlag(!clearFlag)
    };

    const getSingleReport = async () => {
        showLoader()
        await reportByFilter({
            "type": "SingleReports",
            "data": filterBody,
            "reportType": "TRANSACTION_REPORT"
        }).then((resp) => {
            if (resp !== undefined) {
                setTransactionReportList(resp?.data)
                setDataLengthTransactionReport(resp?.Counts)
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
                "reportType": "TRANSACTION_REPORT",
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
                    Transaction Report
                </title>
            </Head>
            <Stack spacing={3}>
                <Card>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
                        <Typography variant="h6" component="div">Choose Filters</Typography>
                    </Box>
                    <Divider />
                    <Stack>
                        <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <TextField fullWidth value={filterBody.batchId} size="small" onChange={onChangeHandle} name='batchId' id="outlined-basic" label="Batch Id" variant="outlined" />
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
                                    <TableCell align="center">Name</TableCell>
                                    <TableCell align="center">B2P Invoice No</TableCell>
                                    <TableCell align="center">Vendor Amount</TableCell>
                                    <TableCell align="center">Convenience Fee & Tax</TableCell>
                                    <TableCell align="center">Total Bill Amount</TableCell>
                                    <TableCell align="center">Total Client PaidAmount</TableCell>
                                    <TableCell align="center">Total Admin PaidAmount</TableCell>
                                    <TableCell align="center">B2P Paid Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactionReportList.length > 0 && transactionReportList.map((row, index) => {
                                    return (
                                        <StyledTableRow key={String(index) + String(row.batchId)} >
                                            <TableCell align="center">{isEmpty(row?.name)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.batchId)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.totalAmount)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.ConAndTaxfee)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.totalAmount + row?.ConAndTaxfee)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.clientTotalAmount)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.adminTotalAmount)}</TableCell>
                                            <TableCell align="center">{ddmmyy(row?.TransactionDate)}</TableCell>
                                        </StyledTableRow>
                                    )
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


export default TransactionReportTable;
