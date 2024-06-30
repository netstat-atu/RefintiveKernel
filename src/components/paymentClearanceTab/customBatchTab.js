import React from 'react'

//** next */
import Head from 'next/head';

//** mui */
import { Box, TextField, Typography, Button, Stack, Card, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TablePagination, TableBody, CardContent, CardActions, IconButton, Divider, Dialog, DialogTitle, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';

//** component */
import StyledTableRow from '../../components/StyledTableRow';
import { SeverityPill } from '../../components/severity-pill';

//** utils */
import { batchVerification, createBatch, getBatchBillList, pdfBillDownload, getBatchIdFromAPI } from '../../utils/bbps/billerServices';
import { ddmmyy, formatDate } from '../../utils/dateFormat';
import { isEmpty, amountFormat, isVerificationStatus } from '../../utils';

//** npm */
import { useDispatch, useSelector } from 'react-redux';

//** service */

//** icon */
import { PictureAsPdfRounded } from '@mui/icons-material';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';
import useAlertDialog from '../../hook/useAlertDialog';

const CustomBatchTab = ({ goToPaymentPortal, isRefresh }) => {

    //** var */
    const { orgId, userId, access, role, batchVerificationUser } = useSelector(state => state.user);

    const { isLoading, showLoader, hideLoader } = useLoader();
    const alertDialog = useAlertDialog()
    const dispatch = useDispatch()
    const isAdmin = true;
    // access?.isAdmin;
    const isBatchVerify = access?.isBatchVerify;
    const isVerifier = access?.isVerifier;

    //** custom Batch start  */
    const initialCustomBody = {
        "userId": userId,
        "orgId": orgId,
        "batchId": "",
        "creationDateFrom": "",
        "creationDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0,
        "paymentDateFrom": "",
        "paymentDateTo": ""
    }

    const initiateSaveCustomBody = {
        "orgId": orgId,
        "batchId": "",
        "remark": "",
        "totalAmount": ""
    }
    const [customBillBody, setCustomBillBody] = React.useState(initialCustomBody);
    const [saveCustomBody, setSaveCustomBody] = React.useState(initiateSaveCustomBody);
    const [customDataLength, setCustomDataLength] = React.useState(0);
    const [customDataList, setCustomDataList] = React.useState([]);
    const [openCustomForm, setOpenCustomForm] = React.useState(false);
    const [clearFlag, setClearFlag] = React.useState(false);

    const onCustomChangeHandle = (e) => setCustomBillBody({ ...customBillBody, [e.target.name]: e.target.value });
    const onCustomChangeDate = (name, value) => setCustomBillBody({ ...customBillBody, [name]: formatDate(value) });
    const onCustomChange = (e) => setSaveCustomBody({ ...saveCustomBody, [e.target.name]: e.target.value });
    const handleCustomChangePage = (event, newPage) => setCustomBillBody({ ...customBillBody, "pageNo": newPage });
    const handleCustomChangeRowsPerPage = event => setCustomBillBody({ ...customBillBody, "rowPerPage": event.target.value });


    const openAlertHandle = (type = "success", message = "Message") => {
        dispatch(openAlertSnack({ type: type, message: message }))
    };

    const handleCustomOpen = async () => {
        showLoader()

        try {
            const response = await getBatchIdFromAPI(orgId);
            if (response?.statusCode === 200) {
                setSaveCustomBody({ ...saveCustomBody, 'batchId': response?.body });
                setOpenCustomForm(true);
            }
        } catch (error) {
            console.log("🚀 ~ file: paymentClearance.js:96 ~ handleCustomOpen ~ error:", error)
        } finally {
            hideLoader()
        }
    };
    const handleCustomClose = () => {

        setOpenCustomForm(false);
    };
    const getCustomBatchBillList = async () => {
        showLoader()
        await getBatchBillList({
            "type": "customBatchList",
            "data": customBillBody
        }).then(e => {
            if (e != null && e?.data?.length > 0) {
                setCustomDataList(e.data)
                setCustomDataLength(e.Counts)
            }
        });
        hideLoader()
    };




    const clearState = () => {
        setCustomBillBody(initialCustomBody);
        setClearFlag(!clearFlag)
    };

    const createCustomBatch = async () => {
        showLoader()
        handleCustomClose()
        try {
            const batchBody = {
                "type": "CUSTOM_BATCH_CREATE",
                "data": saveCustomBody,
            }
            const batchCreateResponse = await createBatch(batchBody);
            openAlertHandle("success", "Advance Batch created successfully ...")
        } catch (error) {
            console.log("🚀 ~ file: paymentClearance.js:238 ~ createCustomBatch ~ error:", error)
        } finally {
            setSaveCustomBody(initiateSaveCustomBody)
            getCustomBatchBillList()
            hideLoader()
        }
    };

    const CustomBatchRow = ({ row, index }) => {
        const batchApproval = row.batchApproval ? JSON.parse(row?.batchApproval) : {}
        const customBatchPaymentAlert = () => {
            alertDialog({
                title: "Batch Payment",
                desc: "Batch Id: " + row.batchId,
                rightButtonFunction: () => {
                    goToPaymentPortal(row, true);

                },
            })
        }

        const batchVerificationFun = async () => {
            showLoader()
            try {

                const body = {
                    type: "CUSTOM_BATCH",
                    batchId: row?.batchId,
                    orgId: orgId,
                    userId: userId,
                    clientStatus: row?.clientStatus,
                    adminStatus: row?.adminStatus,
                    batchApproval: batchApproval
                }

                const resp = await batchVerification(body);

                if (resp?.statusCode !== 200) {
                    openAlertHandle("error", JSON.stringify(resp?.body))
                }

            } catch (error) {
                console.log("🚀 ~ file: paymentClearance.js:487 ~ batchVerificationFun ~ error:", error)
                openAlertHandle("error", JSON.stringify(error))

            } finally {
                openAlertHandle("success", "Successful verified batch");
                hideLoader()
            }
            getCustomBatchBillList();
        }
        const batchVerificationAlert = () => {

            alertDialog({
                title: "Batch Verification",
                desc: "Batch Verify: " + row.batchId,
                children: <Box style={{ margin: 20 }}>
                    {batchVerificationUser.map((e, i) => {
                        return <Stack key={i + e.userId} justifyContent={"space-between"} direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2} >
                            <Typography component="div">
                                {e.name}
                            </Typography>
                            <SeverityPill color={isVerificationStatus[batchApproval[e.userId]]?.variant}>
                                {isVerificationStatus[batchApproval[e.userId]]?.title}
                            </SeverityPill>
                        </Stack>
                    })
                    }
                </Box>,
                rightButtonText: "Verify",
                rightButtonFunction: () => batchVerificationFun(),
            })
        }
        const batchVerificationStatusAlert = () => {
            alertDialog({
                title: "Batch Verification Status",
                desc: "Batch Id: " + row.batchId,
                children: <Box style={{ margin: 20 }}>
                    {batchVerificationUser.map((e, i) => {
                        return <Stack key={i + e.userId} justifyContent={"space-between"} direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2} >
                            <Typography component="div">
                                {e.name}
                            </Typography>
                            <SeverityPill color={isVerificationStatus[batchApproval[e.userId]]?.variant}>
                                {isVerificationStatus[batchApproval[e.userId]]?.title}
                            </SeverityPill>
                        </Stack>
                    })
                    }
                </Box>
            })
        }

        const pdfDownload = async () => {
            if (row.paymentLink) {
                showLoader()
                const body = {
                    key: row.paymentLink
                }
                await pdfBillDownload(body).then((data) => {
                    window.open(data)
                }).catch((error) => {
                    console.log(error);
                }).finally(() => {
                    hideLoader()

                })
            }

        }
        const buttonManage = {
            "0": isAdmin ? <Button onClick={customBatchPaymentAlert} variant='outlined'>Pay</Button>
                : <SeverityPill onClick={batchVerificationStatusAlert}>Authorized </SeverityPill>,
            "1": <SeverityPill color='success'>Completed</SeverityPill>,
            "2": <SeverityPill color='success'>Completed</SeverityPill>,
            "-1": isBatchVerify ? <Button variant='outlined' onClick={batchVerificationAlert} color='info'>Verify</Button>
                : <SeverityPill onClick={batchVerificationStatusAlert} color="warning">Unverified</SeverityPill>,
            "-2": isVerifier && !batchApproval[userId] ?
                <Button variant='outlined' onClick={batchVerificationAlert} color='info'>Verify</Button>
                : <SeverityPill onClick={batchVerificationStatusAlert} >Authorized </SeverityPill>
        }
        return (
            <StyledTableRow key={index}  >
                <TableCell align="center">{isEmpty(row.batchId)}</TableCell>
                <TableCell align="center">{ddmmyy(row.ts)}</TableCell>
                <TableCell align="center">{isEmpty(row.remark)}</TableCell>
                <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
                <TableCell align="center">
                    <IconButton color='info' onClick={pdfDownload}  >
                        <PictureAsPdfRounded />
                    </IconButton>
                </TableCell>
                {role !== "admin" ?
                    <TableCell align="center">
                        <TableCell align="center">
                            {buttonManage[row?.clientStatus]}
                        </TableCell>
                    </TableCell> : null}
            </StyledTableRow>
        )
    };

    React.useEffect(() => {
        getCustomBatchBillList()
    }, [customBillBody.rowPerPage, customBillBody.pageNo, customBillBody.batchId, clearFlag, isRefresh])

    return (<>
        <Head>
            <title>
                Performa Invoice
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
                <Stack component="form">
                    <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <TextField
                                fullWidth
                                size="small"
                                name='batchId'
                                value={customBillBody.batchId}
                                onChange={onCustomChangeHandle}
                                id="outlined-basic"
                                label="Batch Number"
                                variant="outlined" />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Batch Creation Date From"
                                value={customBillBody.creationDateFrom}
                                onChange={(e) => onCustomChangeDate("creationDateFrom", e)}
                                renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Batch Creation Date To"
                                value={customBillBody.creationDateTo}
                                onChange={(e) => onCustomChangeDate("creationDateTo", e)}
                                renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} spacing={3} p={1} >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}  >
                            <Button variant='contained'
                                onClick={() => {
                                    setCustomBillBody({ ...customBillBody, "pageNo": 0 })
                                    getCustomBatchBillList()
                                }} >Search Batch</Button>
                            <Button color='inherit' type='reset' variant="contained" onClick={clearState} >Clear</Button>
                        </Stack>
                        {role !== "admin" ? <Button variant='contained' onClick={handleCustomOpen} >Create Batch</Button> : null}
                    </Stack>
                </Stack>
            </Card>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Batch Id</TableCell>
                                <TableCell align="center">Creation Date</TableCell>
                                <TableCell align="center">Remark</TableCell>
                                <TableCell align="center">Amount</TableCell>
                                <TableCell align="center">PDF</TableCell>
                                {role !== "admin" ? <TableCell align="center">Option</TableCell> : null}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customDataList && customDataList?.map((row, index) => <CustomBatchRow index={index} row={row} key={String(row.id) + String(index)} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 20, { label: 'All', value: -1 }]}
                    component="div"
                    count={customDataLength}
                    rowsPerPage={customBillBody.rowPerPage}
                    page={customBillBody.pageNo}
                    onPageChange={handleCustomChangePage}
                    onRowsPerPageChange={handleCustomChangeRowsPerPage}
                />
            </Paper>
        </Stack>
        <Dialog open={openCustomForm}>
            <DialogTitle>Create Custom Batch</DialogTitle>
            <CardContent>
                <Typography style={{ marginBottom: 20 }}> Batch Id: {saveCustomBody.batchId}</Typography>
                <TextField
                    fullWidth
                    size="small"
                    name='remark'
                    multiline
                    style={{ marginBottom: 20 }}
                    rows={4}
                    value={saveCustomBody.remark}
                    onChange={onCustomChange}
                    id="outlined-basic"
                    label="Remark"
                    variant="outlined" />
                <TextField
                    fullWidth
                    size="small"
                    name='totalAmount'
                    type='number'
                    value={saveCustomBody.totalAmount}
                    onChange={onCustomChange}
                    id="outlined-basic"
                    label="Amount"
                    variant="outlined" />
            </CardContent>
            <CardActions>
                <Button onClick={handleCustomClose} color='inherit' variant='contained'>Close</Button>
                <LoadingButton loading={isLoading} onClick={() => createCustomBatch()} variant='contained'>Submit</LoadingButton>
            </CardActions>
        </Dialog>
    </>
    );
}


export default CustomBatchTab;
