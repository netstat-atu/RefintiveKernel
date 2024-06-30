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
import { bulkBillUploadAPI } from '../../utils/bbps/billerServices';
import { prepaidBillVerify } from '../../utils/bbps/prepaidBillVerify';

//** icon */
import { Download, Upload } from '@mui/icons-material';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { isEmpty } from '../../utils';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** hook */
import useAlertDialog from '../../hook/useAlertDialog';
import { useLoader } from '../../Provider/LoaderContext';




const PrepaidAmountUpload = () => {

    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, orgName } = useSelector((state) => state.user);
    const [isVerify, setIsVerify] = React.useState(false);
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [prepaidSelectedFile, setPrepaidSelectedFile] = React.useState(null);
    const [prepaidBillExcelList, setPrepaidBillExcelList] = React.useState([]);

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
            rightButtonFunction: () => { filePrepaidAmountUpload() },
            title: "Alert !",
            desc: `${prepaidBillExcelList.filter(e => e.Status === 1).length} no of entries upload prepaid balance amount in ${orgName}.`
        })
    };

    const prepaidBillOnFileChange = e => {

        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                if (json.length > 0) {
                    setPrepaidBillExcelList(json);
                } else {
                    openAlertHandle("error", "Please Insert Data");
                }

            };
            if (reader && e.target.files[0])
                reader?.readAsArrayBuffer(e.target.files[0]);
        }
        setPrepaidSelectedFile(e.target.files[0])
    };

    const filePrepaidAmountUpload = async () => {

        showLoader()
        const body = {
            "type": "PREPAID_BALANCE_UPLOAD",
            "orgId": orgId,
            "userId": userId,
            "data": prepaidBillExcelList.filter(e => e.Status == 1)
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

    }

    const filePrepaidBillVerify = async () => {
        showLoader();
        await prepaidBillVerify(prepaidBillExcelList, orgId).then((resp) => {
            console.log("🚀 ~ file: PrepaidAmountUpload.js:115 ~ awaitprepaidBillVerify ~ resp:", resp)
            setIsVerify(true);
            setPrepaidBillExcelList(resp);
        }).catch((error) => {
            console.log("🚀 ~ file: billUpload.js:172 ~ uploadVerifyBills ~ error:", error)
            openAlertHandle("error", JSON.stringify(error));
        }).finally(() => {
            hideLoader()
        })

    }

    const downloadPrepaidExcelTemplate = () => {
        let data = [
            {
                ConsumerId: null,
                CurrentBalance: null,
                UpdatedON: null
            }
        ]
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.PREPAID_BULK_BILL_SHEET);
        XLSX.writeFile(workbook, excelName.PREPAID_BULK_BILL_EXCEL);
    }

    const clearState = () => {
        setIsVerify(false)
        setPrepaidBillExcelList([])
        setPrepaidSelectedFile(null)
    }

    return (
        <Stack spacing={3}>
            <Card component={"form"}>
                <CardContent>
                    <Box sx={{ '& > :not(style)': { m: 1 }, display: 'flex', flexDirection: 'row', justifyContent: { xs: 'flex-start', sm: 'center' }, alignItems: 'center', flexWrap: 'wrap' }} >
                        <Button startIcon={<Download />} onClick={downloadPrepaidExcelTemplate} variant="contained">Download Template</Button>
                        <Button startIcon={<Upload />} variant="outlined" component="label"  >
                            {prepaidSelectedFile ? prepaidSelectedFile?.name : "Upload Prepaid Balance File"}
                            <input accept=".xls,.xlsx" onChange={prepaidBillOnFileChange} type="file" hidden />
                        </Button>
                        {prepaidBillExcelList?.length > 0 ?
                            <Button variant="contained" component="label" onClick={filePrepaidBillVerify}>
                                Prepaid Verify
                            </Button> : null}
                        <Button onClick={clearState} type='reset' color='inherit' variant="contained">Clear</Button>
                    </Box>
                </CardContent>
            </Card>
            {prepaidBillExcelList?.length > 0 ?
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Reason</TableCell>
                                    <TableCell align="center">Consumer No.</TableCell>
                                    <TableCell align="center">CurrentBalance</TableCell>
                                    <TableCell align="center">UpdatedON</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    prepaidBillExcelList && prepaidBillExcelList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row =>
                                        <StyledTableRow key={row?.ID} >
                                            <TableCell align="center">{row?.Status}</TableCell>
                                            <TableCell align="center">{row?.Reason} </TableCell>
                                            <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.CurrentBalance)}</TableCell>
                                            <TableCell align="center">{isEmpty(row?.UpdatedON)}</TableCell>
                                        </StyledTableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 20, { label: 'All', value: -1 }]}
                        component="div"
                        count={prepaidBillExcelList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <Box sx={{ m: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        {isVerify && prepaidBillExcelList.length > 0 ? <Button onClick={alertRegisterToggleOpen} variant="contained">Upload</Button> : null}
                    </Box>
                </Paper> : null}
        </Stack>
    )
}



export default PrepaidAmountUpload;