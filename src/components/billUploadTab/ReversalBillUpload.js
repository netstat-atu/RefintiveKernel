import React from 'react'

//** next */

//** mui */
import { Box, Button, Card, CardContent, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

//** component */
import StyledTableRow from '../StyledTableRow';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

//** service */
import { reversalBillFromAPI } from '../../utils/bbps/billerServices';
import { reversalBillVerify } from '../../utils/bbps/reversalBillVerify';

//** icon */
import { Download, Upload } from '@mui/icons-material';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { yyyymmdd } from '../../utils/dateFormat';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** redux */
import useAlertDialog from '../../hook/useAlertDialog';
import { useLoader } from '../../Provider/LoaderContext';


const ReversalBillUpload = () => {

    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, orgName } = useSelector((state) => state.user);
    const [isVerify, setIsVerify] = React.useState(false);
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [reversalSelectedFile, setReversalSelectedFile] = React.useState(null);
    const [reversalBillExcelList, setReversalBillExcelList] = React.useState([]);

    const openAlertHandle = (type = "success", message = "Message") => {
        dispatch(openAlertSnack({ type: type, message: message }))
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    const alertRegisterToggleOpen = () => {
        alertDialog({
            rightButtonFunction: () => { fileReversalBillUpload() },
            title: "Alert !",
            desc: `Upload Reversal bill in ${orgName}.`
        })
    };
    const reversalBillOnFileChange = e => {

        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                if (json.length > 0) {
                    setReversalBillExcelList(json);
                } else {
                    openAlertHandle("error", "Please Insert Data");
                }

            };
            if (reader && e.target.files[0])
                reader?.readAsArrayBuffer(e.target.files[0]);
        }
        setReversalSelectedFile(e.target.files[0])
    };

    const fileReversalBillUpload = async () => {

        showLoader()
        const body = {
            "type": "UPLOAD_REVERSAL_BILL",
            "orgId": orgId,
            "userId": userId,
            "data": reversalBillExcelList.filter(e => e.Status === 1)
        }
        await reversalBillFromAPI(body).then((resp) => {
            if (resp.statusCode === 200) {
                openAlertHandle("success", "Successfully uploaded");
            } else {
                openAlertHandle("error", JSON.stringify(resp?.data));
            }
            clearState()
        }).catch((error) => {
            console.log("🚀 ~ file: billUpload.js:172 ~ uploadVerifyBills ~ error:", error)
            openAlertHandle("error", JSON.stringify(error));

        }).finally(() => {
            hideLoader()
        })

    }
    const fileReversalBillVerify = async () => {
        showLoader();
        await reversalBillVerify(reversalBillExcelList, orgId).then((resp) => {
            setIsVerify(true);
            setReversalBillExcelList(resp);
        }).catch((error) => {
            console.log("🚀 ~ file: billUpload.js:172 ~ uploadVerifyBills ~ error:", error)
            openAlertHandle("error", JSON.stringify(error));
        }).finally(() => {
            hideLoader()
        })

    }

    const downloadReversalExcelTemplate = () => {
        let data = [
            {
                "ID": null,
                "BillerCode": null,
                "BillerName": null,
                "ConsumerId": null,
                "BillAmount": null,
                "DueDate": null,
                "TxnReferenceId": null,
                "clientTrackId": null,
                "PaidAmount": null,
                "Difference": null,
                "DateOfPayment": null,
                "Remark": null,
                "RefundDate": null,
                "RefundUTR": null
            }
        ]
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.REVERSAL_BULK_BILL_SHEET);
        XLSX.writeFile(workbook, excelName.REVERSAL_BULK_BILL_EXCEL);
    }

    const clearState = () => {
        setIsVerify(false)
        setReversalBillExcelList([])
        setReversalSelectedFile(null)
    }
    return (
        <Stack spacing={3}>
            <Card component={"form"}>
                <CardContent>
                    <Box sx={{ '& > :not(style)': { m: 1 }, display: 'flex', flexDirection: 'row', justifyContent: { xs: 'flex-start', sm: 'center' }, alignItems: 'center', flexWrap: 'wrap' }} >
                        <Button startIcon={<Download />} onClick={downloadReversalExcelTemplate} variant="contained">Download Template</Button>
                        <Button startIcon={<Upload />} variant="outlined" component="label"  >
                            {reversalSelectedFile ? reversalSelectedFile?.name : "Upload Reversal Bill File"}
                            <input accept=".xls,.xlsx" onChange={reversalBillOnFileChange} type="file" hidden />
                        </Button>
                        {reversalBillExcelList?.length > 0 ?
                            <Button variant="contained" component="label" onClick={fileReversalBillVerify}>
                                Reversal Bill Verify
                            </Button> : null}
                        <Button onClick={clearState} type='reset' color='inherit' variant="contained">Clear</Button>
                    </Box>
                </CardContent>
            </Card>
            {reversalBillExcelList?.length > 0 ?
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Reason</TableCell>
                                    <TableCell align="center">ID</TableCell>
                                    <TableCell align="center">Consumer No.</TableCell>
                                    <TableCell align="center">Biller Code</TableCell>
                                    <TableCell align="center">Bill Amount</TableCell>
                                    <TableCell align="center">Due Date</TableCell>
                                    <TableCell align="center">TxnReferenceId</TableCell>
                                    <TableCell align="center">clientTrackId</TableCell>
                                    <TableCell align="center">PaidAmount</TableCell>
                                    <TableCell align="center">Difference</TableCell>
                                    <TableCell align="center">DateOfPayment</TableCell>
                                    <TableCell align="center">Remark</TableCell>
                                    <TableCell align="center">RefundDate</TableCell>
                                    <TableCell align="center">RefundUTR</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reversalBillExcelList && reversalBillExcelList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row =>
                                    <StyledTableRow key={row?.ID} >
                                        <TableCell align="center">{row?.Status}</TableCell>
                                        <TableCell align="center">{row?.Reason} </TableCell>
                                        <TableCell align="center">{row?.ID}</TableCell>
                                        <TableCell align="center">{row?.ConsumerId}</TableCell>
                                        <TableCell align="center">{row?.BillerCode}</TableCell>
                                        <TableCell align="center">{row?.BillAmount}</TableCell>
                                        <TableCell align="center">{yyyymmdd(row?.DueDate)}</TableCell>
                                        <TableCell align="center">{row?.TxnReferenceId}</TableCell>
                                        <TableCell align="center">{row?.clientTrackId}</TableCell>
                                        <TableCell align="center">{row?.PaidAmount}</TableCell>
                                        <TableCell align="center">{row?.Difference}</TableCell>
                                        <TableCell align="center">{yyyymmdd(row?.DateOfPayment)}</TableCell>
                                        <TableCell align="center">{row?.Remark}</TableCell>
                                        <TableCell align="center">{yyyymmdd(row?.RefundDate)}</TableCell>
                                        <TableCell align="center">{row?.RefundUTR}</TableCell>
                                    </StyledTableRow>
                                )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 20, { label: 'All', value: -1 }]}
                        component="div"
                        count={reversalBillExcelList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <Box sx={{ m: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        {isVerify && reversalBillExcelList.length > 0 ? <Button onClick={alertRegisterToggleOpen} variant="contained">Upload</Button> : null}
                    </Box>
                </Paper> : null}
        </Stack>
    )
}



export default ReversalBillUpload;