import * as React from 'react';

//** next */
import Head from 'next/head';

//** mui */
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Box, TablePagination, Card, Typography, Divider, Grid, Stack, TextField, Button, FormControl, Select, InputLabel, MenuItem, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Download } from '@mui/icons-material';

//** component */
import StyledTableRow from '../StyledTableRow';

//** service */
import { billerNameRequest, billerNameStates, downloadExcelFromAPI, getAutoBillFilter } from '../../utils/bbps/billerServices';

//** redux */
import { useDispatch, useSelector } from 'react-redux';

//** utils */
import { excelName } from '../../utils/excelDownloadManagement';
import { BILLER_CATEGORY, amountFormat, convertToTitleCase, isEmpty } from '../../utils';
import { formatDate, formateDDMMMYYYYhhmm } from '../../utils/dateFormat';

//** npm */
import { v4 as uuid } from 'uuid';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';

//** hook */
import { useLoader } from '../../Provider/LoaderContext';

const PrepaidBalanceTab = () => {

    const { userId, orgId } = useSelector((state) => state.user);
    const { orgField, payTypeList } = useSelector((state) => state.extra);
    const { showLoader, hideLoader } = useLoader();
    const dispatch = useDispatch();

    const initialStateOfBody = {
        "userId": userId,
        "orgId": orgId,
        "consumerId": "",
        "billerId": "",
        "stateName": "",
        "payType": "",
        "updatedDateFrom": "",
        "updatedDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0
    };


    const [prepaidBalanceList, setPrepaidBalance] = React.useState([]);
    const [dataLength, setDataLength] = React.useState(0);
    const [filterBody, setFilterBody] = React.useState(initialStateOfBody);
    const [clearFlag, setClearFlag] = React.useState(false);

    const [billerName, setBillerName] = React.useState('');
    const [stateName, setStateName] = React.useState('');
    const [stateList, setStateList] = React.useState([]);
    const [billerNameListData, setBillerNameListData] = React.useState([]);

    const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, "pageNo": newPage });
    const handleChangeRowsPerPage = event => setFilterBody({ ...filterBody, "rowPerPage": event.target.value });
    const onChangeHandle = async (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) })
    const onChangeSelectPayTypeHandle = async (e) => setFilterBody({ ...filterBody, "payType": e.target.value });


    const openAlertHandle = (type = "success", message = "Message") => {
        dispatch(openAlertSnack({ type: type, message: message }))
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


    const handleChangeBillerName = (event) => {
        setBillerName(event.target.value);
        let billerNameCode = event.target.value.split('/');
        setFilterBody({ ...filterBody, ["billerName"]: billerNameCode[1], ["billerId"]: billerNameCode[0] });
    };

    const handleChangeStateName = async (event) => {
        showLoader()
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
            hideLoader()
        });
    };

    const downloadExcel = async () => {
        try {
            const id = uuid().toUpperCase();
            const body = {
                "type": "CREATE",
                "id": id,
                "name": excelName.PREPAID_BALANCE,
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


    const getPrepaidBill = async () => {
        showLoader()
        let body = {
            "type": "PREPAID_BALANCE",
            "data": filterBody
        }

        try {
            const resp = await getAutoBillFilter(body);
            console.log("🚀 ~ file: prepaidBalance.js:84 ~ getPrepaidBill ~ resp:", resp)
            if (resp.statusCode === 200) {
                const { data, Counts } = resp.body;
                setPrepaidBalance(data);
                setDataLength(Counts);
            }
            hideLoader()
        } catch (error) {
            console.log("🚀 ~ file: processBillTab.js:279 ~ getPrepaidBill ~ error:", error);
        }

    }

    const clearState = () => {
        setBillerName("");
        setStateName("");
        setFilterBody(initialStateOfBody);
        setClearFlag(!clearFlag)
    }

    React.useEffect(() => {
        getBillerStatesList()
        getBillerName()
        getPrepaidBill();
    }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo])


    const PrepaidBalanceRow = ({ item, index }) => {

        const getUpdatedDate = () => {
            if (item.UpdatedON) return item.UpdatedON;
            if (item.ts) return `Current Balance ( Updated on ${formateDDMMMYYYYhhmm(item.ts)} )`;
            return "N/A"
        }

        return (<StyledTableRow
        >
            <TableCell align="center">{isEmpty(item.ConsumerId)}</TableCell>
            <TableCell align="center">{isEmpty(item.ConsumerName)}</TableCell>
            {
                orgField && orgField.length > 0 ? orgField.map((field, index) => {
                    if (field?.filterFlag === 1) {
                        if (field?.fieldType === "char") {
                            return <TableCell key={index} align="center">{isEmpty(item[field?.fieldName])}</TableCell>
                        }
                    }
                }) : null
            }
            <TableCell align="center">{isEmpty(item.BillerName)}</TableCell>
            <TableCell align="center">{amountFormat(item.CurrentBalance)}</TableCell>
            <TableCell align="center">{getUpdatedDate()}</TableCell>
            <TableCell align="center">{isEmpty(item.payType)}</TableCell>
        </StyledTableRow>)
    };

    return (
        <>
            <Head>
                <title>
                    Prepaid Balance
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
                    <Stack component="form" >
                        <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <TextField fullWidth value={filterBody.consumerId} size="small" onChange={onChangeHandle} name='consumerId' id="outlined-basic" label="Consumer Number" variant="outlined" />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1} >
                                <FormControl fullWidth size="small" >
                                    <InputLabel id="demo-simple-select-pay-status">Choose PayType</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-pay-status"
                                        id="demo-simple-pay-status"
                                        value={filterBody.payType}
                                        label="Choose PayType"
                                        name='payType'
                                        onChange={onChangeSelectPayTypeHandle}
                                    >
                                        {payTypeList && payTypeList.length > 0 ? payTypeList.map((e, i) => {
                                            return < MenuItem key={i + e?.payType} value={e?.payType}>{e?.payType}</MenuItem>
                                        }) : null}
                                    </Select>
                                </FormControl>
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
                                        {billerNameListData.length > 0 ? billerNameListData.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                                            return (<MenuItem key={`${index + 15}`} value={val.billerId + '/' + val.billerName}>{val.billerName}</MenuItem>)
                                        }) : null
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            {
                                orgField && orgField.length > 0 ? orgField.map((field, index) => {

                                    if (field?.filterFlag === 1) {
                                        if (field?.fieldType === "char") {
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

                                }) : null
                            }
                        </Grid>
                        <Stack justifyContent={'space-between'} spacing={3} p={1} direction={{ xs: 'column', sm: 'row' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} >
                                <Button onClick={getPrepaidBill} variant="contained">Search Consumer</Button>
                                <Button type='reset' onClick={clearState} color='inherit' variant="contained" >Clear</Button>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <Button startIcon={<Download />} onClick={downloadExcel} variant="contained">Download Consumers</Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Card>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>

                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Consumer No.</TableCell>
                                    <TableCell align="center">Consumer Name.</TableCell>
                                    {
                                        orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                                            if (field?.filterFlag === 1) {
                                                if (field?.fieldType === "char") {
                                                    return <TableCell key={index} align="center">{convertToTitleCase(field?.fieldName)}</TableCell>
                                                }
                                            }
                                        }) : null
                                    }
                                    <TableCell align="center">Biller Name</TableCell>
                                    <TableCell align="center">Current Balance</TableCell>
                                    <TableCell align="center">Updated ON</TableCell>
                                    <TableCell align="center">Pay Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {prepaidBalanceList && prepaidBalanceList.map((item, index) => <PrepaidBalanceRow key={item.ConsumerId.toString() + index.toString()} item={item} index={index} />)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={dataLength}
                        rowsPerPage={filterBody.rowPerPage}
                        page={filterBody.pageNo}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Stack>
        </>);
}

export default PrepaidBalanceTab;