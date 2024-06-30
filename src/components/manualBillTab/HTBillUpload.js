import React from 'react';

//** mui */
import { Box, Card, Stack, TextField, FormControl, InputLabel, MenuItem, Select, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** npm */
import { useDispatch, useSelector } from 'react-redux';

//** service */
import { billerCategoryRequest, billerDetailsRequest, billerNameRequest, billerNameStates, consumerListByFilter, insertHTManualBill } from '../../utils/bbps/billerServices';

//** icon */

//** utils */
import { formatDate, getMonthAndYear, yearMonthDate } from '../../utils/dateFormat';
import { BILLER_CATEGORY } from '../../utils';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';

const HTBillUpload = (props) => {
    const { showLoader, hideLoader, isLoading } = useLoader();

    const { orgId, userId } = useSelector((state) => state.user)
    const dispatch = useDispatch();

    const initialFilterBody = {
        "orgId": orgId,
        "userId": userId,
        "BillerId": "",
        "ConsumerId": "",
        "billNumber": "",
        "billMonthYear": getMonthAndYear(),
        "billDate": "",
        "amount": "",
        "dueDate": "",
        "billStatus": 1,
    }

    //** state */
    const [filterBody, setFilterBody] = React.useState(initialFilterBody);
    const [billerCategory, setBillerCategory] = React.useState(BILLER_CATEGORY);
    const [billerCategoryListData, setBillerCategoryListData] = React.useState([]);
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [billerDetailsFields, setBillerDetailsFields] = React.useState([]);
    const [stateList, setStateList] = React.useState([]);
    const [billerName, setBillerName] = React.useState('');
    const [stateName, setStateName] = React.useState('');

    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }))
    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) })

    const handleChangeStateName = async (event) => {
        setStateName(event.target.value)
        billerNameRequest(billerCategory, event.target.value).then((data) => {

            if (data) {
                setBillerNameListData(data);
            }
        });
    };


    const handleChangeBillerCategory = (event) => {
        setBillerCategory(event.target.value);
        billerNameRequest(event.target.value).then((data) => {
            setBillerNameListData(data);
        });

    };
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
    const handleChangeBillerName = (event) => {
        let billerNameCode = event.target.value.split('/');
        setBillerName(event.target.value);
        setFilterBody({ ...filterBody, ["BillerId"]: billerNameCode[0] });
        billerDetailsRequest(billerNameCode[0]).then((data) => {
            setBillerDetailsFields(data);
        });
    };

    const handleDynamicFields = async (event) => {
        setFilterBody({
            ...filterBody,
            ["ConsumerId"]: event.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        showLoader()
        try {
            const initialValue = {
                "userId": "",
                "orgId": orgId,
                "consumerNumber": filterBody.ConsumerId,
                "billerName": "",
                "billerId": filterBody.BillerId,
                "consumerName": "",
                "stateName": "",
                "registrationDateFrom": "",
                "registrationDateTo": "",
                "rowPerPage": 10,
                "pageNo": 0,
                "active": "",
                "payType": "ALL",


            }
            const existConsumer = await consumerListByFilter(initialValue);
            let consumerExits = existConsumer?.data?.length > 0
            let ID = ''
            let CID = ''
            let Parameter1 = ''
            let Value1 = ''

            if (consumerExits) {
                const compareDate = "1990-01-01"
                let billDate = String(filterBody?.billDate)
                billDate = billDate === compareDate ? yyyymmdd(new Date()) : billDate
                let dueDate = String(filterBody?.dueDate)
                dueDate = dueDate === compareDate ? addDaysCurrent(7) : dueDate
                ID = existConsumer?.data[0]?.ID + yearMonthDate(dueDate)
                CID = existConsumer?.data[0]?.ID
                Parameter1 = existConsumer?.data[0]?.Parameter1
                Value1 = existConsumer?.data[0]?.Value1
                const billDetails = { "billerId": filterBody.BillerId, "customerParams": [{ "name": Parameter1, "value": Value1 }] }
                const mainBody = { ...filterBody, "BillDetails": billDetails, "CID": CID, "ID": ID }
                const resp = await insertHTManualBill(mainBody);

                if (resp?.statusCode === 200) {
                    openAlertHandle("success", "Successful Upload");
                }
            } else {
                setFilterBody(initialFilterBody)
                openAlertHandle("error", "Consumer not registered. Please register");
            }
        } catch (error) {
            openAlertHandle("error", JSON.stringify(error));
        } finally {
            setFilterBody(initialFilterBody)
            hideLoader()
        }
    }

    React.useEffect(() => {
        billerCategoryRequest().then((data) => {
            setBillerCategoryListData(data);
        });
        getBillerStatesList();
    }, [])

    return (
        <Card>
            <Stack component="form" onSubmit={handleSubmit}>
                <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                    <Grid item xs={2} sm={4} md={4} p={1} >
                        <FormControl size="small" fullWidth>
                            <InputLabel id="singleBillerCategoryLabel">Select Biller Category</InputLabel>
                            <Select
                                required
                                labelId="singleBillerCategoryLabel"
                                id="singleBillerCategory"
                                value={billerCategory}
                                label="Select Biller Category"
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
                                disabled={billerCategory ? false : true}
                                required
                                labelId="singleBillerNameLabel"
                                id="singleBillerName"
                                value={stateName}
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
                                    return (<MenuItem key={`${index + 15}`} value={val.billerId + '/' + val.billerName}>{val.billerName}</MenuItem>)
                                }) : null
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                            inputFormat="dd/MM/yyyy"
                            label="Bill Creation Date"
                            value={filterBody.billDate || null}
                            onChange={(e) => onChangeDate("billDate", e)}
                            renderInput={(params) => <TextField disabled required fullWidth size='small' {...params} helperText={null} />}
                        />
                    </Grid>
                    <Grid item xs={2} sm={4} md={4} p={1} >
                        <DatePicker
                            inputFormat="dd/MM/yyyy"
                            label="Due Date"
                            value={filterBody.dueDate || null}
                            onChange={(e) => onChangeDate("dueDate", e)}
                            renderInput={(params) => <TextField disabled required fullWidth size='small' {...params} helperText={null} />}
                        />
                    </Grid>
                    <Grid item xs={2} sm={4} md={4} p={1} >
                        <TextField fullWidth required size='small' label="Amount"
                            value={filterBody.amount}
                            name='amount'
                            onChange={onChangeHandle}
                            variant="outlined" />
                    </Grid>
                    <Grid item xs={2} sm={4} md={4} p={1} >
                        <TextField fullWidth required size='small' label="Bill Number"
                            value={filterBody.billNumber}
                            name='billNumber'
                            onChange={onChangeHandle}
                            variant="outlined" />
                    </Grid>
                    {billerDetailsFields && billerDetailsFields.length > 0 ? billerDetailsFields.map((val, index) => {
                        return (
                            <Grid key={index.toString()} item xs={2} sm={4} md={4} p={1} >

                                <TextField

                                    fullWidth
                                    inputProps={{
                                        maxLength: val.ReqLength
                                    }}
                                    id="outlined-error-helper-text"
                                    required
                                    size='small'
                                    label={val.BillerConsumerParam}
                                    onChange={(ele) => { handleDynamicFields(ele) }}
                                    variant="outlined" />
                            </Grid>
                        )
                    }) : null}
                </Grid>
                <Box p={1}>
                    {billerDetailsFields && billerDetailsFields.length > 0 && billerCategory === BILLER_CATEGORY ? <LoadingButton loading={isLoading} type='submit' variant="contained">Submit</LoadingButton> : null}
                </Box>
            </Stack>
        </Card>
    )
}

export default HTBillUpload