import * as React from 'react';

//** next */
import Router from 'next/router';
import Head from 'next/head';

//** mui */
import { Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, Paper, TableRow, Button, Stack, Card, Divider, TablePagination, IconButton, InputLabel, FormControl, Select, MenuItem, Toolbar, Checkbox, Tooltip, Grid, CardHeader, CardActions, Chip } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';

//** icon */
import { Download, PictureAsPdfRounded, Upload, UploadFileRounded } from '@mui/icons-material';

//** service */
import { billerNameRequest, billerNameStates, billFetchListFilter, downloadExcelFromAPI, getOrgList, pdfBillDownload, pdfBillFetchUpload, updateBillFetch, uploadBillFetch, verifyBillFetch } from '../../utils/bbps/billerServices';
import { pathNameBaseOnStage } from '../../services/configHandle';

//** redux */
import { useDispatch, useSelector } from 'react-redux';

//** components */
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import DynamicFieldDialog from '../../components/DynamicFieldDialog';
import StyledTableRow from '../../components/StyledTableRow';
import BBPSLogo from '../../components/BBPSLogo';
import CButton from '../../components/CButton';

//** npm */
import * as XLSX from 'xlsx';
import { v4 as uuid } from 'uuid';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { bulkPDFUpload } from '../../utils/bbps/uploadBulkPdf';
import { ddmmyy, formatDate, yyyymmdd } from '../../utils/dateFormat';
import { extractJSZip } from '../../utils/bbps/zipExtract';
import { isEmpty, amountFormat, BILLER_CATEGORY, convertToTitleCase } from '../../utils';

//** hook */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import useAlertDialog from '../../hook/useAlertDialog';
import { useLoader } from '../../Provider/LoaderContext';
import CustomModal from '../../components/CustomModal';
import { excelTemplateName } from '../../utils/excelDownloadManagement/excelName';

