import React from 'react'

//** next */

//** mui */
import { Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

//** component */
import StyledTableRow from '../../components/StyledTableRow';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

//** service */
import { bulkBillUploadAPI } from '../../utils/bbps/billerServices';

//** icon */
import { Download, Upload } from '@mui/icons-material';

//** utils */
import { yyyymmdd } from '../../utils/dateFormat';
import { excelName } from '../../utils/excelDownloadManagement';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** hook */
import useAlertDialog from '../../hook/useAlertDialog';
import { useLoader } from '../../Provider/LoaderContext';
import CustomModal from '../CustomModal';

const BulkBillUpload = () => {

    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, orgName } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(4);
    const [selectedBillFile, setSelectedBillFile] = React.useState(null);
    const [selectedBillExcelList, setSelectedBillExcelList] = React.useState([]);
    const [excelData, setExcelData] = React.useState([]);
    const [isVerify, setIsVerify] = React.useState(false);

    const alertRegisterToggleOpen = () => {
        alertDialog({
            rightButtonFunction: () => uploadVerifyBills(excelData.filter((e) => e.Error == false)),
            title: "Alert !",
            desc: `Register a bill in ${orgName}.`
        })
    };

    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };



    const downloadExcelTemplate = () => {
        let data = [
            {
                "BillerAlias": null,
                "ConsumerId": null,
                "BillAmount": null,
                "BillDate": null,
                "BillDueDate": null,
                "ExtraBillAmountStatus": "0",
            }
        ]
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BULK_BILL_SHEET);
        XLSX.writeFile(workbook, excelName.BULK_BILL_EXCEL);
    }
    const downloadFailedExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(excelData.filter((e) => e.Error));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.FAILED_BULK_SHEET);
        XLSX.writeFile(workbook, excelName.FAILED_BULK_EXCEL);
    }



    const onBillFileChange = e => {
        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                if (json.length > 0) {
                    setSelectedBillExcelList(json);
                } else {
                    openAlertHandle("error", "Please Insert Data");
                }
            };
            if (reader && e.target.files[0])
                reader?.readAsArrayBuffer(e.target.files[0]);
        }
        setSelectedBillFile(e.target.files[0])

    };

    const fileBillUpload = async () => {
        showLoader()


        try {
            const body = {
                "type": "VALIDATE_BILL",
                "orgId": orgId,
                "userId": userId,
                "data": selectedBillExcelList
            }
            const data = await bulkBillUploadAPI(body);

            if (data.statusCode == 200) {
                const { isError, body } = data.body
                if (isError) {
                    setIsVerify(true);
                    setExcelData(body)
                } else {
                    uploadVerifyBills(body)
                }

            } else {
                openAlertHandle("error", JSON.stringify(data));
            }
        } catch (error) {
            openAlertHandle("error", JSON.stringify(error?.stack || error));
        }

        hideLoader()

    }

    const uploadVerifyBills = async (data) => {
        // const filterData = selectedBillExcelList.filter(e => e.Status == 1);
        if (data.length > 0) {
            showLoader()
            const body = {
                "type": "MANUAL_BILL",
                "orgId": orgId,
                "userId": userId,
                "data": data
            }
            await bulkBillUploadAPI(body).then((resp) => {
                if (resp.statusCode === 200) {
                    openAlertHandle("success", resp?.data);
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
        } else {
            openAlertHandle("error", "Only valid bill uploads allowed.");
        }
    }

    const clearState = () => {
        setIsVerify(false)
        setSelectedBillExcelList([])
        setSelectedBillFile(null)
    }
    const statusLabel = {
        [true]: "Failure",
        [false]: "Success"
    }
    const statusColor = {
        [true]: "error",
        [false]: "success"
    }

    return (
        <Stack spacing={3}>
            <Card component={"form"}>
                <CardContent>
                    <Box sx={{ '& > :not(style)': { m: 1 }, display: 'flex', flexDirection: 'row', justifyContent: { xs: 'flex-start', sm: 'center' }, alignItems: 'center', flexWrap: 'wrap' }} >
                        <Button startIcon={<Download />} onClick={downloadExcelTemplate} variant="contained">Download Template</Button>
                        <Button startIcon={<Upload />} variant="outlined" component="label"  >
                            {selectedBillFile ? selectedBillFile?.name : "Upload Bulk Bill File"}
                            <input accept=".xls,.xlsx" onChange={onBillFileChange} type="file" hidden />
                        </Button>
                        {selectedBillExcelList?.length > 0 ? <Button variant="contained" component="label" onClick={fileBillUpload}>
                            Verify Bill
                        </Button> : null}
                        <Button onClick={clearState} type='reset' color='inherit' variant="contained">Clear</Button>
                    </Box>
                </CardContent>
            </Card>
            <CustomModal open={isVerify}  >
                {excelData?.length > 0 ?
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <CardHeader title="Verify Bill" />
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Consumer No.</TableCell>
                                        <TableCell align="center">Biller Alias</TableCell>
                                        <TableCell align="center">Amount</TableCell>
                                        <TableCell align="center">Bill Creation Date</TableCell>
                                        <TableCell align="center">Due Date</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">Reason</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        excelData && excelData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row =>
                                            <StyledTableRow key={row.ConsumerId} >
                                                <TableCell align="center">{row?.ConsumerId}</TableCell>
                                                <TableCell align="center">{row?.BillerAlias}</TableCell>
                                                <TableCell align="center">{row?.BillAmount}</TableCell>
                                                <TableCell align="center">{yyyymmdd(row?.BillDate)}</TableCell>
                                                <TableCell align="center">{yyyymmdd(row?.BillDueDate)}</TableCell>
                                                <TableCell align="center"><Chip label={statusLabel[row.Error]} color={statusColor[row.Error]} variant="outlined" /></TableCell>
                                                <TableCell align="center">{row?.Reason} </TableCell>
                                            </StyledTableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[4, 10, { label: 'ALL', value: -1 }]}
                            component="div"
                            count={excelData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                        <CardActions>
                            {
                                excelData.filter((e) => e.Error == false).length > 0 ?
                                    <Button onClick={alertRegisterToggleOpen} variant="contained" >Upload</Button> : null
                            }
                            <Button onClick={downloadFailedExcel} variant="outlined" >Failed Bill Download</Button>
                            <Button variant='contained' color='inherit' onClick={clearState}>Close</Button>
                        </CardActions>
                    </Paper> : null}
            </CustomModal>
        </Stack >
    )
}



export default BulkBillUpload;