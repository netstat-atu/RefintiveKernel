import * as React from 'react';

//** next */
import Head from 'next/head';
import Router from 'next/router';

//** mui */
import { Box, Typography, Button, Stack, Checkbox, Divider, Card, IconButton, TextField, InputLabel, MenuItem, FormControl, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Slider, Toolbar, CardHeader, CardActions, Chip, Grid, Tab } from '@mui/material';
import { Download, Edit, PictureAsPdfRounded, Upload } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';

//** service */
import { billVerificationAddComment, billerNameRequest, billerNameStates, billVerificationFilter, checkAndUploadBillForBatchCreation, createBatch, getBatchIdFromAPI, pdfBillDownload, thresholdRequest, downloadExcelFromAPI } from '../../utils/bbps/billerServices';
import { pathNameBaseOnStage } from '../../services/configHandle';

//** redux */
import { useDispatch, useSelector } from 'react-redux';
import { ddmmyy, formatDate, getMonthAndYear } from '../../utils/dateFormat';
import { excelTemplateName } from '../../utils/excelDownloadManagement/excelName';
import { excelName } from '../../utils/excelDownloadManagement';
import { isEmpty, amountFormat, BILLER_CATEGORY, ORG_ID_LIST, convertToTitleCase, truncateString } from '../../utils';

//** npm */
import * as XLSX from 'xlsx';
import { v4 as uuid } from 'uuid';

//** components */
import { DashboardLayoutUser } from '../../components/dashboard-layout-user';
import CButton from '../../components/CButton';
import DynamicFieldDialog from '../../components/DynamicFieldDialog';
import StyledTableRow from '../../components/StyledTableRow';
import PrepaidBalanceTab from '../../components/balanceStatementTab/PrepaidBalanceTab';
import BBPSLogo from '../../components/BBPSLogo';

//** utils */

//** hook */
import { useLoader } from '../../Provider/LoaderContext';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import CustomModal from '../../components/CustomModal';
import useAlertDialog from '../../hook/useAlertDialog';

