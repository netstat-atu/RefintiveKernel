import React from 'react'

//** next */
import Head from 'next/head';

//** mui */
import { Box, TextField, Typography, Button, Stack, Card, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TablePagination, TableBody, CardHeader, CardContent, CardActions, Tooltip, Toolbar, Checkbox, IconButton, Divider, LinearProgress, FormControl, MenuItem, Select, InputLabel, Grid, Chip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';

//** component */
import StyledTableRow from '../../components/StyledTableRow';
import { SeverityPill } from '../../components/severity-pill';

//** service */
import { batchVerification, createBatch, getBatchBillList, pdfBillDownload, downloadExcelFromAPI, checkAndUploadBillForBatchCreation } from '../../utils/bbps/billerServices';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { ddmmyy, formatDate } from '../../utils/dateFormat';
import { isEmpty, amountFormat, ORG_ID_LIST, isVerificationStatus, payStatusClientSideTitle, clientStatus, adminStatus } from '../../utils';

//** npm */
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';

//** icon */
import { Delete, Download, NearMe, Payment, PictureAsPdfRounded, Upload } from '@mui/icons-material';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';
import useAlertDialog from '../../hook/useAlertDialog';
import CustomModal from '../CustomModal';
import { excelTemplateName } from '../../utils/excelDownloadManagement/excelName';

const NormalBatchTab = ({ goToPaymentPortal, isRefresh, batchType }) => {

    //** var */
    const { orgId, userId, access, role, batchVerificationUser } = useSelector(state => state.user);
    const { isLoading, showLoader, hideLoader } = useLoader();
    const alertDialog = useAlertDialog()
    const dispatch = useDispatch()
    const isAdmin = access?.isAdmin;
    const isBatchManager = access?.isBatchManager;
    const isBatchVerify = access?.isBatchVerify;
    const isVerifier = access?.isVerifier;

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

    const initialFilterBillBody = {
        "orgId": orgId,
        "batchId": "",
        "userId": "",
        "consumerNumber": "",
        "consumerName": "",
        "stateName": "",
        "billerId": "",
        "billDateFrom": "",
        "billDateTo": "",
        "billDueDateFrom": "",
        "billDueDateTo": "",
        "payStatus": "ALL",
        "rowPerPage": 4,
        "pageNo": 0
    }

    const [isLoader, setIsLoader] = React.useState(false);
    const [filterBody, setFilterBody] = React.useState(initialFilterBody);
    const [filterBillBody, setFilterBillBody] = React.useState(initialFilterBillBody);
    const [billBatchIds, setBillBatchIds] = React.useState([]);
    const [selectedBatch, setSelectedBatch] = React.useState({});
    const [selectedBatchAmount, setSelectedBatchAmount] = React.useState(0);
    const [removeBatchId, setRemoveBatchId] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [batchIdBill, setBatchIdBill] = React.useState([]);
    const [dataBatchListLength, setDataBatchListLength] = React.useState(0);
    const [dataBillListLength, setDataBillListLength] = React.useState(0);
    const [selected, setSelected] = React.useState([]);
    const [totalSelectedAmount, setTotalSelectedAmount] = React.useState(0);
    const [clearFlag, setClearFlag] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [isModal, setIsModal] = React.useState(false);
    const [billPage, setBillPage] = React.useState(0);
    const [billRowsPerPage, setBillRowsPerPage] = React.useState(4);

    const [billFailedPage, setBillFailedPage] = React.useState(0);
    const [failedBillRowsPerPage, setFailedBillRowsPerPage] = React.useState(4);
    const [excelVerificationBill, setExcelVerificationBill] = React.useState([]);
    const [failedExcelVerificationBill, setFailedExcelVerificationBill] = React.useState([]);

    const handleChangePage = async (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeHandle = async (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeSelectHandle = async (e) => setFilterBody({ ...filterBody, "payStatus": e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });


    const handleChangeBillPage = (event, newPage) => setFilterBillBody({ ...filterBillBody, "pageNo": newPage });
    const handleChangeBillRowsPerPage = (event) => setFilterBillBody({ ...filterBillBody, "rowPerPage": event.target.value });


    const handleChangeFailedBillPage = (event, newPage) => setBillFailedPage(newPage);
    const handleChangeFailedBillRowsPerPage = (event) => {
        setFailedBillRowsPerPage(+event.target.value);
        setBillFailedPage(0);
    };
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }));

    const showCheckBox = (row) => {
        if (row.adminPaidAmount == 0 && row.txnReferenceId.toUpperCase() == "NULL") {
            return true;
        }
        return false
    }
    const openModal = () => setIsModal(true);

    const closeModal = () => {
        setIsModal(false)
        setSelectedFile(null)
    }

    const handleOpen = (batch) => {
        setFilterBillBody({ ...filterBillBody, "batchId": batch?.batchId, "payStatus": "UNPAID" })
        setSelectedBatch(batch);
        setSelectedBatchAmount(batch.totalBatchAmountWithTax)
        setOpen(true);
    };

    const handleClose = () => {
        setFilterBillBody({ ...filterBillBody, "pageNo": 0, "payStatus": "ALL" })
        setSelected([])
        setTotalSelectedAmount(0);
        setSelectedBatch({});
        setBatchIdBill([])
        setOpen(false);
    };

    const handleBatchDeleteOpen = (batchId) => {
        setRemoveBatchId(batchId)
        alertDialog({
            title: "Delete Batch",
            desc: "Are you sure you want to delete the batch?",
            rightButtonText: 'Delete',
            rightButtonFunction: removeAll
        })
    };
    const handleBillDeleteOpen = () => {
        alertDialog({
            rightButtonText: 'Delete',
            rightButtonFunction: removeSelectedBills,
            title: "Delete Bill",
            desc: "Are you sure you want to delete the bill?"
        })
    };

    const clearState = () => {
        setFilterBody(initialFilterBody);
        setClearFlag(!clearFlag)
    };

    const batchBillList = async () => {
        showLoader()
        try {
            const body = {
                "type": role === "admin" ? "batchListAdmin" : "batchList",
                "data": { ...filterBody, batchType: batchType }
            }
            const resp = await getBatchBillList(body);
            if (resp != null && resp?.data?.length > 0) {
                setBillBatchIds(resp?.data);
                setDataBatchListLength(resp?.Counts);
            } else {
                setBillBatchIds([]);
                setDataBatchListLength(0);
            }

        } catch (error) {
            console.log("🚀 ~ file: paymentClearance.js:302 ~ batchBillList ~ error:", error);
            setBillBatchIds([]);
            setDataBatchListLength(0);
        } finally {
            hideLoader()

        }

    };
    const onFileChange = async e => {
        showLoader()
        e.preventDefault();
        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                if (json.length > 0) {
                    setExcelVerificationBill(json);
                }
            };
            if (reader && e.target.files[0])
                reader?.readAsArrayBuffer(e.target.files[0]);
        }
        setSelectedFile(e.target.files[0])
        hideLoader()
    };

    const verifyExcelBillForBatch = async () => {
        try {
            setFailedBillRowsPerPage(4);
            setBillFailedPage(0);
            showLoader();
            const reqBody = {
                "type": "VALIDATE_BILL_BATCH",
                "data": excelVerificationBill,
                "orgId": orgId,
                "checkType": "clientTrackId"
            }
            const resp = await checkAndUploadBillForBatchCreation(reqBody);
            if (resp.statusCode == 200) {
                const { isError, body } = resp?.body;
                if (isError) {
                    setFailedExcelVerificationBill(body)
                    openModal();
                } else {
                    await excelBillVerifyClientTrackId()
                }
            }
            // setFailedExcelVerificationBill(validData.filter(bill => bill.Status == 0));
            // setExcelVerificationBill(validData.filter(bill => bill.Status == 1));
            // openModal();
        } catch (error) {
            console.log("🚀 ~ file: paymentVerification.js:319 ~ verifyExcelBillForBatch ~ error:", error);
        } finally {
            hideLoader()
        }
    };

    const handleExcelBatchCreateOpen = () => {
        alertDialog({
            rightButtonText: 'Submit',
            rightButtonFunction: excelBillVerifyClientTrackId,
            title: "Upload VBMSID",
            desc: "Are you sure you want to upload?"
        })
    }
    const excelBillVerifyClientTrackId = async () => {
        closeModal()
        showLoader()
        if (excelVerificationBill.length > 0) {
            try {
                const body = {
                    "type": "UPLOAD_CLIENT_TRACK_ID",
                    "data": excelVerificationBill,
                    "orgId": orgId,
                };
                const response = await checkAndUploadBillForBatchCreation(body);
                console.log("🚀 ~ file: normalBatchTab.js:250 ~ excelBillVerifyClientTrackId ~ response:", response)
                if (response.statusCode == 200) {
                    openAlertHandle("success", JSON.stringify(response.body));
                } else {
                    openAlertHandle("error", JSON.stringify(response.body));
                }
            } catch (error) {
                openAlertHandle("error", JSON.stringify(error));
            } finally {
                setSelectedFile(null)
                clearState();
                batchBillList();
            }
        } else {
            openAlertHandle("error", "No bill available");
        }
        hideLoader()
    };

    const downloadFailedBillExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(failedExcelVerificationBill);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BILL_VBMSID_FAILED_LIST);
        XLSX.writeFile(workbook, `${excelTemplateName(excelName.BILL_VBMSID_FAILED_LIST)}`);
    };
    const downloadExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
                "id": id,
                "name": role === "admin" ? excelName.BILL_CLEARANCE_ADMIN_LIST : excelName.BILL_CLEARANCE_LIST,
                "data": { ...filterBody, batchType: batchType },
                "orgId": orgId,
                "userId": userId
            }
            await downloadExcelFromAPI(body);
            openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")
        } catch (error) {
            console.log("🚀 ~ file: billPayment.js:258 ~ downloadExcel ~ error:", error)

        }
    };

    const getBatchWiseBillList = async () => {
        setIsLoader(true)
        await getBatchBillList({
            "type": "batchWiseBillList",
            "data": filterBillBody
        }).then(e => {
            if (e != null && e?.data?.length > 0) {
                setBatchIdBill(e.data)
                setDataBillListLength(e.Counts)
            }
        });
        setIsLoader(false)
    };

    const style = {
        m: 2,
        pt: 2,
        px: 4,
        pb: 3,
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = batchIdBill?.map((n) => {
                const payableAmount = Number(n?.batchAmount) + (n?.taxAmount ? Number(n?.taxAmount) : 0);
                setTotalSelectedAmount(totalSelectedAmount + payableAmount)
                return n?.ID
            });
            setSelected(newSelected);
            return;
        }
        setTotalSelectedAmount(0);
        setSelected([]);
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    const removeSelectedBills = async () => {
        const body = {
            "type": "REMOVE_SELECTED",
            "data": selected,
            "batchId": selectedBatch?.batchId
        }
        try {
            await createBatch(body);
            handleClose();
            clearState();

        } catch (error) {
            console.log("error", error);
        }
    }
    const removeAll = async () => {
        showLoader()
        const body = {
            "type": "REMOVE_ALL",
            "batchId": removeBatchId
        }
        try {
            await createBatch(body);
            clearState();
        } catch (error) {
            console.log("error", error);
        }
    }

    const batchVerify = async (data) => {
        showLoader()
        handleClose();
        try {
            const body = {
                "type": "VERIFY_BATCH",
                "orgId": orgId,
                "batchId": data?.batchId,
                "batchType": data?.batchType,
                "userId": userId
            };
            const resp = await checkAndUploadBillForBatchCreation(body);
            console.log("🚀 ~ file: normalBatchTab.js:291 ~ batchVerify ~ resp:", resp)
        } catch (error) {
            console.log("🚀 ~ file: batchVerification.js:252 ~ batchVerify ~ error:", error)

        } finally {
            batchBillList()
            hideLoader()
        }
    }

    const [batchNEFTPayOpen, setBatchNEFTPayOpen] = React.useState(false);
    const [NEFTUTRValue, setNEFTUTRValue] = React.useState(null);

    const onFieldChange = (e) => {
        setNEFTUTRValue(e.target.value)
    }
    const openNEFTModal = (batch, type) => {
        setFilterBillBody({ ...filterBillBody, "batchId": batch?.batchId, "payStatus": type })
        setSelectedBatch(batch);
        setSelectedBatchAmount(batch.totalBatchAmountWithTax)
        setBatchNEFTPayOpen(true)
    }
    const closeNEFTModal = () => {
        setFilterBillBody({ ...filterBillBody, "pageNo": 0, "payStatus": "ALL" })
        setSelected([])
        setTotalSelectedAmount(0);
        setSelectedBatch({});
        setBatchIdBill([])
        setBatchNEFTPayOpen(false)
    }
    const batchNEFTUTR = async () => {
        showLoader()
        handleClose();
        try {
            if (NEFTUTRValue) {
                const body = {
                    "type": "NEFT_UTR_UPDATE",
                    "orgId": orgId,
                    "batchId": selectedBatch?.batchId,
                    "userId": userId,
                    "data": NEFTUTRValue
                };
                const resp = await checkAndUploadBillForBatchCreation(body);
                if (resp?.statusCode == 200) {
                    openAlertHandle("success", resp?.data)
                } else {
                    openAlertHandle("error", resp?.data)
                }
                console.log("🚀 ~ file: normalBatchTab.js:327 ~ batchNEFTUTR ~ resp:", resp)
                setNEFTUTRValue(null)
                closeNEFTModal()
                batchBillList()
            } else {
                openAlertHandle("error", "Please insert NEFT UTR")
            }

        } catch (error) {
            console.log("🚀 ~ file: batchVerification.js:252 ~ batchVerify ~ error:", error)

        } finally {
            hideLoader()
        }
    }

    const BillBatchRow = ({ row, index }) => {

        const batchApproval = row?.batchApproval ? JSON.parse(row?.batchApproval) : {};

        const boxStyle = {
            '& > :not(style)': { m: 1 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'center',

        };

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
        };

        const downloadExcel = async (row) => {

            try {
                const id = uuid().toUpperCase();
                const data = {
                    ...filterBillBody,
                    "pageNo": 0,
                    "rowPerPage": row.totalBill,
                    "batchId": row.batchId,
                    "payStatus": row.clientStatus > 0 ? "PAID" : "UNPAID"
                }
                const body = {
                    "type": "CREATE",
                    "id": id,
                    "name": excelName.BILL_CLEARANCE,
                    "data": data,
                    "orgId": orgId,
                    "userId": userId
                }
                await downloadExcelFromAPI(body);
                openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")
            } catch (error) {
                console.log("🚀 ~ file: paymentClearance.js:610 ~ downloadExcel ~ error:", error)
            }


        };

        const batchVerificationFun = async () => {
            showLoader()
            try {

                const body = {
                    type: "NORMAL_BATCH",
                    batchId: row?.batchId,
                    orgId: orgId,
                    userId: userId,
                    clientStatus: row?.clientStatus,
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
                batchBillList()
            }
        };

        const batchVerificationAlert = () => {

            alertDialog({
                title: "Batch Verification",
                desc: "Batch Verify: " + row.batchId,
                children: <Box style={{ margin: 20 }}>
                    {batchVerificationUser.map((e, i) => {
                        return <Stack key={i + e.userId} justifyContent={"space-between"} direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2} >
                            <Typography component="div">
                                {e?.name}
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
        };

        const batchVerificationStatusAlert = () => {
            alertDialog({
                title: "Batch Verification Status",
                desc: "Batch Id: " + row.batchId,
                children: <Box style={{ margin: 20 }}>
                    {batchVerificationUser.map((e, i) => {
                        return <Stack key={i + e.userId} justifyContent={"space-between"} direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={2} >
                            <Typography component="div">
                                {e?.name}
                            </Typography>
                            <SeverityPill color={isVerificationStatus[batchApproval[e.userId]]?.variant}>
                                {isVerificationStatus[batchApproval[e.userId]]?.title}
                            </SeverityPill>
                        </Stack>
                    })
                    }
                </Box>
            })
        };

        const buttonManage = {
            "0": isAdmin ? <Box sx={boxStyle}>
                <Tooltip title="Payment">
                    <IconButton onClick={() => handleOpen(row)} >
                        <Payment color='success' />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Payment NEFT">
                    <IconButton onClick={() => openNEFTModal(row, 'UNPAID')} variant="contained">
                        <NearMe color='info' />
                    </IconButton>
                </Tooltip>
                {/* <Tooltip title="Remove">
                    <IconButton onClick={() => handleBatchDeleteOpen(row.batchId)} >
                        <Delete color='error' />
                    </IconButton>
                </Tooltip> */}
            </Box> : <Box sx={boxStyle}>
                <Chip variant='outlined' label={"Payment Batch Restricted \n to Admin Access Only"} />

            </Box>,
            "1": <Box sx={boxStyle} >
                <SeverityPill color={'success'} >
                    Completed
                </SeverityPill>
            </Box>,
            "2": <Box sx={boxStyle} >
                <SeverityPill color={'success'} >
                    NEFT Completed
                </SeverityPill>
            </Box>,
            "-1": isBatchVerify ? <Box sx={boxStyle}>
                <Button variant='outlined' onClick={batchVerificationAlert} color='info' >Verify</Button>
            </Box> :
                <Box sx={boxStyle}>
                    <SeverityPill onClick={batchVerificationStatusAlert} color="warning">
                        Unverified
                    </SeverityPill>
                </Box>,
            "-2": isVerifier && !batchApproval[userId] ? <Box sx={boxStyle}>
                <Button variant='outlined' onClick={batchVerificationAlert} color='info' >Verify</Button>
            </Box> :
                <Box sx={boxStyle}>
                    <SeverityPill onClick={batchVerificationStatusAlert} >
                        Authorized
                    </SeverityPill>
                </Box>
        };

        const adminButtonManage = {
            "-1": <Box sx={boxStyle} >
                <Button onClick={() => handleOpen(row)} variant='outlined' >Verify</Button>
                {/* <Tooltip title="Remove">
                    <IconButton onClick={() => handleBatchDeleteOpen(row.batchId)}><Delete color='error' /></IconButton>
                </Tooltip> */}
            </Box>,
            "1": <Box sx={boxStyle} >
                <SeverityPill color={'success'} >
                    Completed
                </SeverityPill>
            </Box>,
            "2": <Box sx={boxStyle} >
                <SeverityPill color={'success'} >
                    Completed
                </SeverityPill>
            </Box>,
            "4": <Box sx={boxStyle} >
                <SeverityPill color={'success'} >
                    Completed
                </SeverityPill>
            </Box>
        }

        const getButtonBatchTypeIsTwo = () => {
            if ((row?.adminStatus == 3 || row?.adminStatus == 1) && row?.clientStatus == 0) {
                if (isAdmin) {
                    return <Tooltip title="Payment NEFT">
                        <IconButton onClick={() => openNEFTModal(row, 'ADMIN_PAID')} variant="contained">
                            <NearMe color='info' />
                        </IconButton>
                    </Tooltip>
                } else {
                    return <Chip variant='outlined' label={"Payment Batch Restricted \n to Admin Access Only"} />
                }

            } else if ((row?.adminStatus == 3 || row?.adminStatus == 1) && (row?.clientStatus == 1 || row?.clientStatus == 2)) {
                return <Chip variant='outlined' label={"NEFT Payment Completed"} />
            } else if (row?.adminStatus == 3 || row?.adminStatus == 1 || row?.clientStatus == -1) {
                return <Chip variant='outlined' label={"NEFT Payment Batch Process Completed"} />
            }

        }
        const batchTypeStatusButton = {
            "0": buttonManage[row?.clientStatus],
            "1": <Chip variant='outlined' label={"Batch Successfully Created by Admin"} />,
            "2": getButtonBatchTypeIsTwo()
            // "3": row?.adminStatus ?
            //     isAdmin ?
            //         <Tooltip title="Payment NEFT">
            //             <IconButton onClick={() => openNEFTModal(row, 'ADMIN_PAID')} variant="contained">
            //                 <NearMe color='info' />
            //             </IconButton>
            //         </Tooltip> :
            //         <Chip variant='outlined' color='info' label={"B2P: All bills paid, completed."} />
            //     : row?.clientStatus == -1 ? <Chip variant='outlined' label={"NEFT Payment Batch Process Completed"} /> : <Chip variant='outlined' label={"All bill payments on the admin side have not been completed."} />,
            // "4": <Chip variant='outlined' label={"NEFT Payment Completed"} />,
        }
        const getButton = () => {
            if (role === "admin")
                return adminButtonManage[row?.clientStatus]
            return batchTypeStatusButton[row?.batchType];
        }

        return <StyledTableRow key={index}  >
            <TableCell align="center">{isEmpty(row.batchId)}</TableCell>
            <TableCell align="center">{ddmmyy(row.ts)}</TableCell>
            <TableCell align="center">{isEmpty(row.totalBill)}</TableCell>
            <TableCell align="center">{amountFormat(row?.totalBillAmount)}</TableCell>
            <TableCell align="center">{amountFormat(row?.totalBatchAmountWithTax)}</TableCell>
            <TableCell align="center">{amountFormat(row?.totalClientPaidAmountWithTax)}</TableCell>
            {filterBody.payStatus == "UNPAID" ? null : <TableCell align="center">{ddmmyy(row.PaymentDate)}</TableCell>}
            <TableCell align="center">{amountFormat(row?.totalAdminPaidAmountWithTax)}</TableCell>
            <TableCell align="center">  <IconButton color='info' onClick={pdfDownload}><PictureAsPdfRounded /></IconButton></TableCell>
            <TableCell align="center">  <IconButton color='info' onClick={() => downloadExcel(row)}><Download /></IconButton></TableCell>
            <TableCell align="center"><Chip variant='outlined' label={isEmpty(clientStatus[row.clientStatus]?.title)} color={clientStatus[row.clientStatus]?.color} /></TableCell>
            <TableCell align="center"><Chip variant='outlined' label={isEmpty(adminStatus[row.adminStatus]?.title)} color={adminStatus[row.adminStatus]?.color} /></TableCell>
            {batchType === 2 ? <TableCell align="center">{isEmpty(row.NEFTUTR)}</TableCell> : null}
            <TableCell align="center"> {getButton()}</TableCell>
        </StyledTableRow>
    };

    const EnhancedTableToolbar = (props) => {
        const { numSelected } = props;

        return (
            <Toolbar
                sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 }

                }}
            >
                {numSelected > 0 ? (
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                    >
                        No Of Bill : {numSelected}{",  "}
                        Selected Bill Total Amount : {amountFormat(totalSelectedAmount)}
                    </Typography>
                ) : null}

                {/* {numSelected > 0 ? (
                    <Tooltip title="Remove">
                        <IconButton onClick={handleBillDeleteOpen} ><Delete color='error' /></IconButton>
                    </Tooltip>
                ) : null} */}
            </Toolbar>
        );
    };

    const ModalBillVerify = ({ row }) => {

        const statusLabel = {
            [true]: "Failure",
            [false]: "Success"
        }
        const statusColor = {
            [true]: "error",
            [false]: "success"
        }
        return (
            <StyledTableRow >
                <TableCell align="center"><Chip label={statusLabel[row?.Error]} color={statusColor[row?.Error]} variant="outlined" /> </TableCell>
                <TableCell align="center">{row?.Reason}</TableCell>
                <TableCell align="center">{row?.ConsumerId}</TableCell>
                <TableCell align="center">{row?.ConsumerName}</TableCell>
                <TableCell align="center">{row?.BillerName}</TableCell>
                <TableCell align="center">{"₹" + (row?.BillAmount)}</TableCell>
                <TableCell align="center">{row?.BillCreationDate}</TableCell>
                <TableCell align="center">{row?.BillDueDate}</TableCell>
            </StyledTableRow>
        )
    };


    const ModalRow = ({ row, index }) => {

        const isItemSelected = isSelected(row?.ID);
        const labelId = `enhanced-table-checkbox-${index}`;
        const payableAmount = Number(row?.batchAmount) + (row?.taxAmount ? Number(row?.taxAmount) : 0);
        const isShowCheckBox = row.batchType == 3 ? showCheckBox(row) : true;
        return (
            <StyledTableRow key={index + row?.ID}  >
                <TableCell padding="checkbox">
                    <Checkbox
                        disabled={!isShowCheckBox}
                        color="primary"
                        checked={isItemSelected}
                        onClick={(event) => handleClick(event, row?.ID)}
                        onChange={(e) => e.target.checked ? setTotalSelectedAmount(totalSelectedAmount + payableAmount) : setTotalSelectedAmount(totalSelectedAmount - payableAmount)}
                        inputProps={{
                            'aria-labelledby': labelId,
                        }}
                    />
                </TableCell>

                <TableCell align="center">{row.ConsumerId}</TableCell>
                <TableCell align="center">{isEmpty(row.BillerName)}</TableCell>
                <TableCell align="center">{amountFormat(row.batchAmount)}</TableCell>
                <TableCell align="center">{amountFormat(row.taxAmount)}</TableCell>
                <TableCell align="center">{amountFormat(payableAmount)}</TableCell>
                <TableCell align="center">{ddmmyy(row.billDate)}</TableCell>
                <TableCell align="center">{ddmmyy(row.dueDate)}</TableCell>
            </StyledTableRow>
        )
    };

    React.useEffect(() => {
        batchBillList()
    }, [filterBody.rowPerPage, filterBody.pageNo, filterBody.payStatus, clearFlag, isRefresh]);

    React.useEffect(() => {
        getBatchWiseBillList()
    }, [filterBillBody.rowPerPage, filterBillBody.pageNo, filterBillBody.batchId, selectedBatch])

    return (<>
        <Head>
            <title>
                Bill Clearance
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
                            <FormControl fullWidth size="small" >
                                <InputLabel id="demo-simple-select-label">Choose Batch</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={filterBody.payStatus}
                                    label="Choose Batch"
                                    onChange={onChangeSelectHandle}
                                >
                                    <MenuItem value={"ALL"}>ALL</MenuItem>
                                    <MenuItem value={"UNPAID"}>Pending Batch</MenuItem>
                                    <MenuItem value={"PAID"}>Paid Batch</MenuItem>
                                    <MenuItem value={"CLIENT_PAID"}>Client Paid Batch</MenuItem>
                                    <MenuItem value={"ADMIN_PAID"}>B2P Paid Batch</MenuItem>
                                    <MenuItem value={"UNVERIFIED"}>Unverified Batch</MenuItem>
                                    {orgId == ORG_ID_LIST.HDFC ? <MenuItem value={"NEFT_UPDATE"}>Update NEFT</MenuItem> : null}
                                </Select>
                            </FormControl>
                        </Grid>
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
                                label="Batch Creation Date From"
                                value={filterBody.creationDateFrom || null}
                                onChange={(e) => onChangeDate("creationDateFrom", e)}
                                renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Batch Creation Date To"
                                value={filterBody.creationDateTo || null}
                                onChange={(e) => onChangeDate("creationDateTo", e)}
                                renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        {filterBody.payStatus == "UNPAID" ? null :
                            <>
                                <Grid item xs={2} sm={4} md={4} p={1} >
                                    <DatePicker
                                        inputFormat="dd/MM/yyyy"
                                        label="Client Paid Date From"

                                        value={filterBody.paymentDateFrom || null}
                                        onChange={(e) => onChangeDate("paymentDateFrom", e)}
                                        renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                                    />
                                </Grid>
                                <Grid item xs={2} sm={4} md={4} p={1} >
                                    <DatePicker
                                        inputFormat="dd/MM/yyyy"
                                        label="Client Paid Date To"
                                        value={filterBody.paymentDateTo || null}
                                        onChange={(e) => onChangeDate("paymentDateTo", e)}
                                        renderInput={(params) => <TextField fullWidth size="small" {...params} helperText={null} />}
                                    />
                                </Grid>
                            </>
                        }
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} spacing={3} p={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                            <Button variant='contained'
                                onClick={() => {
                                    setFilterBody({ ...filterBody, "pageNo": 0 })
                                    batchBillList()
                                }} >Search Batch</Button>
                            <Button color='inherit' type='reset' variant="contained" onClick={clearState} >Clear</Button>
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                            {isBatchManager && orgId == ORG_ID_LIST.HDFC ?
                                <Button startIcon={<Upload />} variant="outlined" component="label">
                                    {selectedFile ? selectedFile?.name : "Upload Batch VBMSID File"}
                                    <input accept=".xls,.xlsx,.csv" onChange={onFileChange} type="file" hidden />
                                </Button> : null}
                            {selectedFile ? <Button variant="contained" onClick={verifyExcelBillForBatch}>Verify</Button> : null}
                            <Button startIcon={<Download />} variant='contained' onClick={downloadExcel}>Download Batch</Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Card>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Batch Id</TableCell>
                                <TableCell align="center">Batch Creation Date</TableCell>
                                <TableCell align="center">No Of Bill</TableCell>
                                <TableCell align="center">Total Bill Amount</TableCell>
                                <TableCell align="center">Batch Amount</TableCell>
                                <TableCell align="center">Client Paid Amount</TableCell>
                                {filterBody.payStatus == "UNPAID" ? null : <TableCell align="center">Client Paid Date</TableCell>}
                                <TableCell align="center">B2P Paid Amount</TableCell>
                                <TableCell align="center">PDF</TableCell>
                                <TableCell align="center">Excel</TableCell>
                                <TableCell align="center">Client Status</TableCell>
                                <TableCell align="center">B2P Status</TableCell>
                                {batchType === 2 ? <TableCell align="center">NEFT UTR</TableCell> : null}
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {billBatchIds && billBatchIds.map((row, index) => <BillBatchRow index={index} row={row} key={String(row.batchId) + String(index)} />)}
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
        </Stack>
        <CustomModal open={open}  >
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <CardHeader title="Batch Payment" />
                <EnhancedTableToolbar numSelected={selected.length} />
                {isLoader ? <LinearProgress /> : <TableContainer component={Paper}>
                    <Table size="medium" aria-label="a dense table" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selected?.length > 0 && selected?.length < batchIdBill?.length}
                                        checked={batchIdBill?.length > 0 && selected?.length === batchIdBill?.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </TableCell>
                                <TableCell align="center">Consumer No.</TableCell>
                                <TableCell align="center">Biller Name</TableCell>
                                <TableCell align="center">Amount</TableCell>
                                <TableCell align="center">Convenience Fee with GST</TableCell>
                                <TableCell align="center">Payable Amount</TableCell>
                                <TableCell align="center">Bill Creation Date</TableCell>
                                <TableCell align="center">Due Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {batchIdBill.length > 0 && batchIdBill.map((row, index) => <ModalRow key={String(index) + String(row.ConsumerId)} row={row} index={index} />)}
                        </TableBody>
                    </Table>
                </TableContainer>}
                <TablePagination
                    rowsPerPageOptions={[4]}
                    component="div"
                    count={-1}
                    rowsPerPage={filterBillBody.rowPerPage}
                    page={filterBillBody.pageNo}
                    onPageChange={handleChangeBillPage}
                    onRowsPerPageChange={handleChangeBillRowsPerPage}
                />
                <CardContent>
                    <Typography>Batch Total Amount : {amountFormat(selectedBatchAmount)}</Typography>
                </CardContent>
                <CardActions>
                    {isAdmin && role !== "admin" ?
                        <LoadingButton loading={isLoading} variant='contained' onClick={() => {
                            goToPaymentPortal(selectedBatch);
                            handleClose();
                        }}
                        >Pay</LoadingButton>
                        : null}
                    {role === "admin" ? <LoadingButton loading={isLoading} variant='contained' onClick={() => { batchVerify(selectedBatch) }} >Verify</LoadingButton> : null}
                    <Button disabled={isLoading} variant='contained' color='inherit' onClick={handleClose}>Close</Button>
                </CardActions>
            </Paper>
        </CustomModal>
        <CustomModal open={batchNEFTPayOpen}  >
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <CardHeader title={`Update NEFT UTR ${selectedBatch?.batchId}`} />
                <EnhancedTableToolbar numSelected={selected.length} />
                {isLoader ? <LinearProgress /> : <TableContainer component={Paper}>
                    <Table size="medium" aria-label="a dense table" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        disabled={true}
                                        color="primary"
                                        indeterminate={selected?.length > 0 && selected?.length < batchIdBill?.length}
                                        checked={batchIdBill?.length > 0 && selected?.length === batchIdBill?.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </TableCell>
                                <TableCell align="center">Consumer No.</TableCell>
                                <TableCell align="center">Biller Name</TableCell>
                                <TableCell align="center">Amount</TableCell>
                                <TableCell align="center">Convenience Fee with GST</TableCell>
                                <TableCell align="center">Payable Amount</TableCell>
                                <TableCell align="center">Bill Creation Date</TableCell>
                                <TableCell align="center">Due Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {batchIdBill.length > 0 && batchIdBill.map((row, index) => <ModalRow key={String(index) + String(row.ConsumerId)} row={row} index={index} />)}
                        </TableBody>
                    </Table>
                </TableContainer>}
                <TablePagination
                    rowsPerPageOptions={[4]}
                    component="div"
                    count={-1}
                    rowsPerPage={filterBillBody.rowPerPage}
                    page={filterBillBody.pageNo}
                    onPageChange={handleChangeBillPage}
                    onRowsPerPageChange={handleChangeBillRowsPerPage}
                />
                <CardContent>
                    <Stack spacing={3}>
                        <Typography>{`Batch Id ${selectedBatch?.batchId}`}</Typography>
                        <Typography>Batch Total Amount : {amountFormat(selectedBatchAmount)}</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            name='NEFTUTR'
                            value={NEFTUTRValue}
                            onChange={onFieldChange}
                            id="outlined-basic"
                            label="NEFT UTR"
                            variant="outlined" />
                    </Stack>
                </CardContent>
                <CardActions>
                    {isAdmin && role !== "admin" ? <LoadingButton loading={isLoading} variant='contained' onClick={() => {
                        batchNEFTUTR()
                        closeNEFTModal();
                    }}
                    >Submit</LoadingButton>
                        : null}
                    <Button disabled={isLoading} variant='contained' color='inherit' onClick={closeNEFTModal}>Close</Button>
                </CardActions>
            </Paper>
        </CustomModal>

        <CustomModal open={isModal} >
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>

                <CardHeader title="Verify VBMSID" />
                {failedExcelVerificationBill && failedExcelVerificationBill.length > 0 ?
                    <>
                        <TableContainer>
                            <Table size="medium" sx={{ minWidth: 650 }} aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">Reason</TableCell>
                                        <TableCell align="center">Consumer No.</TableCell>
                                        <TableCell align="center">Consumer Name</TableCell>
                                        <TableCell align="center">Biller Name</TableCell>
                                        <TableCell align="center">Amount</TableCell>
                                        <TableCell align="center">Bill Creation Date</TableCell>
                                        <TableCell align="center">Due Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        failedExcelVerificationBill.slice(billFailedPage * failedBillRowsPerPage, billFailedPage * failedBillRowsPerPage + failedBillRowsPerPage).map((row, index) => {
                                            return <ModalBillVerify key={String(row?.ConsumerId) + String(index)} row={row} index={index} />
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[4, 10, 20, 50]}
                            component="div"
                            count={failedExcelVerificationBill.length}
                            rowsPerPage={failedBillRowsPerPage}
                            page={billFailedPage}
                            onPageChange={handleChangeFailedBillPage}
                            onRowsPerPageChange={handleChangeFailedBillRowsPerPage}
                        />
                        <CardActions>
                            <Button variant='outlined' onClick={downloadFailedBillExcel}>Download Failed Bills</Button>
                        </CardActions>
                    </>
                    : null
                }
                {/* {excelVerificationBill && excelVerificationBill?.length > 0 ?
                    <>
                        <Typography mx={2}>{excelVerificationBill.length} Bill Are Ready To Upload VBMSID </Typography>
                        <CardActions>
                            <LoadingButton variant='contained' onClick={handleExcelBatchCreateOpen}>Submit</LoadingButton>
                        </CardActions>
                    </> : null
                } */}
                <CardActions>
                    <Button variant='contained' color='inherit' onClick={closeModal}>Close</Button>
                </CardActions>
            </Paper>
        </CustomModal>

    </>
    );
}



export default NormalBatchTab;
