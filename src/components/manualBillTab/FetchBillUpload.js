import * as React from 'react';
import { Box, Card, FormControl, InputLabel, Select, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Container, Backdrop, CircularProgress, Grid, CardContent, Button, TableContainer, Paper } from '@mui/material';

//** service */
import { billerCategoryRequest, billerDetailsRequest, billerNameRequest, billerNameStates, bulkBillUploadAPI, consumerListByFilter, getManualBill, insertManualBill } from '../../utils/bbps/billerServices';

//** npm */
import { useDispatch, useSelector } from 'react-redux';

//** utils */
import { BILLER_CATEGORY, amountFormat, isEmpty } from '../../utils';
import { yearMonthDate } from '../../utils/dateFormat';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';
import StyledTableRow from '../StyledTableRow';

const FetchBillUpload = () => {
    const { showLoader, hideLoader, isLoading } = useLoader();
    const { orgId, userId } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    //** state */
    const [billerCategory, setBillerCategory] = React.useState('');
    const [billerName, setBillerName] = React.useState('');
    const [consumerId, setConsumerId] = React.useState('');
    const [billerCategoryListData, setBillerCategoryListData] = React.useState([]);
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [billDetails, setBillDetails] = React.useState(null);
    const [billerResponse, setBillerResponse] = React.useState({});
    const [stateName, setStateName] = React.useState('');
    const [stateList, setStateList] = React.useState([]);
    const [billerDetailsFields, setBillerDetailsFields] = React.useState([]);
    const [states, setStates] = React.useState({});
    const [customerParams, setCustomerParams] = React.useState({});
    const [resBody, setResBody] = React.useState({});

    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))

    const handleChangeBillerCategory = (event) => {
        setBillerCategory(event.target.value);
        setStates({ ...states, ["billerCategory"]: event.target.value });
        billerNameRequest(event.target.value).then((data) => {
            if (data) {
                setBillerNameListData(data);
            }
        });
    };

    const handleChangeBillerName = (event) => {
        let billerNameCode = event.target.value.split('/');
        setBillerName(event.target.value);
        setStates({ ...states, ["billerId"]: billerNameCode[0] });
        billerDetailsRequest(billerNameCode[0]).then((data) => {
            setBillerDetailsFields(data);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        const consParams = Object.values(customerParams)
        showLoader()
        await getManualBill(states, consParams).then((res) => {
            if (res.reason?.responseCode == "000") {
                setResBody(res)
                setBillDetails(res.billDetails);
                setBillerResponse(res.billerResponse);
                openAlertHandle("success", "Bill Fetch Completed Successfully!");
            } else {
                openAlertHandle("error", res.reason.responseReason + "!  " + res.reason.complianceReason);
            }
        }).catch(error => {
            console.log("🚀 ~ file: FetchBillUpload.js:100 ~ await getManualBill ~ error:", error)
            openAlertHandle("error", "Error in Bill Fetch!" + JSON.stringify(error));
        })
        e.target.reset()
        hideLoader()
    }
    const clearData = () => {
        setConsumerId("")
        setStates({});
        setBillerName('')
        setBillDetails(null)
        setBillerDetailsFields([])
        setCustomerParams({})
    }
    const handleDynamicFields = (name, event, reqLength, index) => {
        setCustomerParams({
            ...customerParams,
            [`${index}`]: {
                name: name,
                value: event.target.value
            }
        });
    }

    const insertBill = async () => {
        showLoader()
        try {
            const ConsumerData = {
                "ConsumerId": consumerId,
                "orgId": orgId,
                "BillerCode": String(resBody?.billDetails.billerId)
            }
            const initialValue = {
                "userId": "",
                "orgId": orgId,
                "consumerNumber": ConsumerData.ConsumerId,
                "billerName": "",
                "billerId": ConsumerData.BillerCode,
                "registrationDateFrom": "",
                "registrationDateTo": "",
                "consumerName": "",
                "stateName": "",
                "rowPerPage": 10,
                "pageNo": 0,
                "active": "",
                "payType": "ALL",

            }
            const existConsumer = await consumerListByFilter(initialValue);

            if (existConsumer?.data?.length > 0) {
                let Active = existConsumer?.data[0]?.Active;
                if (Active > 0) {
                    let CID = existConsumer?.data[0]?.ID;
                    let ID = CID + yearMonthDate(billerResponse.dueDate);
                    const body = {
                        "type": "CHECK_BILL",
                        "orgId": orgId,
                        "userId": "",
                        "data": ID
                    };
                    const billExits = await bulkBillUploadAPI(body);
                    if (billExits?.length > 0) {
                        openAlertHandle("error", "That bill already exists!");
                    } else {
                        const data = { ...resBody, "userId": userId, orgId: orgId, "consumerId": consumerId, fetchType: 0, "CID": CID };
                        const res = await insertManualBill(data);
                        if (res?.statusCode === 200) {
                            openAlertHandle("success", res?.data);
                        } else {
                            openAlertHandle("error", JSON.stringify(res));
                        }
                        clearData();
                    }

                } else {

                    openAlertHandle("error", `Consumer Inactive! (Consumer ID: ${consumerId})`);
                }

            } else {
                openAlertHandle("error", "Consumer not registered. Please register");
            }
        } catch (error) {
            console.log("🚀 ~ file: FetchBillUpload.js:165 ~ insertBill ~ error:", error)
            openAlertHandle("error", JSON.stringify(error));
        } finally {

            hideLoader()
        }

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
                setStateList([{ stateName: "All" }, ...resp])
            } else {
                setStateList([])
            }
        }).catch((error) => {
            console.log("🚀 ~ file: billStatus.js:120 ~ await billerNameStates ~ error:", error)
            setStateList([])
        });
    }

    const handleChangeStateName = async (event) => {
        setStateName(event.target.value)
        billerNameRequest(billerCategory, event.target.value).then((data) => {
            if (data) {
                setBillerNameListData(data);
            }
        });
    };

    React.useEffect(() => {
        getCategory()
    }, []);

    return (
        <Stack spacing={3}>
            <Card component={"form"} onSubmit={handleSubmit}>
                <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                    <Grid item xs={2} sm={4} md={4} p={1} >
                        <FormControl size="small" fullWidth>
                            <InputLabel id="singleBillerCategoryLabel">Select Biller Category</InputLabel>
                            <Select
                                required
                                labelId="singleBillerCategoryLabel"
                                id="singleBillerCategory"
                                value={billerCategory}
                                label="singleBillerCategoryLabel"
                                onChange={handleChangeBillerCategory}
                            >
                                {billerCategoryListData && billerCategoryListData.length > 0 ? billerCategoryListData.sort((a, b) => a.Categoryname > b.Categoryname ? 1 : -1).map((val, index) => {
                                    return (<MenuItem key={index} value={val.Categoryname}>{val.Categoryname}</MenuItem>)
                                }) : null
                                }
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
                        <FormControl size="small" fullWidth>
                            <InputLabel id="singleBillerNameLabel">Select Biller Name</InputLabel>
                            <Select
                                required
                                labelId="singleBillerNameLabel"
                                id="singleBillerName"
                                value={billerName}
                                label="Select Biller Name"
                                onChange={handleChangeBillerName}
                            >
                                {billerNameListData.length > 0 ? billerNameListData.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                                    return (<MenuItem key={`${index}`} value={val.billerId + '/' + val.billerName}>{val.billerName}</MenuItem>)
                                }) : null
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4} p={1} >
                        <TextField
                            id="outlined-error-helper-text"
                            required
                            size='small'
                            label={"Consumer Id"}
                            value={consumerId}
                            onChange={(ele) => { setConsumerId(ele.target.value) }}
                            variant="outlined"
                        />
                    </Grid>
                    {billerDetailsFields && billerDetailsFields?.length > 0 ? billerDetailsFields?.map((val, index) => {
                        return (
                            <Grid item xs={2} sm={4} md={4} p={1} key={index} >
                                <TextField
                                    id="outlined-error-helper-text"
                                    required={val.Require}
                                    size='small'
                                    key={index}
                                    label={val.BillerConsumerParam}
                                    onChange={(ele) => { handleDynamicFields(val.BillerConsumerParam, ele, val.ReqLength, index) }}
                                    variant="outlined"
                                />
                            </Grid>)
                    }) : null
                    }
                </Grid>
                <Box p={1}>
                    {billerDetailsFields && billerDetailsFields.length > 0 && billerCategory === BILLER_CATEGORY ? <Button type='submit' variant="contained">Proceed</Button> : null}
                </Box>
            </Card>
            {billDetails != null ?
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table size="medium" aria-label="a dense table" >
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Consumer Id</TableCell>
                                    <TableCell align="center">Consumer Name</TableCell>
                                    <TableCell align="center">Biller Name</TableCell>
                                    <TableCell align="center">Amount</TableCell>
                                    <TableCell align="center">Bill Creation Date</TableCell>
                                    <TableCell align="center">Due Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <StyledTableRow key={billDetails?.billerId} >
                                    <TableCell align="center">{isEmpty(consumerId)}</TableCell>
                                    <TableCell align="center">{isEmpty(billerResponse.customerName)}</TableCell>
                                    <TableCell align="center">{isEmpty(billerName.split('/')[1])}</TableCell>
                                    <TableCell align="center">{amountFormat(billerResponse.amount)}</TableCell>
                                    <TableCell align="center">{isEmpty(billerResponse.billDate)}</TableCell>
                                    <TableCell align="center">{isEmpty(billerResponse.dueDate)}</TableCell>
                                </StyledTableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box p={1}>
                        <Button loading={isLoading} variant='contained' onClick={insertBill}>Add</Button>
                    </Box>
                </Paper>
                : null
            }
        </Stack>
    );
}


export default FetchBillUpload;