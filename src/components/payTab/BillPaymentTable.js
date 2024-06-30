import React from 'react'

//** mui */
import { Table, TableBody, TableCell, TableContainer, TableHead, Paper, TableRow, Button, Checkbox, Chip, Stack, TablePagination, Toolbar, Tooltip, Typography, IconButton } from '@mui/material';

//** icon */
import { Edit, Money } from '@mui/icons-material';

//** utils */
import { ddmmyy } from '../../utils/dateFormat';
import { isEmpty, amountFormat, truncateString, ORG_ID_LIST, clientStatus, adminStatus } from '../../utils';

//** hook */
import useAlertDialog from '../../hook/useAlertDialog';

//** component */
import StyledTableRow from '../StyledTableRow';
import DynamicFieldDialog from '../DynamicFieldDialog';

//** service */
import { billVerificationAddComment } from '../../utils/bbps/billerServices';
import { useDispatch, useSelector } from 'react-redux';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import SingleUTREditModal from './SingleUTREditModal';

const BillPaymentTable = ({
    selected,
    billList,
    isSelected,
    handleRetryOpen,
    totalAmount,
    dataLength,
    filterBody,
    handleChangeRowsPerPage,
    clearState,
    handleChangePage,
    enableDisableFunction,
    setTotalAmount,
    handlePayOpen,
    handleClick,
    handleSelectAllClick
}) => {
    const { orgId, userId, isAdmin } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog()
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }));

    const extraBillAmountStatusTitle = {
        0: {
            title: "Normal Bill",
            color: "success.light"
        },
        1: {
            title: "Extra Amount Bill",
            color: "info.light"
        },
        2: {
            title: "Advance Amount Bill",
            color: "info.light"
        }
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
                {filterBody?.payStatus == "CLIENT_PAID" ? <>
                    {numSelected > 0 ? (
                        <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div" >
                            {`No Of Bill : ${numSelected}, Total Amount : ${amountFormat(totalAmount)}`}
                        </Typography>) : (
                        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div" >
                            Bill
                        </Typography>)}
                    {numSelected > 0 ? (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Tooltip title="Disable Selected Bill">
                                <Button
                                    onClick={() =>
                                        alertDialog({
                                            rightButtonFunction: () => enableDisableFunction("DISABLE", filterBody?.payStatus),
                                            title: '"Are you sure you want to enable the bill?"',
                                            desc: `No Of Bill:  ${numSelected}, Total Amount: ${amountFormat(totalAmount)}`,
                                            leftButtonText: 'Cancel',
                                            rightButtonText: 'Disable',
                                        })
                                    } variant="contained">Disable</Button>
                            </Tooltip>
                            <Tooltip title="Pay">
                                <Button startIcon={<Money />} onClick={handlePayOpen} variant="contained">Pay</Button>
                            </Tooltip>
                        </Stack>
                    ) : null}
                </> : null}
                {filterBody?.payStatus == "IN_BATCH" ? <>
                    {numSelected > 0 ? (
                        <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div" >
                            {`No Of Bill : ${numSelected}, Total Amount : ${amountFormat(totalAmount)}`}
                        </Typography>) : (
                        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div" >
                            Bill
                        </Typography>)}
                    {numSelected > 0 ? (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Tooltip title="Disable Selected Bill">
                                <Button
                                    onClick={() =>
                                        alertDialog({
                                            rightButtonFunction: () => enableDisableFunction("DISABLE", filterBody?.payStatus),
                                            title: '"Are you sure you want to enable the bill?"',
                                            desc: `No Of Bill:  ${numSelected}, Total Amount: ${amountFormat(totalAmount)}`,
                                            leftButtonText: 'Cancel',
                                            rightButtonText: 'Disable',
                                        })
                                    } variant="contained">Disable</Button>
                            </Tooltip>
                            <Tooltip title="Pay">
                                <Button startIcon={<Money />} onClick={handlePayOpen} variant="contained">Pay</Button>
                            </Tooltip>
                        </Stack>
                    ) : null}
                </> : null}
                {filterBody?.payStatus == "DISABLE_BILL" ? <>
                    {numSelected > 0 ? (
                        <Typography sx={{ flex: '1 1 100%' }} variant="subtitle1" component="div" >
                            {`No Of Bill : ${numSelected}, Total Amount : ${amountFormat(totalAmount)}`}
                        </Typography>) : (
                        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div" >
                            Bill
                        </Typography>)}
                    {numSelected > 0 ? (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Tooltip title="Enable Selected Bill">
                                <Button onClick={() =>
                                    alertDialog({
                                        rightButtonFunction: () => enableDisableFunction("ENABLE", filterBody?.payStatus),
                                        title: "Are you sure you want to enable the bill?",
                                        desc: `No Of Bill:  ${numSelected}, Total Amount: ${amountFormat(totalAmount)}`,
                                        leftButtonText: 'Cancel',
                                        rightButtonText: 'Enable',
                                    })
                                } variant="contained">Enable</Button>
                            </Tooltip>
                        </Stack>
                    ) : null}
                </> : null}
            </Toolbar>
        );
    };





    const isAllSelectOptionShow = () => {
        if (orgId == ORG_ID_LIST.HDFC) {
            if (filterBody?.payStatus == "CLIENT_PAID" || filterBody?.payStatus == "DISABLE_BILL" || filterBody?.payStatus == "IN_BATCH") {
                return true
            }
        }
        if (filterBody?.payStatus == "CLIENT_PAID" || filterBody?.payStatus == "DISABLE_BILL") {
            return true
        }
        return false
    }

    const PaymentBill = ({ row, index }) => {

        const [isEditModal, setIsEditModal] = React.useState(false);

        const openEditModal = () => setIsEditModal(true)
        const closeEditModal = () => setIsEditModal(false)

        const isSelectOptionShow = () => {
            if (row?.adminStatus == 1 || row?.adminStatus == 3) {
                return false;
            }
            if (orgId == ORG_ID_LIST.HDFC) {
                if (row?.clientStatus == 1 || row?.clientStatus == 2 || row?.clientStatus == 0) {
                    return true
                }
            }
            if (row?.clientStatus == 1 || row?.clientStatus == 2) {
                return true
            }
            return false
        }
        const isItemSelected = isSelected(row);
        const labelId = `enhanced-table-checkbox-${index}`;
        const [remark, setRemark] = React.useState(row?.remark);
        const [remarkOpen, setRemarkOpen] = React.useState(false);
        const handleRemarkOpen = () => setRemarkOpen(true);
        const handleRemarkClose = () => {
            setRemark(row?.remark)
            setRemarkOpen(false);
        }
        const onRemarkChange = event => setRemark(event?.target?.value)
        const submitBillRemark = async () => {
            const body = {
                "type": "remark",
                "data": {
                    "valueRemark": remark,
                    "ID": row.ID
                }
            }
            await billVerificationAddComment(body).then((resp) => {
                if (resp?.statusCode === 200) {
                    openAlertHandle("success", resp?.data);
                } else {
                    openAlertHandle("error", resp?.data);
                }
            }).catch((error) => {
                openAlertHandle("error", JSON.stringify(error));
                console.log("🚀 ~ file: paymentVerification.js:623 ~ await billVerificationAddComment ~ error:", error)
            }).finally(() => {
                handleRemarkClose();
                clearState()
            });
        }

        const checkAmountDifference = (clientPaidAmount, adminPaidAmount) => {
            adminPaidAmount = adminPaidAmount ? Number(adminPaidAmount) : 0;
            clientPaidAmount = clientPaidAmount ? Number(clientPaidAmount) : 0;
            let diff = Math.abs(adminPaidAmount - clientPaidAmount);
            diff = (diff * 100) / clientPaidAmount;
            if (adminPaidAmount >= clientPaidAmount) {
                return diff;
            } else {
                return -diff;
            }
        }

        return (
            <StyledTableRow key={index}  >
                <TableCell padding="checkbox">
                    {row?.extraBillAmountStatus == 0 && isSelectOptionShow() ?
                        <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => handleClick(event, row)}
                            onChange={(e) => e.target.checked ? setTotalAmount(totalAmount + Number(row?.amount)) : setTotalAmount(totalAmount - Number(row?.amount))}
                            inputProps={{ 'aria-labelledby': labelId }}
                        /> : null
                    }
                </TableCell>
                {isAdmin ? <TableCell align="center">
                    <IconButton onClick={openEditModal} >
                        <Edit />
                    </IconButton>
                </TableCell> : null}
                <TableCell align="center">{isEmpty(row?.orgAlias)}</TableCell>
                <TableCell align="center">{isEmpty(row?.batchId)}</TableCell>
                <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
                <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
                <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
                <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
                <TableCell align="center">{amountFormat(row?.clientPaidAmount)}</TableCell>
                <TableCell align="center">{amountFormat(row?.adminPaidAmount)}</TableCell>
                <TableCell align="center">{amountFormat(row?.differenceAmount)}</TableCell>
                <TableCell align="center">{checkAmountDifference(row?.clientPaidAmount, row?.adminPaidAmount).toFixed(2) + " %"}</TableCell>
                <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
                <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
                <TableCell align="center">{ddmmyy(row?.PaymentDate)}</TableCell>
                <TableCell align="center"><Button onClick={handleRemarkOpen}>{isEmpty(truncateString(remark))}</Button></TableCell>
                <TableCell align="center">{ddmmyy(row?.TransactionDate)}</TableCell>
                <TableCell align="center">{isEmpty(row?.txnReferenceId)}</TableCell>
                <TableCell align="center">{isEmpty(row?.payType)}</TableCell>
                <TableCell align="center"><Chip variant='outlined' label={clientStatus[row?.clientStatus]?.title} color={clientStatus[row?.clientStatus]?.color} /></TableCell>
                <TableCell align="center"><Chip variant='outlined' label={adminStatus[row?.adminStatus]?.title} color={adminStatus[row?.adminStatus]?.color} /></TableCell>
                <TableCell align="center" sx={{ color: "neutral.100", backgroundColor: extraBillAmountStatusTitle[row?.extraBillAmountStatus].color }} >{extraBillAmountStatusTitle[row?.extraBillAmountStatus].title}</TableCell>
                <SingleUTREditModal clearState={clearState} data={row} open={isEditModal} onClose={closeEditModal} />
                <DynamicFieldDialog open={remarkOpen} handleClose={handleRemarkClose} value={remark} label={"Your Remark"} onChange={onRemarkChange} onSubmit={submitBillRemark} />
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
                                {isAllSelectOptionShow() ?
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
                            <TableCell align="center">Edit</TableCell>
                            <TableCell align="center">Customer Id</TableCell>
                            <TableCell align="center">Batch Id</TableCell>
                            <TableCell align="center">Consumer No.</TableCell>
                            <TableCell align="center">Consumer Name</TableCell>
                            <TableCell align="center">Biller Name</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Client Paid Amount</TableCell>
                            <TableCell align="center">Admin Paid Amount</TableCell>
                            <TableCell align="center">Difference Paid Amount</TableCell>
                            <TableCell align="center">Difference Paid Percentage</TableCell>
                            <TableCell align="center">Bill Creation Date</TableCell>
                            <TableCell align="center">Due Date</TableCell>
                            <TableCell align="center">Client Paid Date</TableCell>
                            <TableCell align="center">Remark</TableCell>
                            <TableCell align="center">B2P Paid Date</TableCell>
                            <TableCell align="center">TxnReferenceId</TableCell>
                            <TableCell align="center">Pay Type</TableCell>
                            <TableCell align="center">Client Status</TableCell>
                            <TableCell align="center">B2P Status</TableCell>
                            <TableCell align="center">Bill Type</TableCell>
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

export default BillPaymentTable
