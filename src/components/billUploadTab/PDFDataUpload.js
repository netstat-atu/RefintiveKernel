import React from 'react'

//** mui */
import { Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

//** npm */
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';


//** icon */
import { Download, Upload } from '@mui/icons-material';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** hook */
import useAlertDialog from '../../hook/useAlertDialog';
import { useLoader } from '../../Provider/LoaderContext';
import StyledTableRow from '../StyledTableRow';
import CustomModal from '../CustomModal';
import { uploadBillPDFData } from '../../utils/bbps/billerServices';
import { yyyymmdd } from '../../utils/dateFormat';

const PDFDataUpload = () => {

  const { showLoader, hideLoader } = useLoader();
  const { orgId, userId, orgName } = useSelector((state) => state.user);
  const { orgField } = useSelector((state) => state.extra);
  const dispatch = useDispatch();
  const alertDialog = useAlertDialog();
  const [selectedBillFile, setSelectedBillFile] = React.useState(null);
  const [selectedBillExcelList, setSelectedBillExcelList] = React.useState([]);
  const [responseData, setResponseData] = React.useState([]);
  const [isModalFailed, setIsModalFailed] = React.useState(false);

  const [billPage, setBillPage] = React.useState(0);
  const [billRowsPerPage, setBillRowsPerPage] = React.useState(4);
  const handleChangeBillPage = (event, newPage) => setBillPage(newPage);
  const handleChangeBillRowsPerPage = (event) => {
    setBillRowsPerPage(+event.target.value);
    setBillPage(0);
  };
  const alertRegisterToggleOpen = () => {
    alertDialog({
      rightButtonFunction: uploadVerifyBills,
      title: "Alert !",
      desc: `Upload pdf data a bill in ${orgName}.`
    })
  };

  const downloadFailedBillExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(responseData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BILL_FETCH);
    XLSX.writeFile(workbook, `${excelTemplateName(excelName.BILL_FETCH)}`);
  };
  const closeModal = () => {
    clearState()
    setIsModalFailed(false)
    setResponseData([])
  }

  const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }));

  const downloadExcelTemplate = () => {
    let data = [
      {
        "CustomerId": null,
        "ID": null
      }
    ]
    data.map(item => orgField.map((val) => {
      if (val?.typeTable == "BillFetch") {
        item[val.fieldName] = null
      }
    }))
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, excelName.PDF_DATA_SHEET);
    XLSX.writeFile(workbook, excelName.PDF_DATA_EXCEL);
  };

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

  const uploadVerifyBills = async () => {
    showLoader()
    try {
      const body = {
        data: selectedBillExcelList
      }
      const resp = await uploadBillPDFData(body)
      if (resp?.statusCode === 200) {
        openAlertHandle("success", resp.body)
      } else {
        const isData = Array.isArray(JSON?.parse(resp?.body));
        if (isData) {
          setBillPage(0);
          setResponseData(JSON?.parse(resp?.body));
          setIsModalFailed(true)
        } else {
          openAlertHandle("error", resp.body)
        }
      }

    } catch (error) {
      openAlertHandle("error", JSON.stringify(error?.stack));

    }
    clearState()
    hideLoader()

  };

  const clearState = () => {
    setSelectedBillExcelList([])
    setSelectedBillFile(null)
  };


  const ModalRow = ({ row }) => {

    const statusLabel = {
      [true]: "Failure",
      [false]: "Success"
    }
    const statusColor = {
      [true]: "error",
      [false]: "success"
    }
    return (
      <StyledTableRow>
        <TableCell align="center"><Chip label={statusLabel[row?.Error]} color={statusColor[row?.Error]} variant="outlined" /> </TableCell>
        <TableCell align="center">{row?.Reason}</TableCell>
        <TableCell align="center">{row?.ConsumerId}</TableCell>
        <TableCell align="center">{"₹" + (row?.FetchAmount || row?.amount)}</TableCell>
        <TableCell align="center">{row?.FetchBillDate || yyyymmdd(row?.billDate)}</TableCell>
        <TableCell align="center">{row?.FetchDueDate || yyyymmdd(row?.dueDate)}</TableCell>
      </StyledTableRow>
    )
  };
  return (
    <Stack spacing={3}>
      <Card component={"form"}>
        <CardContent>
          <Box sx={{ '& > :not(style)': { m: 1 }, display: 'flex', flexDirection: 'row', justifyContent: { xs: 'flex-start', sm: 'center' }, alignItems: 'center', flexWrap: 'wrap' }} >
            <Button startIcon={<Download />} onClick={downloadExcelTemplate} variant="contained">Download Template</Button>
            <Button startIcon={<Upload />} variant="outlined" component="label"  >
              {selectedBillFile ? selectedBillFile?.name : "Upload Bill PDF Data File"}
              <input accept=".xls,.xlsx" onChange={onBillFileChange} type="file" hidden />
            </Button>
            {selectedBillExcelList?.length > 0 ?
              <Button variant="contained" component="label" onClick={alertRegisterToggleOpen}>
                Upload PDF Data File
              </Button> : null}
            <Button onClick={clearState} type='reset' color='inherit' variant="contained">Clear</Button>
          </Box>
        </CardContent>
      </Card>
      <CustomModal open={isModalFailed} >
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <CardHeader title="Verify Bill" />
          {responseData && responseData.length > 0 ?
            <>
              <TableContainer>
                <Table size="medium" sx={{ minWidth: 650 }} aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Reason</TableCell>
                      <TableCell align="center">Consumer No.</TableCell>
                      <TableCell align="center">Amount</TableCell>
                      <TableCell align="center">Bill Creation Date</TableCell>
                      <TableCell align="center">Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {responseData.slice(billPage * billRowsPerPage, billPage * billRowsPerPage + billRowsPerPage).map((row, index) => {
                      return <ModalRow key={String(row?.ConsumerId) + String(index)} row={row} index={index} />
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[4, 10, 20, 50]}
                component="div"
                count={responseData.length}
                rowsPerPage={billRowsPerPage}
                page={billPage}
                onPageChange={handleChangeBillPage}
                onRowsPerPageChange={handleChangeBillRowsPerPage}
              />
              <CardActions>
                <Button variant='outlined' onClick={downloadFailedBillExcel}>Download Failed Bills</Button>
              </CardActions>
            </>
            : null
          }
          <CardActions>
            <Button variant='contained' color='inherit' onClick={closeModal} >Close</Button>
          </CardActions>
        </Paper>
      </CustomModal>
    </Stack>
  )
}



export default PDFDataUpload;