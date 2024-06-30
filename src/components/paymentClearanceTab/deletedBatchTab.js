import React from 'react'

//** next */
import Head from 'next/head';

//** mui */
import { Box, TextField, Typography, Button, Stack, Card, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TablePagination, TableBody, Divider, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** component */
import StyledTableRow from '../StyledTableRow';

//** service */
import { getBatchBillList, downloadExcelFromAPI } from '../../utils/bbps/billerServices';
//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { ddmmyy, formatDate } from '../../utils/dateFormat';
import { isEmpty, amountFormat } from '../../utils';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

const DeletedBatchTab = () => {

    //** var */
    const { orgId, userId } = useSelector(state => state.user);
    const { showLoader, hideLoader } = useLoader();
    const dispatch = useDispatch()

    const initialFilterBody = {
        "userId": "",
        "orgId": orgId,
        "batchId": "",
        "creationDateFrom": "",
        "creationDateTo": "",
        "deletionDateFrom": "",
        "deletionDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0,
        "payStatus": "ALL",
        "paymentDateFrom": "",
        "paymentDateTo": ""
    }


    const [filterBody, setFilterBody] = React.useState(initialFilterBody);
    const [clearFlag, setClearFlag] = React.useState(false);
    const [deletedBatchIds, setDeletedBatchIds] = React.useState([]);
    const [deleteDataBatchListLength, setDeleteDataBatchListLength] = React.useState(0);




    const handleChangePage = async (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeHandle = async (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });



    const openAlertHandle = (type = "success", message = "Message") => {
        dispatch(openAlertSnack({ type: type, message: message }))
    };

    const clearState = () => {
        setFilterBody(initialFilterBody);
        setClearFlag(!clearFlag)
    };

    const batchBillList = async () => {
        showLoader()
        try {

            const deletedBody = {
                "type": "deletedBatchList",
                "data": filterBody
            }
            const resp = await getBatchBillList(deletedBody);
            if (resp != null && resp?.data?.length > 0) {
                setDeletedBatchIds(resp?.data);
                setDeleteDataBatchListLength(resp?.Counts);
            }

        } catch (error) {
            console.log("🚀 ~ file: paymentClearance.js:302 ~ batchBillList ~ error:", error);
        } finally {
            hideLoader()

        }

    };

    const downloadDeletedBatchExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
                "id": id,
                "name": excelName.BATCH_DELETED_LIST,
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


    const DeleteBatchRow = ({ row, index }) => {

        return (
            <>
                <StyledTableRow key={index}  >
                    <TableCell align="center">{isEmpty(row.batchId)}</TableCell>
                    <TableCell align="center">{ddmmyy(row.batchDeletionDate)}</TableCell>
                    <TableCell align="center">{isEmpty(row.totalBill)}</TableCell>
                    <TableCell align="center">{amountFormat(row?.totalClientPaidAmountWithTax)}</TableCell>
                </StyledTableRow>
            </>
        )

    };
    React.useEffect(() => {
        batchBillList()
    }, [filterBody.rowPerPage, filterBody.pageNo, filterBody.payStatus, clearFlag]);
    return (<>
        <Head>
            <title>
                Deleted Batch
            </title>
        </Head>
        <Stack spacing={3}>
            <Card>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
                    <Typography variant="h6"
                        component="div">
                        Choose Filters
                    </Typography>
                </Box>
                <Divider />
                <Stack component="form">
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
                                label="Batch Deletion Date From"
                                value={filterBody.deletionDateFrom || null}
                                onChange={(e) => onChangeDate("deletionDateFrom", e)}
                                renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Batch Deletion Date To"
                                value={filterBody.deletionDateTo || null}
                                onChange={(e) => onChangeDate("deletionDateTo", e)}
                                renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent={"space-between"} p={1} >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} >
                            <Button variant='contained'
                                onClick={() => {
                                    setFilterBody({ ...filterBody, "pageNo": 0 })
                                    batchBillList()
                                }} >Search Batch</Button>
                            <Button color='inherit' type='reset' variant="contained" onClick={clearState} >Clear</Button>
                        </Stack>
                        <Button variant='contained' onClick={downloadDeletedBatchExcel}>Download Batch</Button>
                    </Stack>
                </Stack>
            </Card>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Batch Id</TableCell>
                                <TableCell align="center">Deletion Date</TableCell>
                                <TableCell align="center">No Of Bills</TableCell>
                                <TableCell align="center">Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deletedBatchIds && deletedBatchIds.map((row, index) => <DeleteBatchRow index={index} row={row} key={String(row.batchId) + String(index)} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 20, { label: 'All', value: -1 }]}
                    component="div"
                    count={-1}
                    rowsPerPage={filterBody.rowPerPage}
                    page={filterBody.pageNo}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Stack >
    </>
    );
}



export default DeletedBatchTab;
