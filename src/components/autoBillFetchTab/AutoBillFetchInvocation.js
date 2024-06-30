import * as React from 'react';

//** mui */
import { Box, Typography, Button, Stack, Card, Divider, InputLabel, FormControl, Select, MenuItem, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

//** service */
import { billerNameRequest, billerNameStates, autoBillFetchList } from '../../utils/bbps/billerServices';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';
import { useDispatch, useSelector } from 'react-redux';

//** utils */
import { BILLER_CATEGORY } from '../../utils';
import { formatDate } from '../../utils/dateFormat';

const AutoBillFetchInvocation = () => {
    const { showLoader, hideLoader } = useLoader();
    const { orgId, userId } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const initialBody = {
        "userId": userId,
        "orgId": orgId,
        "consumerNumber": "",
        "billerId": "",
        "tentativeDateFrom": "",
        "tentativeDateTo": "",
        "rowPerPage": 10,
        "pageNo": 0,
        "stateName": "",
    }

    // state
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [stateList, setStateList] = React.useState([]);
    const [filterBody, setFilterBody] = React.useState(initialBody);
    const [billerName, setBillerName] = React.useState('');
    const [clearFlag, setClearFlag] = React.useState(false);
    const onChangeDate = React.useCallback((name, value) =>
        setFilterBody({ ...filterBody, [name]: formatDate(value) }),
        [filterBody]);

    // function
    const openAlertHandle = (type, message) => dispatch(openAlertSnack({ type: type, message: message }));

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

    const getBillFetch = React.useCallback(async () => {
        const body = {
            BillerCode: billerName ? billerName.split('/')[0] : "",
            Org: orgId,
            State: stateName,
            TentativeDateFrom: filterBody?.tentativeDateFrom || null,
            TentativeDateTo: filterBody?.tentativeDateTo || null,
        }

        showLoader()
        await autoBillFetchList(body).then((resp) => {
            openAlertHandle("success", "Process has invoked. You will soon see the details on dashboard")
        }).catch(error => {
            console.log("🚀 ~ file: billsFetched.js:181 ~ await billFetchListFilter ~ error:", error)
        }).finally(() => {
            hideLoader()
        });
    }, [stateName, billerName, orgId, filterBody?.tentativeDateFrom, filterBody?.tentativeDateTo]);

    const clearState = () => {
        setBillerName("")
        setStateName("")
        setFilterBody(initialBody)
        setClearFlag(!clearFlag)
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

    React.useEffect(() => {
        getBillerName()
        getBillerStatesList()
    }, []);



    const isShowSearchButton = filterBody.billerId || filterBody.consumerNumber || filterBody.stateName || (filterBody.tentativeDateFrom && filterBody.tentativeDateTo)
    return (
        <>
            <Card>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }} >
                    <Typography variant="h6"
                        component="div">
                        Choose Filters
                    </Typography>
                </Box>
                <Divider />
                <Stack>
                    <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
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
                                label="Tentative  Date From"
                                value={filterBody.tentativeDateFrom || null}
                                onChange={(e) => onChangeDate("tentativeDateFrom", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} p={1} >
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                label="Tentative Date To"
                                value={filterBody.tentativeDateTo || null}
                                onChange={(e) => onChangeDate("tentativeDateTo", e)}
                                renderInput={(params) => <TextField disabled fullWidth size="small" {...params} helperText={null} />}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} p={1} >
                        {isShowSearchButton ? <Button onClick={getBillFetch} variant="contained">Search Bill</Button> : null}
                        <Button onClick={clearState} variant="contained" color='inherit'>Clear</Button>
                    </Stack>
                </Stack>
            </Card>
        </>
    )
}



export default AutoBillFetchInvocation;