const BillsFetched = () => {

    const { isLoading, showLoader, hideLoader } = useLoader();
    const { orgId, userId, orgName, isAdmin, role } = useSelector(state => state.user);
    const { orgField, payTypeList } = useSelector((state) => state.extra);
    const billTypeList = [
        {
            title: "Normal Bill",
            value: "0"
        },
        {
            title: "Extra Amount Bill",
            value: "1"
        },
        {
            title: "Advance Amount Bill",
            value: "2"
        },
    ]
    const alertDialog = useAlertDialog()
    const dispatch = useDispatch();

    const initialBody = {
        "userId": userId,
        "orgId": orgId,
        "consumerNumber": "",
        "billerId": "",
        "billDateFrom": "",
        "billDateTo": "",
        "billDueDateFrom": "",
        "billDueDateTo": "",
        "verifyDateFrom": "",
        "verifyDateTo": "",
        "fetchDateFrom": "",
        "fetchDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0,
        "billStatus": "1",
        "stateName": "",
        "discountDateFrom": "",
        "discountDateTo": "",
        "payType": "ALL",
        "billType": "0",

    }

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

    const [fetchBill, setFetchBill] = React.useState([]);
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [stateList, setStateList] = React.useState([]);
    const [dataLength, setDataLength] = React.useState(0);
    const [filterBody, setFilterBody] = React.useState(initialBody);
    const [selectedXLSXFile, setSelectedXLSXFile] = React.useState("");
    const [selectedZipFile, setSelectedZipFile] = React.useState(null);
    const [selectedFetchBill, setSelectedFetchBill] = React.useState([]);
    const [billerName, setBillerName] = React.useState('');
    const [excelFetchBill, setExcelFetchBill] = React.useState([]);
    const [clearFlag, setClearFlag] = React.useState(false);
    const [isModalFailed, setIsModalFailed] = React.useState(false);
    const [responseData, setResponseData] = React.useState([]);
    const [resSuccessData, setSuccessData] = React.useState([]);
    const [billPage, setBillPage] = React.useState(0);
    const [billRowsPerPage, setBillRowsPerPage] = React.useState(4);
    const isSelected = (name) => selectedFetchBill.indexOf(name) !== -1;

    const handleChangeBillPage = (event, newPage) => setBillPage(newPage);

    const handleChangeBillRowsPerPage = (event) => {
        setBillRowsPerPage(+event.target.value);
        setBillPage(0);
    };

    const closeModal = () => {
        clearState()
        setIsModalFailed(false)
        setResponseData([])
    };

    const openAlertHandle = (type, message) => dispatch(openAlertSnack({ type: type, message: message }));
    const goToPage = (path) => Router.push(pathNameBaseOnStage(path));
    const handleChangePage = async (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = (event) => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e?.target?.name]: e?.target?.value });
    const onChangeSelectPayTypeHandle = async (e) => setFilterBody({ ...filterBody, "payType": e.target.value });
    const onChangeSelectBillTypeHandle = async (e) => setFilterBody({ ...filterBody, "billType": e.target.value });
    const onChangeSelectHandle = async (e) => {
        setFilterBody({ ...filterBody, "billStatus": e.target.value })
        setSelectedFetchBill([])
    };

    const handleClick = (event, name) => {
        const selectedIndex = selectedFetchBill.indexOf(name);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedFetchBill, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedFetchBill.slice(1));
        } else if (selectedIndex === selectedFetchBill.length - 1) {
            newSelected = newSelected.concat(selectedFetchBill.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedFetchBill.slice(0, selectedIndex),
                selectedFetchBill.slice(selectedIndex + 1),
            );
        }

        setSelectedFetchBill(newSelected);

    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            setSelectedFetchBill(fetchBill);
            return;
        }
        setSelectedFetchBill([]);
    };

    const handleChangeBillerName = (event) => {
        setBillerName(event.target.value);
        let billerNameCode = event.target.value.split('/');
        setFilterBody({ ...filterBody, ["billerId"]: billerNameCode[0] });

    };

    const handleChangeStateName = async (event) => {
        setBillerName('');
        setFilterBody({ ...filterBody, [event.target.name]: event.target.value === "ALL" ? "" : event.target.value, "billerId": "" });
        setStateName(event.target.value);
        billerNameRequest(BILLER_CATEGORY, event.target.value).then((data) => {
            if (data) {
                setBillerNameListData(data);
            }
        });
    };


    //** onChange */
    const onXLSXFileChange = e => {
        showLoader()
        e.preventDefault();
        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet)
                if (json.length > 0) {
                    console.log('json', json)
                    setExcelFetchBill(json);
                }
            };
            if (reader && e.target.files[0])
                reader?.readAsArrayBuffer(e.target.files[0]);
        }
        setSelectedXLSXFile(e.target.files[0])
        hideLoader();
    };

    const onZipFileChange = event => {
        event.preventDefault()
        setSelectedZipFile(event.target.files[0])
    };

    //** get data */
    const getBillerStatesList = async () => {
        await billerNameStates().then((resp) => {
            if (resp?.length > 0) {
                setStateList([{ stateName: "All" }, ...resp])
            } else {
                setStateList([])
            }
        }).catch((error) => {
            console.log("🚀 ~ file: billStatus.js:120 ~ await billerNameStates ~ error:", error)
            setStateList([])
        });
    };

    const getBillFetch = async () => {
        showLoader()
        await billFetchListFilter(filterBody).then((resp) => {
            if (resp?.data) {
                setFetchBill(resp?.data)
                setDataLength(resp?.Counts)
            } else {
                setDataLength(0)
                setFetchBill([])
            }
        }).catch(error => {
            console.log("🚀 ~ file: billsFetched.js:181 ~ await billFetchListFilter ~ error:", error)
        }).finally(() => {
            hideLoader()
        });
    };

    const getBillerName = async () => {
        await billerNameRequest(BILLER_CATEGORY).then((resp) => {
            if (resp?.length > 0) {
                setBillerNameListData(resp);
            } else {
                setBillerNameListData([]);
            }
        }).catch((error) => {
            console.log("🚀 ~ file: billStatus.js:156 ~ await billerNameRequest ~ error:", error);
            setBillerNameListData([]);
        });

    };


    //** download file */
    const downloadExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
                "id": id,
                "name": excelName.BILL_FETCH,
                "data": filterBody,
                "orgId": orgId,
                "userId": userId
            }
            await downloadExcelFromAPI(body);
            openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")
        } catch (error) {
            console.log("🚀 ~ file: billsFetched.js:170 ~ downloadExcel ~ error:", error)
        }
    };

    const downloadFailedBillExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(responseData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BILL_FETCH_FAILED);
        XLSX.writeFile(workbook, `${excelTemplateName(excelName.BILL_FETCH_FAILED)}`);
    };
    const downloadSuccessBillExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(resSuccessData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BILL_FETCH_SUCCESS);
        XLSX.writeFile(workbook, `${excelTemplateName(excelName.BILL_FETCH_SUCCESS)}`);
    };


    //** verify and revert */
    // const submitBillToVerifyAndRevert = async (type) => {
    //     showLoader()
    //     try {
    //         const data = type == "excel" ? excelFetchBill : selectedFetchBill
    //         const withVerificationBill = []
    //         const withoutVerificationBill = []
    //         const payType = type == "excel" ? "PayType" : "payType"

    //         data.map((bill) => {
    //             if (bill[payType].toUpperCase() == "POSTPAID") {
    //                 withVerificationBill.push(bill)
    //             }
    //             if (bill[payType].toUpperCase() != "POSTPAID" || bill["CID"].toUpperCase().includes("SPD")) {
    //                 withoutVerificationBill.push(bill)
    //             }
    //         })

    //         if (Array.isArray(withoutVerificationBill) && withoutVerificationBill.length > 0) {
    //             verifyBillFetchAPI(withoutVerificationBill)
    //         }

    //         if (filterBody.billStatus == 1) {
    //             // if (Array.isArray(withVerificationBill) && withVerificationBill.length === 0) {
    //             //     hideLoader()
    //             //     return
    //             // }
    //             // const body = { "type": "VALIDATE_BILL_FETCH", "data": withVerificationBill, dataType: type ? type : "" }
    //             // const resp = await validationBillFetch(body);
    //             if (resp.statusCode == 200) {
    //                 const { isError, validData } = resp.body
    //                 if (isError) {
    //                     setBillPage(0)
    //                     setResponseData(validData)
    //                     setIsModalFailed(true)
    //                 } else {
    //                     verifyBillFetchAPI(withVerificationBill)
    //                 }
    //             }
    //         } else {
    //             verifyBillFetchAPI(data)
    //         }


    //     } catch (error) {
    //         console.log('error.stack', error.stack)
    //         openAlertHandle("error", "Error Verified  " + JSON.stringify(error.stack || error))
    //     }
    //     hideLoader()
    // };

    const verifyBillFetchAPI = async (type) => {
        showLoader()
        const data = type == "excel" ? excelFetchBill : selectedFetchBill
        if (Array.isArray(data) && data.length === 0) {
            hideLoader()
            return
        }
        try {
            const body = { "type": "VERIFY_BILL_FETCH", data: data.map((e) => e.ID), billStatus: 1 }
            const resp = await verifyBillFetch(body)
            if (resp.statusCode == 200) {
                openAlertHandle("success", resp?.body)
            } else {
                openAlertHandle("error", "Error Verified  " + JSON.stringify(resp?.body))
            }
        } catch (error) {
            console.log('error.stack', error.stack)
            openAlertHandle("error", "Error Verified  " + JSON.stringify(error.stack || error))
        } finally {
            hideLoader()
            clearState()
        }
    };


    const deleteFetchBills = async () => {
        showLoader()
        let body = {
            type: "DELETE_FETCH_BILL",
            data: selectedFetchBill,
            orgId: orgId
        };
        await updateBillFetch(body).then((resp) => {
            if (resp?.statusCode === 200) {
                openAlertHandle("success", resp?.body);
                setSelectedFetchBill([])
            }
        }).catch((error) => {
            console.log("🚀 ~ file: billsFetched.js:360 ~ await updateBillFetch ~ error:", error);
        }).finally(() => {
            clearState()
            hideLoader()
        })
    };

    const extractZip = async () => {
        showLoader()
        try {
            const resp = await extractJSZip(selectedZipFile);
            const data = await getOrgList();
            let lookupFields = new Map();
            for (let i = 0; i < data.length; i++) {
                lookupFields.set(data[i].alias, data[i].orgId);
            }
            await bulkPDFUpload(resp, lookupFields);
            openAlertHandle("success", "Upload PDF Successful");
        } catch (error) {
            console.log("🚀 ~ file: billsFetched.js:336 ~ extractZip ~ error:", error)
        } finally {
            getBillFetch();
            hideLoader();
            setSelectedZipFile(null);
        }

    };

    const handleUpload = async () => {
        showLoader()
        if (excelFetchBill) {
            try {
                const body = {
                    "data": excelFetchBill
                }
                const resp = await uploadBillFetch(body);
                if (resp?.statusCode === 200) {
                    setSuccessData(resp?.updatedData)
                    openAlertHandle("success", resp.body)
                    setIsModalFailed(true)
                } else if (resp?.statusCode === 400) {
                    const inValidBill = Array.isArray((resp?.inValidData)) && resp?.inValidData.length > 0;
                    const validBill = Array.isArray((resp?.validData)) && resp?.validData.length > 0;
                    if (validBill) {
                        const res = await uploadBillFetch({
                            "data": resp?.validData
                        });

                        if (res?.statusCode === 200) {
                            setSuccessData(res?.updatedData)
                            openAlertHandle("success", res.body)
                        }
                    }
                    if (inValidBill) {
                        setBillPage(0);
                        setResponseData(resp?.inValidData);
                        setIsModalFailed(true)
                    }
                } else {
                    openAlertHandle("error", JSON.stringify(resp.body))

                }
            } catch (error) {
                console.error(error);
                openAlertHandle("error", JSON.stringify(error.stack || error))
            } finally {
                setSelectedXLSXFile(null)
                hideLoader()
            }
        } else {
            openAlertHandle("error", "please send file")
        }
        clearState()
        hideLoader()
    };

    //** alert */
    const billFetchUpdateAlert = () => {
        alertDialog({
            desc: `Are you sure you want to update the ${excelFetchBill.length} bills?`,
            rightButtonFunction: handleUpload,
        })
    }
    const extractZipAlert = () => {
        alertDialog({
            desc: "Are you sure you want to upload a PDF zip file?",
            rightButtonFunction: () => { extractZip() },
        })
    }

    const deleteFetchBillAlert = () => {
        if (isAdmin) {
            alertDialog({
                desc: "Are you sure you want to delete the bills in " + orgName + "?",
                rightButtonFunction: () => { deleteFetchBills() },
                rightButtonText: 'Submit'
            })
        } else {
            openAlertHandle('error', "Only users with Admin access can delete the bill.")
        }
    }
    const verifyBillAlert = () => {
        alertDialog({
            title: "Are you sure you want to verify the bills in " + orgName + "?",
            desc: "Before verification, the bill PDF data should remain uploaded.",
            rightButtonFunction: () => { verifyBillFetchAPI() },
            rightButtonText: 'Submit'
        })
    }
    const verifyExcelDataBillAlert = () => {
        alertDialog({
            desc: `Are you sure you want to verify the ${excelFetchBill.length} bills in ${orgName}?`,
            rightButtonFunction: () => { verifyBillFetchAPI("excel") },
            rightButtonText: 'Submit'
        })
    }

    const clearState = () => {
        setSelectedXLSXFile("")
        setSelectedZipFile("")
        setExcelFetchBill([])
        setSelectedFetchBill([])
        setBillerName("")
        setStateName("")
        setClearFlag(!clearFlag)
    };

    React.useEffect(() => {
        getBillerName()
        getBillerStatesList()
    }, []);
    React.useEffect(() => {
        getBillFetch()
    }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo, filterBody.billStatus]);


    //** component */

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
                    <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div"  >
                        No Of Bill : {numSelected}
                    </Typography>
                ) : (
                    <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div" >
                        List
                    </Typography>
                )}

                {numSelected > 0 ? (
                    <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }} >
                        {
                            filterBody.billStatus == 2 ? <Tooltip title={"Revert Fetch Bill"}>
                                <LoadingButton loading={isLoading} onClick={verifyBillAlert} variant="contained"> {"Revert"}</LoadingButton>
                            </Tooltip> : null
                        }
                        {/* <Tooltip title={"Delete Fetch Bill"}>
                            <LoadingButton loading={isLoading} color="error" onClick={deleteFetchBillAlert} variant="contained"> {"Delete"}</LoadingButton>
                        </Tooltip> */}
                    </Stack>
                ) : null}
            </Toolbar>
        );
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

    const BillFetchRow = ({ row }) => {

        const labelId = `enhanced-table-checkbox-${row.ID}`;
        const isItemSelected = isSelected(row);
        const [isAmountUpdate, setIsAmountUpdate] = React.useState(false);
        const [amount, setAmount] = React.useState(row.amount / 100);
        const isAmountUpdateOpen = () => isAdmin ? setIsAmountUpdate(true) : openAlertHandle('error', "Only users with Admin access can modify the amount.")
        const isAmountUpdateClose = () => setIsAmountUpdate(false);
        const onAmountChange = event => setAmount(event.target.value);
        const [isConsumptionUpdate, setIsConsumptionUpdate] = React.useState(false);
        const [consumption, setConsumption] = React.useState(row?.Consumption);
        const onConsumptionChange = event => setConsumption(event.target.value);
        const isConsumptionUpdateOpen = () => isAdmin ? setIsConsumptionUpdate(true) : openAlertHandle('error', "Only users with Admin access can modify the Consumption.")
        const isConsumptionUpdateClose = () => setIsConsumptionUpdate(false);

        const toggleUpdateModalOpen = (fileData, fileName) => {
            alertDialog({
                rightButtonFunction: () => uploadPDFBillFetch(fileData),
                rightButtonText: 'Submit',
                title: 'Do you upload PDFs?',
                desc: fileName
            })
        };

        const onFileChange = (event) => {
            event.preventDefault()
            let selectedFile = event.target.files;
            let file = null;
            let fileName = "";
            if (selectedFile.length > 0) {
                let fileToLoad = selectedFile[0];
                fileName = fileToLoad.name;
                let fileReader = new FileReader();
                fileReader.onload = function (fileLoadedEvent) {
                    file = fileLoadedEvent.target.result;
                    toggleUpdateModalOpen(file, fileName)
                };
                fileReader.readAsDataURL(fileToLoad);
            }
        };

        const uploadPDFBillFetch = async (pdfFileData) => {
            showLoader()
            const body = { orgId: orgId, userId: userId, ID: row.ID, data: pdfFileData }
            await pdfBillFetchUpload(body).then((resp) => {
                if (resp?.statusCode === 200) {
                    openAlertHandle("success", "Upload PDF Successful")
                }
            }).catch((error) => {
                console.log("🚀 ~ file: billsFetched.js:420 ~ await pdfBillFetchUpload ~ error:", error)
            }).finally(() => {
                hideLoader()
                getBillFetch()
            })
        };

        const pdfDownload = async () => {
            const body = { key: row.pdfLink }
            await pdfBillDownload(body).then((data) => {
                window.open(data)
            }).catch((error) => {
                console.log(error);
            })
        };

        const billAmountSubmit = async () => {
            isAmountUpdateClose();
            showLoader()
            const body = {
                type: "SINGLE_BILL_UPDATE",
                fieldName: "BILL_AMOUNT",
                data: { orgId: orgId, ID: row?.ID, amount: amount }
            };
            await updateBillFetch(body).then((resp) => {
                if (resp?.statusCode === 200) {
                    openAlertHandle("success", resp?.body)
                }
            }).catch((error) => {
                console.log("🚀 ~ file: billsFetched.js:459 ~ await updateBillFetch ~ error:", error)
            }).finally(() => {
                clearState()
                hideLoader()
            })
        };

        const billConsumptionSubmit = async () => {
            isAmountUpdateClose();
            showLoader()
            const body = {
                type: "SINGLE_BILL_UPDATE",
                fieldName: "CONSUMPTION",
                data: { orgId: orgId, ID: row?.ID, Consumption: consumption }
            };
            await updateBillFetch(body).then((resp) => {
                if (resp?.statusCode === 200) {
                    openAlertHandle("success", resp?.body)
                }
            }).catch((error) => {
                console.log("🚀 ~ file: billsFetched.js:459 ~ await updateBillFetch ~ error:", error)
            }).finally(() => {
                clearState()
                hideLoader()
            })
        };

        return <StyledTableRow>
            {filterBody.billStatus == "ALL" ? null :
                <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={isItemSelected} onClick={(event) => handleClick(event, row)} inputProps={{ 'aria-labelledby': labelId }} />
                </TableCell>}
            <TableCell align="center">{isEmpty(row?.orgAlias)}</TableCell>
            <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
            {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                if (field?.filterFlag === 1) {
                    if (field?.fieldType === "char") {
                        return <TableCell key={index} align="center">{isEmpty(row[field?.fieldName])}</TableCell>
                    }
                }
            }) : null}
            <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
            <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
            <TableCell align="center">{ddmmyy(row.ts)}</TableCell>
            <TableCell align="center" ><Button onClick={isAmountUpdateOpen}>{amountFormat(row.amount)}</Button></TableCell>
            <TableCell align="center">{ddmmyy(row.billDate)}</TableCell>
            <TableCell align="center">{ddmmyy(row.dueDate)}</TableCell>
            <TableCell align="center">{ddmmyy(row?.DiscountDate)}</TableCell>
            <TableCell align="center">{isEmpty(amountFormat(row?.DiscountAmount))}</TableCell>
            <TableCell align="center" ><Button onClick={isConsumptionUpdateOpen}>{isEmpty(row?.Consumption)}</Button></TableCell>
            <TableCell align="center">{isEmpty(row?.payType)}</TableCell>
            <TableCell align="center">
                {row.pdfLink !== null && row.pdfLink !== "" ? <IconButton color='info' onClick={pdfDownload}><PictureAsPdfRounded /> </IconButton> : null}
                <IconButton component="label">
                    <input accept=".pdf" onChange={onFileChange} type="file" hidden />
                    <UploadFileRounded />
                </IconButton>
            </TableCell>
            {filterBody?.billStatus == 2 ? <TableCell align="center">{ddmmyy(row.verifyDate)}</TableCell> : null}
            {filterBody?.billStatus == 2 ? <TableCell align="center">{amountFormat(row.verifyAmount)}</TableCell> : null}
            <TableCell align="center" sx={{ color: "neutral.100", backgroundColor: row?.billStatus == 2 ? 'success.light' : 'error.light' }} >{row?.billStatus == 2 ? "Verified" : "Not Verified"}</TableCell>
            <TableCell align="center" sx={{ color: "neutral.100", backgroundColor: extraBillAmountStatusTitle[row?.extraBillAmountStatus].color }} >{extraBillAmountStatusTitle[row?.extraBillAmountStatus].title}</TableCell>
            <DynamicFieldDialog inputType={'number'} open={isAmountUpdate} handleClose={isAmountUpdateClose} value={amount} label={"Your bill amount"} onChange={onAmountChange} onSubmit={billAmountSubmit} />
            <DynamicFieldDialog inputType={'number'} open={isConsumptionUpdate} handleClose={isConsumptionUpdateClose} value={consumption} label={"Your bill consumption"} onChange={onConsumptionChange} onSubmit={billConsumptionSubmit} />
        </StyledTableRow>
    };


    return (
        <>
            <Head>
                <title>
                    Bills Fetched
                </title>
            </Head>
            <Stack spacing={3} p={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }} >
                    <Box>
                        <Typography variant="h5"
                            component="div">
                            Fetch Bills
                        </Typography>
                        <CButton onClick={() => goToPage('/admin/billUpload')} title="Bill Upload" />
                    </Box>
                    <BBPSLogo />
                </Box>
                <Card>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }}>
                        <Typography variant="h6"
                            component="div">
                            Choose Filters
                        </Typography>
                    </Box>
                    <Divider />
                    <Stack component="form" >
                        <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <FormControl fullWidth size="small" >
                                    <InputLabel id="demo-simple-select-label">Choose Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={filterBody.billStatus}
                                        label="Choose Type"
                                        onChange={onChangeSelectHandle}
                                    >
                                        <MenuItem value={"ALL"}>All</MenuItem>
                                        <MenuItem value={"1"}>Not Verified Bill </MenuItem>
                                        <MenuItem value={"2"}>Verified Bill</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <FormControl fullWidth size="small" >
                                    <InputLabel id="demo-simple-select-pay-status">Choose PayType</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-pay-status"
                                        id="demo-simple-pay-status"
                                        value={filterBody.payType}
                                        label="Choose PayType"
                                        onChange={onChangeSelectPayTypeHandle}
                                    >
                                        {payTypeList && payTypeList.length > 0 ? payTypeList.map((e, i) => {
                                            return < MenuItem key={i + e?.payType} value={e?.payType}>{e?.payType}</MenuItem>
                                        }) : null}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <FormControl fullWidth size="small" >
                                    <InputLabel id="demo-simple-select-pay-status">Choose BillType</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-bill-status"
                                        id="demo-simple-bill-status"
                                        value={filterBody.billType}
                                        label="Choose BillType"
                                        onChange={onChangeSelectBillTypeHandle}
                                    >
                                        {billTypeList && billTypeList.length > 0 ? billTypeList.map((e, i) => {
                                            return < MenuItem key={i + e?.value} value={e?.value}>{e?.title}</MenuItem>
                                        }) : null}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <TextField fullWidth size="small" value={filterBody.consumerNumber} onChange={onChangeHandle} name='consumerNumber' id="outlined-basic" label="Consumer Number" variant="outlined" />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <FormControl size="small" fullWidth>
                                    <InputLabel id="singleBillerNameLabel">Select State</InputLabel>
                                    <Select
                                        required
                                        labelId="singleBillerNameLabel"
                                        id="singleBillerName"
                                        value={stateName}
                                        name="stateName"
                                        label="Select State"
                                        onChange={handleChangeStateName}
                                    >
                                        {stateList.length > 0 ? stateList.sort((a, b) => a.stateName > b.stateName ? 1 : -1).map((val, index) => {
                                            return (<MenuItem key={`${index + 15}`} value={val.stateName}>{val.stateName}</MenuItem>)
                                        }) : null
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <FormControl fullWidth size='small'>
                                    <InputLabel id="bulkBillerNameLabel">Select Biller Name</InputLabel>
                                    <Select
                                        label="Select Biller Name"
                                        id="bulkBillerName"
                                        name='billerName'
                                        value={billerName}
                                        onChange={handleChangeBillerName}
                                    >
                                        {billerNameListData.length > 0 ? billerNameListData.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                                            return (<MenuItem key={`${index + 15}`} value={val.billerId + '/' + val.billerName}>{val.billerName}</MenuItem>)
                                        }) : null}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Fetch Date From"
                                    value={filterBody.fetchDateFrom || null}
                                    onChange={(e) => onChangeDate("fetchDateFrom", e)}
                                    renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Fetch Date To"
                                    value={filterBody.fetchDateTo || null}
                                    onChange={(e) => onChangeDate("fetchDateTo", e)}
                                    renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Bill Creation Date From"
                                    value={filterBody.billDateFrom || null}
                                    onChange={(e) => onChangeDate("billDateFrom", e)}
                                    renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Bill Creation Date To"
                                    value={filterBody.billDateTo || null}
                                    onChange={(e) => onChangeDate("billDateTo", e)}
                                    renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Due Date From"
                                    value={filterBody.billDueDateFrom || null}
                                    onChange={(e) => onChangeDate("billDueDateFrom", e)}
                                    renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Due Date To"
                                    value={filterBody.billDueDateTo || null}
                                    onChange={(e) => onChangeDate("billDueDateTo", e)}
                                    renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Discount Date From"
                                    value={filterBody.discountDateFrom || null}
                                    onChange={(e) => onChangeDate("discountDateFrom", e)}
                                    renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    label="Discount Date To"
                                    value={filterBody.discountDateTo || null}
                                    onChange={(e) => onChangeDate("discountDateTo", e)}
                                    renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                                />
                            </Grid>
                            {filterBody.billStatus == 2 ?
                                <>
                                    <Grid item xs={2} sm={4} md={4} p={1} >
                                        <DatePicker
                                            inputFormat="dd/MM/yyyy"
                                            label="Verify Date From"
                                            value={filterBody.verifyDateFrom || null}
                                            onChange={(e) => onChangeDate("verifyDateFrom", e)}
                                            renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                        />
                                    </Grid>
                                    <Grid item xs={2} sm={4} md={4} p={1} >
                                        <DatePicker
                                            inputFormat="dd/MM/yyyy"
                                            label="Verify Date To"
                                            value={filterBody.verifyDateTo || null}
                                            onChange={(e) => onChangeDate("verifyDateTo", e)}
                                            renderInput={(params) => <TextField fullWidth disabled size="small" {...params} helperText={null} />}
                                        />
                                    </Grid>
                                </> : null}
                            {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                                if (field?.filterFlag === 1) {
                                    if (field.fieldType === "char") {
                                        return <Grid key={index} item xs={2} sm={4} md={4} p={1} >
                                            <TextField
                                                key={field?.fieldId}
                                                fullWidth
                                                size="small"
                                                id="outlined-basic"
                                                label={convertToTitleCase(field?.fieldName)}
                                                name={field.fieldName}
                                                value={filterBody[field?.fieldName]}
                                                onChange={onChangeHandle}
                                                variant="outlined"
                                            />
                                        </Grid>
                                    }
                                }

                            }) : null}
                        </Grid>
                        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent={"space-between"} p={1}>
                            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} >
                                <Button onClick={() => {
                                    getBillFetch();
                                }} variant="contained">Search Bill</Button>
                                <Button type='reset' onClick={() => {
                                    setFilterBody(initialBody)
                                    clearState()
                                }
                                } color='inherit' variant="contained">Clear</Button>
                            </Stack>
                            <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
                        </Stack>
                        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} p={1} >
                            <Button startIcon={<Upload />} variant="outlined" component="label">
                                {selectedXLSXFile ? selectedXLSXFile?.name : "Upload Bills File"}
                                <input accept=".xls,.xlsx,.csv" onChange={onXLSXFileChange} type="file" hidden />
                            </Button>
                            {selectedXLSXFile ? <Button variant="contained" component="label" onClick={billFetchUpdateAlert} >Upload</Button> : null}
                            {selectedXLSXFile && filterBody.billStatus == 2 ? <Button onClick={verifyExcelDataBillAlert} variant="contained">{"Excel Bill Revert"}</Button> : null}
                            <Button startIcon={<Upload />} variant="outlined" component="label">
                                {selectedZipFile ? selectedZipFile?.name : "Upload PDF Zip File"}
                                <input accept=".zip" onChange={onZipFileChange} type="file" hidden />
                            </Button>
                            {selectedZipFile ? <Button variant="contained" component="label" onClick={extractZipAlert} >Upload PDF Zip</Button> : null}
                        </Stack>
                    </Stack>
                </Card>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <EnhancedTableToolbar numSelected={selectedFetchBill.length} />
                    <Divider />
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    {filterBody.billStatus == "ALL" ? null : <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={selectedFetchBill?.length > 0 && selectedFetchBill?.length < fetchBill?.length}
                                            checked={fetchBill?.length > 0 && selectedFetchBill?.length === fetchBill?.length}
                                            onChange={handleSelectAllClick}
                                        />
                                    </TableCell>}
                                    <TableCell align="center">Customer ID</TableCell>
                                    <TableCell align="center">Consumer No.</TableCell>
                                    {orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                                        if (field?.filterFlag === 1) {
                                            if (field?.fieldType === "char") {
                                                return <TableCell key={index} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                                            }
                                        }
                                    }) : null}
                                    <TableCell align="center">Consumer Name</TableCell>
                                    <TableCell align="center">Biller Name</TableCell>
                                    <TableCell align="center">Fetch Date</TableCell>
                                    <TableCell align="center">Amount</TableCell>
                                    <TableCell align="center">Bill Creation Date</TableCell>
                                    <TableCell align="center">Bill Due Date</TableCell>
                                    <TableCell align="center">Discount Date</TableCell>
                                    <TableCell align="center">Discount Amount</TableCell>
                                    <TableCell align="center">Consumption</TableCell>
                                    <TableCell align="center">Pay Type</TableCell>
                                    <TableCell align="center">PDF Upload </TableCell>
                                    {filterBody.billStatus == 2 ? <TableCell align="center">Verify Date</TableCell> : null}
                                    {filterBody.billStatus == 2 ? <TableCell align="center">Verify Amount</TableCell> : null}
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Bill Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetchBill ? fetchBill.length > 0 && fetchBill.map((row, key) => <BillFetchRow key={String(key + row.ID)} row={row} />) : <Typography> No Data Available</Typography>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        component="div"
                        count={-1}
                        rowsPerPage={filterBody.rowPerPage}
                        page={filterBody.pageNo}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
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
                            {resSuccessData && resSuccessData.length > 0 ? <Button variant='outlined' onClick={downloadSuccessBillExcel}>Download Success Bills</Button> : null}
                            <Button variant='contained' color='inherit' onClick={closeModal} >Close</Button>
                        </CardActions>
                    </Paper>
                </CustomModal>
            </Stack>
        </>
    )
}
BillsFetched.getLayout = (page) => (
    <DashboardLayoutAdmin>
        {page}
    </DashboardLayoutAdmin>
);


export default BillsFetched;