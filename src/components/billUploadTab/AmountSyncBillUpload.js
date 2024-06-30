import React from 'react'

//** mui */
import { Box, Button, Card, CardContent, Stack } from '@mui/material';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

//** service */
import { amountAsyncUpload, checkStatusStepFunction } from '../../utils/bbps/billerServices';

//** icon */
import { Download, Upload } from '@mui/icons-material';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** hook */
import { useLoader } from '../../Provider/LoaderContext';
import useAlertDialog from '../../hook/useAlertDialog';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';


const AmountSyncBillUpload = () => {

    const { showLoader, hideLoader } = useLoader();
    const { orgName } = useSelector((state) => state.user);
    const alertDialog = useAlertDialog();
    const dispatch = useDispatch();
    const [amountSyncSelectedFile, setAmountSyncSelectedFile] = React.useState(null);
    const [amountSyncBillExcelList, setAmountSyncBillExcelList] = React.useState([]);
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))
    const amountSyncBillOnFileChange = e => {

        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                if (json.length > 0) {
                    const trimmedArray = json.map(obj =>
                        Object.fromEntries(Object.entries(obj).map(([key, value]) => [key.trim(), value]))
                    );
                    console.log("🚀 ~ file: AmountSyncBillUpload.js:46 ~ reader.onload= ~ trimmedArray:", trimmedArray)
                    setAmountSyncBillExcelList(trimmedArray);
                } else {
                    openAlertHandle("error", "Please Insert Data");
                }
            };
            if (reader && e.target.files[0])
                reader?.readAsArrayBuffer(e.target.files[0]);
        }
        setAmountSyncSelectedFile(e.target.files[0])
    };

    const fileAmountSyncBillUpload = async () => {
        showLoader()
        try {
            const resp = await amountAsyncUpload(amountSyncBillExcelList);
            console.log('resp', resp)
            if (resp.statusCode === 200) {
                openAlertHandle("success", JSON.stringify(resp?.body));
            } else {
                openAlertHandle("error", JSON.stringify(resp?.body || resp));
            }
            clearState()
        } catch (error) {
            console.log("🚀 ~ file: billUpload.js:172 ~ uploadVerifyBills ~ error:", error)
            openAlertHandle("error", JSON.stringify(error?.stack || error));
        } finally {
            hideLoader()
        }

    }

    //TODO add check step function 
    const checkStepFunction = (executionArn) => {
        let intervalId;
        async function checkStatus() {
            try {
                const body = { executionArn: executionArn }
                const response = await checkStatusStepFunction(body)
                if (response.statusCode === 200) {
                    const data = JSON.parse(response.body)
                    openAlertHandle("success", data.status);
                    if (data.status === 'SUCCEEDED' || data.status === 'FAILED') {
                        clearInterval(intervalId);
                    }
                } else {
                    clearInterval(intervalId);
                }

            } catch (error) {
                clearInterval(intervalId);
                console.error('Error checking status:', error);
            }
        }
        intervalId = setInterval(checkStatus, 5000);
    }

    const alertRegisterToggleOpen = () => {
        alertDialog({
            rightButtonFunction: fileAmountSyncBillUpload,
            title: "Alert !",
            desc: `upload a bill in ${orgName}.`
        })
    };

    const clearState = () => {
        setAmountSyncBillExcelList([])
        setAmountSyncSelectedFile(null)
    }

    const template = {
        "S.No": null,
        "Request Date": null,
        "Request Type": null,
        "Indus OU Name": null,
        "Trading Partner": null,
        "Supplier Num": null,
        "Supplier Site Name": null,
        "Invoice Date": null,
        "Invoice No.": null,
        "Invoice Amount": null,
        "Indus Lot No.": null,
        "Indus ID": null,
        "Discom Name": null,
        "Account Number": null,
        "Due Date": null,
        "Indus Remarks": null
    }

    const downloadTemplateExcel = async () => {
        const data = [template];
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BATCH_CREATION_TEMPLATE_SHEET);
        XLSX.writeFile(workbook, excelName.BATCH_CREATION_TEMPLATE_EXCEL);
    };

    return (
        <Stack>
            <Card component={"form"}>
                <CardContent>
                    <Box sx={{ '& > :not(style)': { m: 1 }, display: 'flex', flexDirection: 'row', justifyContent: { xs: 'flex-start', sm: 'center' }, alignItems: 'center', flexWrap: 'wrap' }} >
                        <Button startIcon={<Download />} onClick={downloadTemplateExcel} variant="contained">Download Template</Button>
                        <Button startIcon={<Upload />} variant="outlined" component="label"  >
                            {amountSyncSelectedFile ? amountSyncSelectedFile?.name : "Upload Batch Creation File"}
                            <input accept=".xls,.xlsx" onChange={amountSyncBillOnFileChange} type="file" hidden />
                        </Button>
                        {amountSyncBillExcelList.length > 0 ? <Button onClick={alertRegisterToggleOpen} variant="contained">Upload</Button> : null}
                        <Button onClick={clearState} type='reset' color='inherit' variant="contained">Clear</Button>
                    </Box>
                </CardContent>
            </Card>
        </Stack>
    )
}



export default AmountSyncBillUpload;