const PaymentVerification = () => {
  const { orgId, userId, isAdmin, access } = useSelector(state => state.user);
  const { orgField } = useSelector((state) => state.extra);
  const { isLoading, showLoader, hideLoader } = useLoader();
  const alertDialog = useAlertDialog();

  const isBatchManager = access?.isBatchManager;
  const dispatch = useDispatch();
  const marks = [
    {
      value: 10,
      label: '10%',
    },
    {
      value: 50,
      label: '50%',
    },
    {
      value: 100,
      label: '100%',
    },
  ];

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

  const initialStateOfBody = {
    "userId": userId,
    "orgId": orgId,
    "consumerNumber": "",
    "consumerName": "",
    "billerName": "",
    "billerId": "",
    "billDateFrom": "",
    "billDateTo": "",
    "billDueDateFrom": "",
    "billDueDateTo": "",
    "rowPerPage": 10,
    "pageNo": 0,
    "verifyDateFrom": "",
    "verifyDateTo": "",
    "discountDateFrom": "",
    "discountDateTo": "",
    "billStatus": 2,
    "thresholdLimit": 10,
    "thresholdConsumptionLimit": 10,
    "stateName": "",
    "billMonth": getMonthAndYear()
  }


  const [clearFlag, setClearFlag] = React.useState(false);
  const [thresholdAmount, setThresholdAmount] = React.useState("0");
  const [consumptionUnit, setConsumptionUnit] = React.useState("0");
  const [dataLength, setDataLength] = React.useState(0);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [billerName, setBillerName] = React.useState('');
  const [stateName, setStateName] = React.useState('');
  const [billPage, setBillPage] = React.useState(0);
  const [billRowsPerPage, setBillRowsPerPage] = React.useState(4);
  const [selectedVerificationBill, setSelectedVerificationBill] = React.useState([]);
  const [fetchVerificationBill, setFetchVerificationBill] = React.useState([]);
  const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
  const [billerNameListData, setBillerNameListData] = React.useState([]);
  const [stateList, setStateList] = React.useState([]);
  const [excelVerificationBill, setExcelVerificationBill] = React.useState([]);
  const [failedExcelVerificationBill, setFailedExcelVerificationBill] = React.useState([]);
  const [verifyLoader, setVerifyLoader] = React.useState(false);
  const [isModal, setIsModal] = React.useState(false);
  const [value, setValue] = React.useState('0');
  const [thresholdAmountModal, setThresholdAmountModal] = React.useState(false);
  const [consumptionLimitModal, setConsumptionUnitModal] = React.useState(false);
  const [consumerTab, setConsumerTab] = React.useState("0");

  const handleSelectedBatchCreateOpen = () => {
    alertDialog({
      rightButtonText: 'Submit',
      rightButtonFunction: selectedBillBatchCreate,
      title: "Batch Creation",
      desc: "Are you sure you want to create a batch?"
    })
  }

  const handleThresholdOpen = () => setThresholdAmountModal(true);
  const handleThresholdClose = () => setThresholdAmountModal(false);

  const handleConsumptionLimitOpen = () => setConsumptionUnitModal(true);
  const handleConsumptionLimitClose = () => setConsumptionUnitModal(false);

  const openModal = () => setIsModal(true);

  const closeModal = () => {
    setIsModal(false)
    setSelectedFile(null)
  }

  const handleChangeBillPage = (event, newPage) => setBillPage(newPage);
  const handleChangePage = async (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
  const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
  const onChangeHandle = async (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });

  const onChangeThresholdHandle = async (e) => await updateThresholdRequest(thresholdAmount, e.target.value);
  const onChangeConsumptionHandle = async (e) => await updateConsumptionRequest(consumptionUnit, e.target.value);

  const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });

  const onChangeThresholdAmount = async (e) => {
    e.preventDefault()
    setThresholdAmount(e.target.value)
  };

  const onChangeConsumptionLimit = async (e) => {
    e.preventDefault()
    setConsumptionUnit(e.target.value)
  };

  const handleChangeConsumerTabs = (event, newValue) => {
    clearState()
    setConsumerTab(newValue)
  };

  const goToPage = (path) => Router.push(pathNameBaseOnStage(path));

  const isSelectedVerificationBill = (name) => selectedVerificationBill.indexOf(name) !== -1;
  const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))

  const handleChangeBillRowsPerPage = (event) => {
    setBillRowsPerPage(+event.target.value);
    setBillPage(0);
  };

  const handleChangeBillerName = (event) => {
    setBillerName(event.target.value);
    let billerNameCode = event.target.value.split('/');
    setFilterBody({ ...filterBody, ["billerName"]: billerNameCode[1], ["billerId"]: billerNameCode[0] });
  };

  const handleChangeStateName = async (event) => {
    showLoader();
    setBillerName('');
    setFilterBody({ ...filterBody, [event.target.name]: event.target.value === "ALL" ? "" : event.target.value, "billerId": "", "billerName": "" });
    setStateName(event.target.value);
    await billerNameRequest(BILLER_CATEGORY, event.target.value).then((resp) => {
      if (resp?.length > 0) {
        setBillerNameListData(resp);
      } else {
        setBillerNameListData([]);
      }
    }).catch((error) => {
      console.log("🚀 ~ file: billStatus.js:156 ~ await billerNameRequest ~ error:", error);
      setBillerNameListData([]);
    }).finally(() => {
      hideLoader();
    });
  };

  const getBillerStatesList = async () => {
    await billerNameStates().then((resp) => {
      if (resp?.length > 0) {
        setStateList([{ stateName: "ALL" }, ...resp])
      } else {
        setStateList([])
      }
    }).catch((error) => {
      console.log("🚀 ~ file: billStatus.js:120 ~ await billerNameStates ~ error:", error)
      setStateList([])
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

  const getBillFilter = async () => {
    showLoader();
    try {
      const body = {
        "type": "SELECT",
        "data": {
          "orgId": orgId
        }
      }
      const thresholdData = await thresholdRequest(body);
      if (thresholdData) {
        const { thresholdAmount, thresholdLimit, consumptionUnit, thresholdConsumptionLimit } = thresholdData;
        setThresholdAmount(thresholdAmount);
        setConsumptionUnit(consumptionUnit);
        setFilterBody({ ...filterBody, thresholdConsumptionLimit: thresholdConsumptionLimit ? thresholdConsumptionLimit : "", thresholdLimit: thresholdLimit ? thresholdLimit : "" });
      }
      const fetchBillData = await billVerificationFilter(filterBody);
      if (fetchBillData?.data?.length > 0) {
        setFetchVerificationBill(fetchBillData?.data);
        setDataLength(fetchBillData?.Counts);
      } else {
        setFetchVerificationBill([]);
        setDataLength(0);
      }
    } catch (error) {
      console.log("🚀 ~ file: paymentVerification.js:215 ~ getBillFilter ~ error:", error)
    } finally {
      hideLoader();
    }

  };

  const updateThresholdRequest = async (thresholdAmount, thresholdLimit, flag) => {

    setFilterBody({ ...filterBody, "thresholdLimit": thresholdLimit });
    const body = {
      "type": "UPDATE_AMOUNT_LIMIT",
      "data": {
        "orgId": orgId,
        "thresholdAmount": thresholdAmount,
        "thresholdLimit": thresholdLimit,

      }
    }
    await thresholdRequest(body).catch((error) => {
      console.log("🚀 ~ file: paymentVerification.js:247 ~ awaitThresholdRequest ~ error:", error)
    }).finally(() => {
      if (flag) {
        getBillFilter()
      }
    });
  };

  const updateConsumptionRequest = async (consumptionUnit, thresholdConsumptionLimit, flag) => {
    setFilterBody({ ...filterBody, "thresholdConsumptionLimit": thresholdConsumptionLimit });
    const body = {
      "type": "UPDATE_CONSUMPTION_LIMIT",
      "data": {
        "orgId": orgId,
        "consumptionUnit": consumptionUnit,
        "thresholdConsumptionLimit": thresholdConsumptionLimit,
      }
    }
    await thresholdRequest(body).catch((error) => {
      console.log("🚀 ~ file: paymentVerification.js:247 ~ awaitThresholdRequest ~ error:", error)
    }).finally(() => {
      if (flag) {
        getBillFilter()
      }
    });
  };

  //** excel utils */
  const downloadExcel = async () => {

    try {
      const id = uuid().toUpperCase();
      const body = {
        "type": "CREATE",
        "id": id,
        "name": excelName.BILL_VERIFICATION,
        "data": filterBody,
        "orgId": orgId,
        "userId": userId
      }
      await downloadExcelFromAPI(body);
      openAlertHandle("success", "Check the download status in the Download Manager for the task in progress.")
    } catch (error) {
      console.log("🚀 ~ file: billPayment.js:258 ~ downloadExcel ~ error:", error);
    }

  };

  const downloadFailedBillExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(failedExcelVerificationBill);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BILL_VERIFICATION_FAILED_LIST);
    XLSX.writeFile(workbook, `${excelTemplateName(excelName.BILL_VERIFICATION_FAILED_LIST)}`);
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


    if (excelVerificationBill.length == 0) {
      openAlertHandle("error", "No bill record was read from the Excel file. Please try again.");
      return
    }

    if (excelVerificationBill.length > 1000) {
      openAlertHandle("error", "The number of items in the Excel verification bill exceeds the allowed limit of 1000.");
      return
    }

    try {
      setBillRowsPerPage(4);
      setBillPage(0);
      showLoader();
      const reqBody = {
        "type": "VALIDATE_BILL_BATCH",
        "data": excelVerificationBill,
        "orgId": orgId,
        "checkType": ""
      }
      const resp = await checkAndUploadBillForBatchCreation(reqBody);
      if (resp.statusCode == 200) {
        const { isError, body } = resp?.body;
        if (isError) {
          setFailedExcelVerificationBill(body)
          openModal();
        } else {
          if (excelVerificationBill.length > 0) {
            const resp = await getBatchIdFromAPI(orgId);
            if (resp?.statusCode === 200) {
              const body = {
                "type": "CREATE_BILL_BATCH",
                "data": excelVerificationBill,
                "orgId": orgId,
                "batchId": resp?.body,
              };
              let response = await checkAndUploadBillForBatchCreation(body);
              response = JSON.parse(response)
              if (response.statusCode == 200) {
                openAlertHandle("success", `BatchId : ${response?.batchId} Successfully created`);
              } else {
                openAlertHandle("error", JSON.stringify(response));
              }
            } else {
              openAlertHandle("error", JSON.stringify(resp));
            }
          } else {
            openAlertHandle("error", "No bill available");
          }
        }
      }
    } catch (error) {
      console.log("🚀 ~ file: paymentVerification.js:319 ~ verifyExcelBillForBatch ~ error:", error);
    } finally {
      hideLoader()
      clearState();
    }
  };

  const selectedBillBatchCreate = async () => {
    if (selectedVerificationBill.length > 1000) {
      openAlertHandle("error", "The number of items in the Selected verification bill exceeds the allowed limit of 1000.");
      return
    }
    try {
      showLoader()
      setVerifyLoader(true);
      const response = await getBatchIdFromAPI(orgId);
      if (response?.statusCode === 200) {
        const body = {
          "type": "INSERT",
          "batchId": response?.body,
          "orgId": orgId,
          "data": selectedVerificationBill
        }
        const resp = await createBatch(body);
        if (resp?.statusCode === 200) {
          openAlertHandle("success", `BatchId : ${resp?.batchId} successfully created`)
        }
      } else {
        openAlertHandle("error", JSON.stringify(response))
      }

    } catch (error) {
      console.log("🚀 ~ file: paymentVerification.js:413 ~ selectedBillBatchCreate ~ error:", error);
      openAlertHandle("error", JSON.stringify(error))
    } finally {
      setSelectedVerificationBill([])
      setVerifyLoader(false)
      hideLoader()
      getBillFilter();
    }
  };

  const clearState = () => {
    setStateName('')
    setBillerName('')
    setFilterBody(initialStateOfBody)
    setSelectedFile(null);
    setFetchVerificationBill([]);
    setClearFlag(!clearFlag);
  };

  React.useEffect(() => {
    getBillerStatesList()
    getBillerName()
  }, []);

  React.useEffect(() => {
    getBillFilter()
  }, [clearFlag, filterBody?.rowPerPage, filterBody?.pageNo])

  const handleClickCheckBox = (name) => {
    const selectedIndex = selectedVerificationBill.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedVerificationBill, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedVerificationBill.slice(1));
    } else if (selectedIndex === selectedVerificationBill.length - 1) {
      newSelected = newSelected.concat(selectedVerificationBill.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedVerificationBill.slice(0, selectedIndex),
        selectedVerificationBill.slice(selectedIndex + 1),
      );
    }
    setSelectedVerificationBill(newSelected);
  };

  const isClientTrackIdPresentAndEmpty = (row) => {
    return orgField?.some((field) => {
      if (field.fieldName === "clientTrackId") {
        const clientTrackIdValue = row[field.fieldName];
        return clientTrackIdValue === null || clientTrackIdValue === "" || clientTrackIdValue === undefined;
      }
      return false;
    });
  };

  const handleSelectAllClickCheckBox = (event) => {
    if (event.target.checked) {
      let selectItems = []
      fetchVerificationBill.map((row) => {
        if (orgField && orgField.length > 0) {

          if (!isClientTrackIdPresentAndEmpty(row) || orgId == ORG_ID_LIST.HDFC) {
            selectItems.push(row.ID)
            if (event.target.checked) {
              setTotalAmount((prev) => prev + row?.amount)
            } else {
              setTotalAmount((prev) => prev - row?.amount)
            }
          }

        } else {
          selectItems.push(row.ID)
          if (event.target.checked) {
            setTotalAmount((prev) => prev + row?.amount)
          } else {
            setTotalAmount((prev) => prev - row?.amount)
          }
        }
      });
      setSelectedVerificationBill(selectItems);
      return;
    }
    setTotalAmount(0);
    setSelectedVerificationBill([]);
  };

  const EnhancedTableToolbar = (props) => {
    const { numSelected } = props;
    return (
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
        {numSelected > 0 ?
          <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div"  >
            No of Bill : {numSelected}{",  "}
            Total Amount : {amountFormat(totalAmount)}
          </Typography> : null}
        {numSelected > 0 ? <LoadingButton loading={verifyLoader} onClick={handleSelectedBatchCreateOpen} variant="contained">Create</LoadingButton> : null}
      </Toolbar>
    );
  };

  const handleChangeTabs = (event, newValue) => {
    setValue(newValue)
    setFilterBody({ ...filterBody, "pageNo": 0, "rowPerPage": 10 })
  };

  //** ROW
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

  const Tab1Row = ({ row, index }) => {

    const fieldBody = {
      ID: row.ID,
      orgId: orgId,
      fieldId: "",
      fieldName: "",
      fieldValue: ""
    }

    const isItemSelected = isSelectedVerificationBill(row?.ID);
    const [fieldFilterBody, setFieldFilterBody] = React.useState(fieldBody);
    const [fieldModalOpen, setFieldModalOpen] = React.useState(false);


    const handleFieldOpen = (fieldId, fieldName, fieldValue) => {
      setFieldFilterBody({
        ...fieldFilterBody,
        fieldId: fieldId, fieldName: fieldName, fieldValue: fieldValue
      })
      setFieldModalOpen(true)

    };
    const handleFieldClose = () => {
      setFieldFilterBody(fieldBody)
      setFieldModalOpen(false);
    }

    const onFieldChange = (event) => {
      setFieldFilterBody({ ...fieldFilterBody, "fieldValue": event.target.value })
    }

    const [comment, setComment] = React.useState(row?.comment);
    const [commentOpen, setCommentOpen] = React.useState(false);

    const handleCommentOpen = () => setCommentOpen(true);
    const handleCommentClose = () => {
      setComment(row?.comment)
      setCommentOpen(false);
    }
    const onCommentChange = event => setComment(event?.target?.value)

    const backColorOfRow = () => {
      if (value == "0") {
        if ((row?.amount / 100) > Number(thresholdAmount)) {
          return "#FFACAC";
        } else if (row.inthresholdlimit == 1) {
          return "#8EA7E9";
        } else {
          return null;
        }

      } else if (value == "1") {
        if (Number(row?.Consumption) > Number(consumptionUnit)) {
          return "#B799FF";
        }
        else if (row.inThresholdConsumptionLimit == 1) {
          return "#C4DFDF";
        }
        else {
          return null;
        }
      }

    }

    const pdfDownload = async () => {
      const body = {
        key: row?.pdfDownloadLink
      }
      await pdfBillDownload(body).then((resp) => {
        window.open(resp)
      }).catch((error) => {
        console.log("🚀 ~ file: paymentVerification.js:605 ~ await pdfBillDownload ~ error:", error)
      })

    };

    const billComment = async () => {
      const body = {
        "type": "comment",
        "data": {
          "valueComment": comment,
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
        handleCommentClose();
        getBillFilter();
      });
    };

    const submitFieldValue = async () => {

      showLoader()
      const body = {
        "type": "INSERT_FIELD_VALUE",
        "data": fieldFilterBody,
      }
      await createBatch(body).then((resp) => {
        if (resp?.statusCode === 200) {
          openAlertHandle("success", `Successful inserted`)
        } else {
          openAlertHandle("error", JSON.stringify(resp?.body))

        }
      }).catch((error) => {
        console.log("🚀 ~ file: paymentVerification.js:640 ~ await createBatch ~ error:", error);
        openAlertHandle("error", JSON.stringify(error))

      }).finally(() => {
        hideLoader()
        getBillFilter();
      })
    };

    const onClickCheckBox = () => {
      if (orgField && orgField.length > 0) {
        if (isClientTrackIdPresentAndEmpty(row) && orgId != ORG_ID_LIST.HDFC) {
          openAlertHandle("error", "Please Enter Client Track Id")
        } else {
          handleClickCheckBox(row?.ID)
        }
      } else {
        handleClickCheckBox(row?.ID)
      }

    };

    const onChangeCheckBox = (e) => {
      if (orgField && orgField.length > 0) {
        if (isClientTrackIdPresentAndEmpty(row) && orgId != ORG_ID_LIST.HDFC) {
          openAlertHandle("error", "Please Enter Client Track Id")
        } else {
          if (e.target.checked) {
            setTotalAmount((prev) => prev + row?.amount)
          } else {
            setTotalAmount((prev) => prev - row?.amount)
          }
        }
      } else {
        if (e.target.checked) {
          setTotalAmount((prev) => prev + row?.amount)
        } else {
          setTotalAmount((prev) => prev - row?.amount)
        }
      }
    };
    return (<>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0, }, backgroundColor: backColorOfRow() }}>
        {isBatchManager ? (<TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected} onClick={onClickCheckBox} onChange={onChangeCheckBox} /></TableCell>) : null}
        <TableCell align="center">{isEmpty(row?.ConsumerId)}</TableCell>
        <TableCell align="center">{isEmpty(row?.ConsumerName)}</TableCell>
        {orgField && orgField.length > 0 ? orgField.map((field, index) => {
          if (field?.typeTable === "Consumer") {
            if (field?.filterFlag === 1) {
              if (field?.fieldType === "char") {
                return <TableCell key={field?.fieldId} align="center">{isEmpty(row[field?.fieldName])}</TableCell>
              }
            }
          } else if (field?.fieldName == "clientTrackId") {
            return <TableCell key={index} align="center">
              <Button onClick={() => {
                handleFieldOpen(field.fieldId, field?.fieldName, row[field?.fieldName])
              }}>{isEmpty(row[field?.fieldName])}</Button>
            </TableCell>
          }
        }) : null}
        <TableCell align="center">{isEmpty(row?.BillerName)}</TableCell>
        <TableCell align="center">{amountFormat(row?.amount)}</TableCell>
        <TableCell align="center">{ddmmyy(row?.billDate)}</TableCell>
        <TableCell align="center">{ddmmyy(row?.dueDate)}</TableCell>
        <TableCell align="center">
          <Button onClick={handleCommentOpen}>
            {isEmpty(truncateString(comment))}
          </Button>
        </TableCell>
        <TableCell align="center">{row?.pdfDownloadLink ? <IconButton color='info' onClick={pdfDownload}>  <PictureAsPdfRounded /></IconButton> : "N/A"}</TableCell>
        <TableCell align="center">{ddmmyy(row?.DiscountDate)}</TableCell>
        <TableCell align="center">{isEmpty(amountFormat(row?.DiscountAmount))}</TableCell>
        <TableCell align="center">{isEmpty(row?.Consumption)}</TableCell>
        <TableCell align="center">{ddmmyy(row?.verifyDate)}</TableCell>
        <TableCell align="center" sx={{ color: "neutral.100", backgroundColor: extraBillAmountStatusTitle[row?.extraBillAmountStatus].color }} >{extraBillAmountStatusTitle[row?.extraBillAmountStatus].title}</TableCell>
      </TableRow>
      <DynamicFieldDialog loading={isLoading} open={fieldModalOpen} handleClose={handleFieldClose} handleOpen={handleFieldOpen} value={fieldFilterBody.fieldValue} label={convertToTitleCase(fieldFilterBody.fieldName)} onChange={onFieldChange} onSubmit={submitFieldValue} />
      <DynamicFieldDialog open={commentOpen} handleClose={handleCommentClose} handleOpen={handleCommentOpen} value={comment} label={"Your Comment"} onChange={onCommentChange} onSubmit={billComment} />
    </>)
  };

  return (
    <>
      <Head>
        <title>
          Bill Verification
        </title>
      </Head>
      <Stack component="main" spacing={3} p={3}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
            <Box>
              <Typography variant="h5"
                component="div">
                Bill Verification
              </Typography>
              <CButton onClick={() => goToPage('/user/paymentClearance')} title="Bill Clearance" />
            </Box>
            <BBPSLogo />
          </Box>
          <TabContext value={consumerTab}>
            <Card>
              <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeConsumerTabs} >
                <Tab label={`Postpaid Consumer`} value="0" />
                <Tab label={`Prepaid Consumer`} value="1" />
              </TabList>
            </Card>
            <TabPanel sx={{ p: 0 }} value="0" >
              <Stack spacing={3}>
                <Card>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
                    <Typography variant="h6"
                      component="div">
                      Choose Filters
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack component="form" >
                    <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <TextField fullWidth value={filterBody.consumerNumber} size="small" onChange={onChangeHandle} name='consumerNumber' id="outlined-basic" label="Consumer Number" variant="outlined" />
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <TextField fullWidth value={filterBody.consumerName} size="small" onChange={onChangeHandle} name='consumerName' id="outlined-basic" label="Consumer Name" variant="outlined" />
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <FormControl size="small" fullWidth>
                          <InputLabel id="singleBillerNameLabel">Select State</InputLabel>
                          <Select
                            required
                            labelId="singleBillerNameLabel"
                            id="singleBillerName"
                            value={stateName}
                            label="Select State"
                            name="stateName"
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
                            {billerNameListData?.length > 0 ? billerNameListData?.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                              return (<MenuItem key={`${index + 15}`} value={val.billerId + '/' + val.billerName}>{val.billerName}</MenuItem>)
                            }) : null
                            }
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                          inputFormat="dd/MM/yyyy"
                          label="Bill Creation Date From"
                          value={filterBody.billDateFrom || null}
                          onChange={(e) => onChangeDate("billDateFrom", e)}
                          renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                        />
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                          inputFormat="dd/MM/yyyy"
                          label="Bill Creation Date To"
                          value={filterBody.billDateTo || null}
                          onChange={(e) => onChangeDate("billDateTo", e)}
                          renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                        />
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                          inputFormat="dd/MM/yyyy"
                          label="Due Date From"
                          value={filterBody.billDueDateFrom || null}
                          onChange={(e) => onChangeDate("billDueDateFrom", e)}
                          renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                        />
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                          inputFormat="dd/MM/yyyy"
                          label="Due Date To"
                          value={filterBody.billDueDateTo || null}
                          onChange={(e) => onChangeDate("billDueDateTo", e)}
                          renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                        />
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                          inputFormat="dd/MM/yyyy"
                          label="Verify Date From"
                          value={filterBody.verifyDateFrom || null}
                          onChange={(e) => onChangeDate("verifyDateFrom", e)}
                          renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                        />
                      </Grid>
                      <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                          inputFormat="dd/MM/yyyy"
                          label="Verify Date To"
                          value={filterBody.verifyDateTo || null}
                          onChange={(e) => onChangeDate("verifyDateTo", e)}
                          renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
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
                      {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                        if (field?.filterFlag === 1) {
                          if (field?.fieldType === "char") {
                            return <Grid key={field?.fieldId} item xs={2} sm={4} md={4} p={1} >
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
                    <Stack justifyContent={'space-between'} p={1} spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} >
                        <Button onClick={getBillFilter} variant="contained">Search Bill</Button>
                        <Button type='reset' onClick={clearState} color='inherit' variant="contained" >Clear</Button>
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Bill</Button>
                        {isBatchManager ?
                          <Button startIcon={<Upload />} variant="outlined" component="label">
                            {selectedFile ? selectedFile?.name : "Upload Batch Creation File"}
                            <input accept=".xls,.xlsx,.csv" onChange={onFileChange} type="file" hidden />
                          </Button> : null}
                        {selectedFile ? <Button variant="contained" onClick={verifyExcelBillForBatch}>Verify & Create</Button> : null}
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
                <Card>
                  <TabContext value={value}>
                    <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeTabs} >
                      <Tab label={`Threshold Amount Limit`} value="0" />
                      <Tab label={`Threshold Consumption Limit`} value="1" />
                    </TabList>
                    <TabPanel value="0">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Box style={{ backgroundColor: "#FFACAC", height: 20, width: 20 }} />
                        <Typography id="non-linear-slider" gutterBottom>
                          Threshold Amount  : {"₹" + Number(thresholdAmount).toFixed(2)}
                        </Typography>
                        {isAdmin ?
                          <IconButton onClick={handleThresholdOpen}>
                            <Edit />
                          </IconButton>
                          : null
                        }
                        <Box style={{ backgroundColor: "#8EA7E9", height: 20, width: 20 }} />
                        <Typography id="non-linear-slider" gutterBottom>
                          Threshold Limit  : {filterBody.thresholdLimit} %
                        </Typography>
                        {
                          isAdmin ? <Slider value={filterBody.thresholdLimit} name="thresholdLimit" aria-label="Percentage" defaultValue={0} valueLabelDisplay="auto" onChange={onChangeThresholdHandle} step={10} marks={marks} min={0} max={100} />
                            : null
                        }
                      </Stack>
                    </TabPanel>
                    <TabPanel value="1">
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        <Box style={{ backgroundColor: "#B799FF", height: 20, width: 20 }} />
                        <Typography id="non-linear-slider" gutterBottom>
                          Consumption Unit  : {consumptionUnit}
                        </Typography>
                        {isAdmin ?
                          <IconButton onClick={handleConsumptionLimitOpen}>
                            <Edit />
                          </IconButton>
                          : null
                        }
                        <Box style={{ backgroundColor: "#C4DFDF", height: 20, width: 20 }} />
                        <Typography id="non-linear-slider" gutterBottom>
                          Threshold Consumption Limit : {filterBody.thresholdConsumptionLimit} %
                        </Typography>
                        {
                          isAdmin ? <Slider value={filterBody.thresholdConsumptionLimit} name="thresholdLimit" aria-label="Percentage" defaultValue={0} valueLabelDisplay="auto" onChange={onChangeConsumptionHandle} step={10} marks={marks} min={0} max={100} />
                            : null
                        }
                      </Stack>
                    </TabPanel>
                  </TabContext>
                </Card>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  {selectedVerificationBill.length > 0 && <EnhancedTableToolbar numSelected={selectedVerificationBill.length} />}
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                      <TableHead>
                        <TableRow>
                          {isBatchManager && <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              indeterminate={selectedVerificationBill?.length > 0 && selectedVerificationBill?.length < fetchVerificationBill?.length}
                              checked={selectedVerificationBill?.length > 0}
                              onChange={handleSelectAllClickCheckBox}
                            />
                          </TableCell>}
                          <TableCell align="center">Consumer No.</TableCell>
                          <TableCell align="center">Consumer Name</TableCell>
                          {orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                            if (field?.typeTable === "Consumer") {
                              if (field?.filterFlag === 1) {
                                if (field?.fieldType === "char") {
                                  return <TableCell key={field?.fieldId} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                                }

                              }
                            } else if (field?.fieldName === "clientTrackId") {
                              return <TableCell key={field?.fieldId} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                            }
                          }) : null}
                          <TableCell align="center">Biller Name</TableCell>
                          <TableCell align="center">Bill Amount</TableCell>
                          <TableCell align="center">Bill Creation Date</TableCell>
                          <TableCell align="center">Due Date</TableCell>
                          <TableCell align="center">Comments</TableCell>
                          <TableCell align="center">Bill PDF</TableCell>
                          <TableCell align="center">Discount Date</TableCell>
                          <TableCell align="center">Discount Amount</TableCell>
                          <TableCell align="center">Consumption</TableCell>
                          <TableCell align="center">Verify Date</TableCell>
                          <TableCell align="center">Bill Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fetchVerificationBill && fetchVerificationBill.length > 0 && fetchVerificationBill.map((row, index) => <Tab1Row row={row} index={index} key={String(row.ConsumerId) + String(index)} />)}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[10, 20, 30, 50, 100, 200, 250]}
                      component="div"
                      count={dataLength}
                      rowsPerPage={filterBody.rowPerPage}
                      page={filterBody.pageNo}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableContainer>
                  <DynamicFieldDialog
                    loading={verifyLoader}
                    open={thresholdAmountModal}
                    handleClose={handleThresholdClose}
                    handleOpen={handleThresholdOpen}
                    value={thresholdAmount}
                    label={"Threshold Amount"}
                    onChange={onChangeThresholdAmount}
                    onSubmit={() => {
                      updateThresholdRequest(thresholdAmount, filterBody.thresholdLimit, true)
                      handleThresholdClose()
                    }}
                  />
                  <DynamicFieldDialog
                    loading={verifyLoader}
                    open={consumptionLimitModal}
                    handleClose={handleConsumptionLimitClose}
                    handleOpen={handleConsumptionLimitOpen}
                    value={consumptionUnit}
                    label={"Consumption Unit"}
                    onChange={onChangeConsumptionLimit}
                    onSubmit={() => {
                      updateConsumptionRequest(consumptionUnit, filterBody.thresholdConsumptionLimit, true)
                      handleConsumptionLimitClose()
                    }}
                  />
                </Paper>
              </Stack>
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value="1">
              <PrepaidBalanceTab />
            </TabPanel>
          </TabContext>
          <CustomModal open={isModal} >
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <CardHeader title="Verify Bill For Batch Creation" />
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
                          failedExcelVerificationBill.slice(billPage * billRowsPerPage, billPage * billRowsPerPage + billRowsPerPage).map((row, index) => {
                            return <ModalRow key={String(row?.ConsumerId) + String(index)} row={row} index={index} />
                          })
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[4, 10, 20, 50]}
                    component="div"
                    count={failedExcelVerificationBill.length}
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
                <Button variant='contained' color='inherit' onClick={closeModal}>Close</Button>
              </CardActions>
            </Paper>
          </CustomModal>
        </Stack>
      </Stack>
    </>
  );
}

PaymentVerification.getLayout = (page) => (
  <DashboardLayoutUser>
    {page}
  </DashboardLayoutUser>
);

export default PaymentVerification;