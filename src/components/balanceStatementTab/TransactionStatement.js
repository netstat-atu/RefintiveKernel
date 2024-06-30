import React from 'react'
import Head from 'next/head';

//** mui */
import { Button, Table, TableHead, Paper, TableRow, TableContainer, TableCell, TableBody, Box, Card, Divider, Stack, TextField, Typography, Grid, TablePagination } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** service */
import { downloadExcelFromAPI, getAutoBillFilter, getOrgList } from '../../utils/bbps/billerServices';

//** utils */
import { formatDate } from '../../utils/dateFormat';
import { amountFormat, isEmpty } from '../../utils';
import { excelName } from '../../utils/excelDownloadManagement';

//** redux */
import { useDispatch, useSelector } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

//** npm */
import { v4 as uuid } from 'uuid';
//** component */
import StyledTableRow from '../StyledTableRow';
import { Download } from '@mui/icons-material';

const TransactionStatement = () => {

    const { orgId, userId } = useSelector((state) => state.user);
    const { showLoader, hideLoader, isLoading } = useLoader();

    const dispatch = useDispatch();

    const initialFilterBody = {
        "orgId": orgId,
        "batchId": "",
        "ID": "",
        "creationDateFrom": "",
        "creationDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0
    };

    //** state */
    const [filterBody, setFilterBody] = React.useState(initialFilterBody);
    const [billList, setBillList] = React.useState([]);
    const [dataLength, setDataLength] = React.useState(0);
    const [clearFlag, setClearFlag] = React.useState(false);
    const [balanceAmount, setBalanceAmount] = React.useState(0);

    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))
    const handleChangePage = async (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const getTransactionStatement = async () => {
        showLoader()
        let body = {
            "type": "STATEMENT",
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
            console.log("🚀 ~ file: processBillTab.js:279 ~ getTransactionStatement ~ error:", error)
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
                "name": excelName.STATEMENT_LIST,
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
        setFilterBody(initialFilterBody)
        setClearFlag(!clearFlag)
    };

    const getOrgBalanceAmount = async () => {
        const orgListData = await getOrgList();
        const orgDetails = orgListData?.find((item) => item.orgId == orgId);
        setBalanceAmount(orgDetails?.balanceAmount)
    };
    React.useEffect(() => {
        getOrgBalanceAmount();
        getTransactionStatement();
    }, [clearFlag, filterBody.pageNo, filterBody.rowPerPage]);

    return (
        <>
            <Head>
                <title>
                    Balance Amount
                </title>
            </Head>
            <Stack spacing={3}>
                <Typography variant="h5" component="div" style={{ color: Number(balanceAmount) < 0 ? 'red' : 'green' }} >
                    Balance : {amountFormat(balanceAmount)}
                </Typography>
                <Card>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
                        <Typography variant="h6" component="div">Choose Filters</Typography>
                    </Box>
                    <Divider />
                    <Stack>
                        <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <TextField fullWidth value={filterBody.ID} size="small" onChange={onChangeHandle} name='ID' id="outlined-basic" label="ID" variant="outlined" />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <TextField fullWidth value={filterBody.batchId} size="small" onChange={onChangeHandle} name='batchId' id="outlined-basic" label="Batch Id" variant="outlined" />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Client Paid Date From"
                                    value={filterBody.creationDateFrom || null}
                                    onChange={(e) => onChangeDate("creationDateFrom", e)}
                                    renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Client Paid Date To"
                                    value={filterBody.creationDateTo || null}
                                    onChange={(e) => onChangeDate("creationDateTo", e)}
                                    renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                        </Grid>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent={"space-between"} p={1} >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} >
                                <Button disabled={isLoading} onClick={getTransactionStatement} variant="contained" >Search Statement</Button>
                                <Button onClick={clearState} variant="contained" color='inherit'>Clear</Button>
                            </Stack>
                            <Button startIcon={<Download />} variant='contained' onClick={downloadExcel}>Download Statement</Button>
                        </Stack>
                    </Stack>
                </Card>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="a dense table" size="medium">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">ID</TableCell>
                                    <TableCell align="center">Batch Id</TableCell>
                                    <TableCell align="center">Amount</TableCell>
                                    <TableCell align="center">Description</TableCell>
                                    <TableCell align="center">B2P Paid Date</TableCell>
                                    <TableCell align="center">Balance Amount</TableCell>
                                    <TableCell align="center">Current Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {billList && billList?.length > 0 && billList?.map((row, index) => {
                                    return (
                                        <StyledTableRow key={index}  >
                                            <TableCell align="center">{isEmpty(row?.ID)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.batchId)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.description)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.ts)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.balance)}</TableCell>
                                            <TableCell align="center">{amountFormat(row?.currentBalance)}</TableCell>
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
        </>
    )
}



export default TransactionStatement