import React from 'react'

//** next */

//** mui */
import { Box, Button, Card, CardContent, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

//** component */
import StyledTableRow from '../../components/StyledTableRow';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

//** service */
import { bulkFetchUploadAPI } from '../../utils/bbps/billerServices';

//** icon */
import { Download, Upload } from '@mui/icons-material';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** hook */
import useAlertDialog from '../../hook/useAlertDialog';
import { useLoader } from '../../Provider/LoaderContext';
import { fetchBulkUploadVerify } from '../../utils/bbps/fetchBulkUploadVerify';

const FetchBulkBillUpload = () => {

    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId, orgName } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [selectedBillFile, setSelectedBillFile] = React.useState(null);
    const [selectedBillExcelList, setSelectedBillExcelList] = React.useState([]);
    const [isVerify, setIsVerify] = React.useState(false);

    const alertRegisterToggleOpen = () => {
        alertDialog({
            rightButtonFunction: uploadVerifyBills,
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
                "OrgAlias": null,
                "BillerAlias": null,
                "ConsumerId": null,

            }
        ]
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.FETCH_BULK_BILL_SHEET);
        XLSX.writeFile(workbook, excelName.FETCH_BULK_BILL_EXCEL);
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
        await fetchBulkUploadVerify(selectedBillExcelList, orgId).then((resp) => {
            setSelectedBillExcelList(resp);
            setIsVerify(true);
        }).catch((error) => {
            console.log("🚀 ~ file: billUpload.js:154 ~ await fetchBulkUploadVerify ~ error:", error)
            openAlertHandle("error", JSON.stringify(error));
        }).finally(() => {
            hideLoader()
        })
    }

    const uploadVerifyBills = async () => {
        showLoader()
        try {
            const filterData = selectedBillExcelList.filter(e => e.Status == 1);
            if (filterData.length > 0) {
                const body = {
                    "type": "FETCH_BILL",
                    "orgId": orgId,
                    "userId": userId,
                    "data": filterData
                }
                const resp = await bulkFetchUploadAPI(body)
                console.log("🚀 ~ file: FetchBulkBillUpload.js:126 ~ uploadVerifyBills ~ resp:", resp)
                openAlertHandle("success", JSON.stringify(resp));
                clearState()
            } else {
                openAlertHandle("error", "Only valid file uploads allowed.");
            }
        } catch (error) {
            openAlertHandle("error", JSON.stringify(error));

        }
        hideLoader()

    }

    const clearState = () => {
        setIsVerify(false)
        setSelectedBillExcelList([])
        setSelectedBillFile(null)
    }

    return (
        <Stack spacing={3}>
            <Card component={"form"}>
                <CardContent>
                    <Box sx={{ '& > :not(style)': { m: 1 }, display: 'flex', flexDirection: 'row', justifyContent: { xs: 'flex-start', sm: 'center' }, alignItems: 'center', flexWrap: 'wrap' }} >
                        <Button startIcon={<Download />} onClick={downloadExcelTemplate} variant="contained">Download Template</Button>
                        <Button startIcon={<Upload />} variant="outlined" component="label"  >
                            {selectedBillFile ? selectedBillFile?.name : "Upload Fetch Bulk Bill File"}
                            <input accept=".xls,.xlsx" onChange={onBillFileChange} type="file" hidden />
                        </Button>
                        {selectedBillExcelList?.length > 0 ? <Button variant="contained" component="label" onClick={fileBillUpload}>
                            Verify File
                        </Button> : null}
                        <Button onClick={clearState} type='reset' color='inherit' variant="contained">Clear</Button>
                    </Box>
                </CardContent>
            </Card>
            {selectedBillExcelList?.length > 0 ?
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Consumer No.</TableCell>
                                    <TableCell align="center">Biller Alias</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Reason</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    selectedBillExcelList && selectedBillExcelList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row =>
                                        <StyledTableRow key={row?.ConsumerId + row?.BillerAlias} >
                                            <TableCell align="center">{row?.ConsumerId}</TableCell>
                                            <TableCell align="center">{row?.BillerAlias}</TableCell>
                                            <TableCell align="center">{row?.Status}</TableCell>
                                            <TableCell align="center">{row?.Reason} </TableCell>
                                        </StyledTableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 20, { label: 'All', value: -1 }]}
                        component="div"
                        count={selectedBillExcelList.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <Box sx={{ m: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                        {isVerify ? <Button onClick={alertRegisterToggleOpen} variant="contained">Upload</Button> : null}
                    </Box>
                </Paper> : null}
        </Stack>
    )
}



export default FetchBulkBillUpload;