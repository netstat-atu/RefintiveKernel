import React, { memo } from 'react';

//** mui */
import { FormControl, MenuItem, Select, InputLabel, Button, CardActions, CardHeader, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Checkbox, FormControlLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';

//** service */
import { billerCategoryRequest, billerDetailsRequest, billerNameRequest, billerNameStates, bulkConsumerSave } from '../../utils/bbps/billerServices';

//** npm */
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';

//** utils */
import { consumerValid } from '../../utils/bbps/consumerValid';
import { excelName } from '../../utils/excelDownloadManagement';
import { BILLER_CATEGORY, convertToTitleCase, isEmpty } from '../../utils';

//** component */
import StyledTableRow from '../StyledTableRow';

//** redux */
import { useLoader } from '../../Provider/LoaderContext';
import useAlertDialog from '../../hook/useAlertDialog';
import CustomModal from '../CustomModal';

const BulkConsumerRegistrationComponent = (props) => {
    const { orgId, orgName, role, userId } = useSelector((state) => state.user);
    const { orgField } = useSelector((state) => state.extra);
    const { isLoading, showLoader, hideLoader } = useLoader();
    const alertDialog = useAlertDialog();
    const [billerCategory, setBillerCategory] = React.useState(BILLER_CATEGORY);
    const [billerCategoryList, setBillerCategoryListData] = React.useState([]);
    const [stateList, setStateList] = React.useState([]);
    const [billerCode, setBillerCode] = React.useState('');
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [selectedFile, setSelectedFile] = React.useState("");
    const [states, setStates] = React.useState({});
    const [billerDetailsFields, setBillerDetailsFields] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [isModal, setIsModal] = React.useState(false);
    const [excelData, setExcelData] = React.useState([]);
    const [checked, setChecked] = React.useState(false);

    const validConsumerList = excelData.filter((e) => e.Error == false);
    const inValidConsumerList = excelData.filter((e) => e.Error == true);

    const handleCheckBoxChange = (event) => {
        setChecked(event.target.checked);
    };

    const alertRegisterToggleOpen = () => {
        alertDialog({
            rightButtonFunction: registerConsumer,
            title: "Bulk Consumer Register",
            desc: `Register ${validConsumerList.length} Consumer in ${orgName}`
        })
    };

    const openModal = () => setIsModal(true);

    const closeModal = () => {
        setIsModal(false);
        setSelectedFile(null)
        setExcelData([])
    }

    const handleChangeBillerCategory = (event) => {
        setBillerCategory(event.target.value);
        setStates({ ...states, ["BillerCategory"]: event.target.value });
        billerNameRequest(event.target.value).then((data) => {

            setBillerNameListData(data);
        });

    };

    const handleChangeBillerName = (event) => {
        let billerNameCode = event.target.value.split('/');
        setBillerCode(event.target.value);
        setStates({ ...states, ["BillerName"]: billerNameCode[1], ["BillerCode"]: billerNameCode[0], ['alias']: billerNameCode[2] });
        billerDetailsRequest(billerNameCode[0]).then((data) => {
            setBillerDetailsFields(data);
        });
    };

    const handleChangeStateName = async (event) => {
        setStateName(event.target.value)
        billerNameRequest(billerCategory, event.target.value).then((data) => {
            if (data) {
                setBillerNameListData(data);
            }
        });
    };

    const downloadTemplateExcel = async () => {
        let data = [
            {
                "Alias": states.alias,
                "ConsumerId": null,
                "ConsumerName": null,
                "PhoneNumber": null,
                "BankAccountNo": null,
                "IFSCCode": null,
                "ConsumerType": "LT",
                "PayType": "Postpaid",
            }
        ];

        data.map(item => billerDetailsFields && billerDetailsFields.map((val, index) => {
            item[`Parameter${index + 1}`] = val.BillerConsumerParam
            item[`Value${index + 1}`] = ''
        }));

        data.map(item => orgField.map((val) => {
            if (val?.typeTable == "Consumer") {
                item[val.fieldName] = null
            }
        }))

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.BULK_CONSUMER_SHEET);
        XLSX.writeFile(workbook, excelName.BULK_CONSUMER_EXCEL);
        clearData();
    };

    const downloadFailedExcel = async () => {
        const worksheet = XLSX.utils.json_to_sheet(inValidConsumerList);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, excelName.CONSUMER_FAILED_SHEET);
        XLSX.writeFile(workbook, excelName.CONSUMER_FAILED_EXCEL);
        clearData();
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
                    setExcelData(json);
                }
            };
            if (reader && e.target.files[0])
                reader?.readAsArrayBuffer(e.target.files[0]);
            setSelectedFile(e.target.files[0])
        }
        hideLoader();
    };

    const verifyConsumer = async () => {

        if (excelData.length == 0) {
            props.openAlertHandle("error", "Please insert data");
            return
        }
        showLoader()
        try {
            const newData = await consumerValid(excelData, orgId, checked);
            setExcelData(newData);
            openModal();
        } catch (error) {
            console.log("🚀 ~ file: consumerRegistration.js:616 ~ verifyConsumer ~ error:", error)
        }
        hideLoader()
    };

    const registerConsumer = async () => {
        showLoader();
        if (validConsumerList?.length > 0) {
            const body = {
                "type": "REGISTER_CONSUMER",
                "orgId": orgId,
                "userId": userId,
                "data": validConsumerList
            };
            await bulkConsumerSave(body).then((resp) => {
                if (resp?.statusCode === 200) {
                    props.openAlertHandle("success", "Your consumer will be registered within 24 hours : " + resp?.body);
                } else {
                    props.openAlertHandle("error", "Failed Upload" + JSON.stringify(resp?.body));
                }
                closeModal();
                setSelectedFile(null);
            }).catch((error) => {
                console.log("🚀 ~ file: consumerRegistration.js:645 ~ await bulkConsumerSave ~ error:", error);
                props.openAlertHandle("error", JSON.stringify(error));
            }).finally(() => {
                console.log("end registerConsumer function");
            });

        } else {
            props.openAlertHandle("error", "Please valid data insert");
        }
        hideLoader()
    };

    const [billPage, setBillPage] = React.useState(0);
    const [billRowsPerPage, setBillRowsPerPage] = React.useState(4);

    const handleChangeBillRowsPerPage = (event) => {
        setBillRowsPerPage(+event.target.value);
        setBillPage(0);
    };

    const handleChangeBillPage = (event, newPage) => setBillPage(newPage);

    const ModalRow = ({ row, index }) => {
        const statusLabel = {
            [true]: "Failure",
            [false]: "Success"
        }
        const statusColor = {
            [true]: "error",
            [false]: "success"
        }
        return (
            <StyledTableRow key={index}  >
                <TableCell align="center"><Chip label={statusLabel[row.Error]} color={statusColor[row.Error]} variant="outlined" /></TableCell>
                <TableCell align="center">{isEmpty(row.Reason)}</TableCell>
                <TableCell align="center">{isEmpty(row.ConsumerId)}</TableCell>
                <TableCell align="center">{isEmpty(row.ConsumerName)}</TableCell>
                <TableCell align="center">{isEmpty(row.BillerCategory)}</TableCell>
                <TableCell align="center">{isEmpty(row.BillerCode)}</TableCell>
                <TableCell align="center">{isEmpty(row.BillerName)}</TableCell>
                <TableCell align="center">{isEmpty(row.PhoneNumber)}</TableCell>
                {
                    orgField && orgField.length > 0 ? orgField.map((field, index) => {

                        if (field?.typeTable == "Consumer") {
                            if (field?.fieldType === "char") {
                                return <TableCell key={index} align="center">{isEmpty(row[field?.fieldName])}</TableCell>
                            }
                        }

                    }) : null
                }
            </StyledTableRow>
        )
    }

    const clearData = () => {
        setStates({})
        setBillerDetailsFields([])
        setBillerNameListData([])
        setStateName('')
        setBillerCode('')
    }
    const getCategory = async () => {
        await billerCategoryRequest().then((data) => {
            setBillerCategoryListData(data);
        }).then(async () => {
            await getBillerStatesList()
        });
    }
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
    }

    React.useEffect(() => {
        getCategory()
    }, []);
    return (
        <>
            <Stack flex={1} >
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ m: 3 }} spacing={3}>
                    <FormControl size='small' fullWidth>
                        <InputLabel id="bulkBillerCategoryLabel">Select Biller Category</InputLabel>
                        <Select
                            labelId="bulkBillerCategoryLabel"
                            id="bulkBillerCategory"
                            label="Select Biller Category"
                            value={billerCategory}
                            onChange={handleChangeBillerCategory}
                        >
                            {billerCategoryList && billerCategoryList.length > 0 ? billerCategoryList?.map((val, index) => {
                                return (<MenuItem key={index} value={val.Categoryname}>{val.Categoryname}</MenuItem>)
                            }) : null
                            }
                        </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                        <InputLabel id="singleBillerNameLabel">Select State</InputLabel>
                        <Select
                            disabled={billerCategory ? false : true}
                            required
                            labelId="singleBillerNameLabel"
                            id="singleBillerName"
                            value={stateName}
                            label="Select State"
                            onChange={handleChangeStateName}
                        >
                            {stateList && stateList.length > 0 ? stateList.sort((a, b) => a.stateName > b.stateName ? 1 : -1).map((val, index) => {
                                return (<MenuItem key={`${index + 15}`} value={val.stateName}>{val.stateName}</MenuItem>)
                            }) : null
                            }
                        </Select>
                    </FormControl>
                    <FormControl size='small' fullWidth>
                        <InputLabel id="bulkBillerNameLabel">Select Biller Name</InputLabel>
                        <Select
                            disabled={stateName ? false : true}
                            labelId="bulkBillerNameLabel"
                            label="Select Biller Name"
                            id="bulkBillerName"
                            value={billerCode}
                            onChange={handleChangeBillerName}
                        >
                            {billerNameListData.length > 0 ? billerNameListData.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                                return (<MenuItem key={`${index + 15}`} value={val.billerId + "/" + val.billerName + '/' + val.alias}> {val.billerName}</MenuItem>)
                            }) : null
                            }
                        </Select>
                    </FormControl>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ px: 3 }}>
                    <Button onClick={clearData} color='inherit' variant="contained">Clear</Button>
                    {billerDetailsFields.length > 0 ? <Button onClick={downloadTemplateExcel} variant="contained">Download Template</Button> : null}
                    <Button variant="outlined" component="label">
                        {selectedFile ? selectedFile?.name : "Upload Bulk Consumer File"}
                        <input
                            accept=".xls,.xlsx"
                            onChange={onFileChange}
                            type="file"
                            hidden
                        />
                    </Button>
                    {
                        role == "admin" && excelData ?
                            <FormControlLabel
                                control={<Checkbox
                                    checked={checked}
                                    onChange={handleCheckBoxChange}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />}
                                style={{
                                    color: "red"
                                }}
                                label="Without verification registration!"
                            /> : null
                    }
                    {selectedFile ?
                        <LoadingButton loading={isLoading} variant="contained" onClick={verifyConsumer} >
                            {"Verify"}
                        </LoadingButton> : null}
                </Stack>
                <CustomModal open={isModal}  >
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <CardHeader title="Verify Consumers" />
                        <TableContainer >
                            <Table size="medium" aria-label="a dense table" sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">Reason</TableCell>
                                        <TableCell align="center">Consumer Id</TableCell>
                                        <TableCell align="center">Consumer Name</TableCell>
                                        <TableCell align="center">Biller Category</TableCell>
                                        <TableCell align="center">Biller Code</TableCell>
                                        <TableCell align="center">Biller Name</TableCell>
                                        <TableCell align="center">Phone Number</TableCell>
                                        {orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                                            if (field?.typeTable == "Consumer") {
                                                return <TableCell key={index} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                                            }
                                        }) : null}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {excelData && excelData.slice(billPage * billRowsPerPage, billPage * billRowsPerPage + billRowsPerPage).map((row, index) => <ModalRow key={index} row={row} index={index} />)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[4, 10, 20, 50]}
                            component="div"
                            count={excelData.length}
                            rowsPerPage={billRowsPerPage}
                            page={billPage}
                            onPageChange={handleChangeBillPage}
                            onRowsPerPageChange={handleChangeBillRowsPerPage}
                        />
                        <CardActions>
                            {validConsumerList.length ? <Button variant='contained' onClick={alertRegisterToggleOpen} > {`Upload ${validConsumerList.length} Consumer`}</Button> : null}
                            {inValidConsumerList.length ? <Button variant='outlined' onClick={downloadFailedExcel} >{`Download Failed ${inValidConsumerList.length} Consumer`}</Button> : null}
                            <Button variant='contained' color='inherit' onClick={closeModal}>Close</Button>
                        </CardActions>
                    </Paper>
                </CustomModal>
            </Stack>
        </>
    );
}

export default memo(BulkConsumerRegistrationComponent)
