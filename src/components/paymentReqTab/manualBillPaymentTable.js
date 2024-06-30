import React from 'react'

//** mui */
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, TableRow, Button, Checkbox, Stack, TablePagination, Toolbar, Tooltip, Typography, Chip, IconButton } from '@mui/material';

//** icon */
import { Money, Receipt, Restore } from '@mui/icons-material';

//** utils */
import { ddmmyy } from '../../utils/dateFormat';
import { isEmpty, amountFormat } from '../../utils';

//** hook */
import useAlertDialog from '../../hook/useAlertDialog';

//** component */
import StyledTableRow from '../StyledTableRow';

//** service */
import { useDispatch, useSelector } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { pdfBillDownload } from '../../utils/bbps/billerServices';

const ManualBillPaymentTable = ({
    selected,
    billList,
    isSelected,
    totalAmount,
    dataLength,
    filterBody,
    handleChangeRowsPerPage,
    clearState,
    handleChangePage,
    setTotalAmount,
    handlePayOpen,
    handleRetryOpen,
    handleClick,
    handleSelectAllClick
}) => {
    const { orgId, userId } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog()
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }));

    const pdfDownload = async (pdfLink) => {
        const body = { key: pdfLink }
        await pdfBillDownload(body).then((data) => {
            window.open(data)
        }).catch((error) => {
            console.log(error);
        })
    }
    const EnhancedTableToolbar = () => {

        const numSelected = selected?.length;
        const toolBarStyle = {
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: 'action.selected'
        }

        return (
            <Toolbar sx={toolBarStyle}>
                {filterBody?.payStatus == "PENDING" ? <>
                    {numSelected > 0 ? (
                        <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div" >
                            {`No Of Bill : ${numSelected}, Total Amount : ${amountFormat(totalAmount)}`}
                        </Typography>) : (
                        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div" >
                            Bill
                        </Typography>)}
                    {numSelected > 0 ? (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Tooltip title="Pay">
                                <Button startIcon={<Money />} onClick={handlePayOpen} variant="contained">Pay</Button>
                            </Tooltip>
                            <Tooltip title="Retry">
                                <Button startIcon={<Restore />} onClick={handleRetryOpen} variant="contained">Retry</Button>
                            </Tooltip>
                        </Stack>
                    ) : null}
                </> : null}
            </Toolbar>
        );
    };

    const PaymentBill = ({ row, index }) => {
        const isItemSelected = isSelected(row);
        const labelId = `enhanced-table-checkbox-${index}`;
        const payStatus = {
            "0": {
                title: "Pending",
                color: "warning",
            },
            "1": {
                title: "Pending",
                color: "warning",
            },
            "2": {
                title: "Success",
                color: "success",
            },
            "3": {
                title: "Failure",
                color: "error",
            }
        }
        return (
            <StyledTableRow key={index}  >
                <TableCell padding="checkbox">
                    {filterBody.payStatus == "PENDING" ?
                        <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => handleClick(event, row)}
                            onChange={(e) => e.target.checked ? setTotalAmount(totalAmount + Number(row?.amount)) : setTotalAmount(totalAmount - Number(row?.amount))}
                            inputProps={{ 'aria-labelledby': labelId }}
                        /> : null
                    }
                </TableCell>
                <TableCell align="center">{isEmpty(row?.clientTrackId)}</TableCell>
                <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
                <TableCell align="center">{isEmpty(row?.billerName)}</TableCell>
                <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
                <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
                <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
                <TableCell align="center">{amountFormat(row?.clientPaidAmount)}</TableCell>
                <TableCell align="center">{ddmmyy(row?.PaymentDate)}</TableCell>
                <TableCell align="center">{amountFormat(row?.adminPaidAmount)}</TableCell>
                <TableCell align="center">{isEmpty(row?.txnReferenceId)}</TableCell>
                <TableCell align="center">{ddmmyy(row?.TransactionDate)}</TableCell>
                {
                    filterBody.payStatus == "SUCCESS" ?
                        <TableCell align="center">{row.paymentReceiptPdf ? <IconButton onClick={() => pdfDownload(row.paymentReceiptPdf)}  ><Receipt /></IconButton> : "N/A"}</TableCell> : null

                }
                <TableCell align="center"><Chip variant='outlined' label={payStatus[row?.payStatus].title} color={payStatus[row?.payStatus].color} /></TableCell>
            </StyledTableRow>
        )
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {selected?.length ? <EnhancedTableToolbar /> : null}
            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="a dense table" size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                {filterBody.payStatus == "PENDING" ?
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selected?.length > 0 && selected.length < billList?.length}
                                        checked={billList?.length > 0 && selected?.length === billList?.length}
                                        onChange={(event) => {
                                            handleSelectAllClick(event, billList)
                                        }}
                                    />
                                    : null}
                            </TableCell>
                            <TableCell align="center">QEB No.</TableCell>
                            <TableCell align="center">Consumer No.</TableCell>
                            <TableCell align="center">Consumer Name</TableCell>
                            <TableCell align="center">Biller Name</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Bill Creation Date</TableCell>
                            <TableCell align="center">Due Date</TableCell>
                            <TableCell align="center">Client Paid Amount</TableCell>
                            <TableCell align="center">Client Paid Date</TableCell>
                            <TableCell align="center">Admin Paid Amount</TableCell>
                            <TableCell align="center">UTR</TableCell>
                            <TableCell align="center">Admin Paid Date</TableCell>
                            {
                                filterBody.payStatus == "SUCCESS" ?
                                    <TableCell align="center">Receipt</TableCell> : null
                            }
                            <TableCell align="center">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {billList && billList?.length > 0 && billList?.map((row, index) => <PaymentBill key={index} row={row} index={index} />)}
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
    )
}

export default ManualBillPaymentTable
