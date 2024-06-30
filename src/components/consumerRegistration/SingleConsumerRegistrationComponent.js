import React, { memo } from 'react';

//** mui */
import { Box, FormControl, MenuItem, Select, InputLabel, FormControlLabel, Radio, RadioGroup, Stack, TextField, Grid, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//** service */
import { billerDetailsRequest, billerNameRequest, singleConsumerSave, getManualBill, billerCategoryRequest, billerNameStates } from '../../utils/bbps/billerServices';

//** redux */
import { useSelector } from 'react-redux';
import { useLoader } from '../../Provider/LoaderContext';

//** utils */
import { BILLER_CATEGORY, convertToTitleCase } from '../../utils';
import { formatDate } from '../../utils/dateFormat';

const SingleConsumerRegistrationComponent = (props) => {
    const { orgId, userId } = useSelector((state) => state.user);
    const { orgField } = useSelector((state) => state.extra);
    const { showLoader, hideLoader, isLoading } = useLoader();

    const initialState = {
        "orgId": orgId,
        "CustomerId": "",
        "UserId": userId,
        "BillerCategory": BILLER_CATEGORY,
        "BillerCode": "",
        "BillerName": "",
        "ConsumerId": "",
        "ConsumerNumber": "",
        "ConsumerName": "",
        "PhoneNumber": "",
        "RegistrationDate": "",
        "Active": 1,
        "DeactivationDate": "",
        "NextBillDate": "",
        "Parameter1": "",
        "Value1": "",
        "Parameter2": "",
        "Value2": "",
        "Parameter3": "",
        "Value3": "",
        "Parameter4": "",
        "Value4": "",
        "ConsumerType": "LT",
        "Alias": ""
    };
    const [isError, setIsError] = React.useState(false)
    const [billerCategory, setBillerCategory] = React.useState(BILLER_CATEGORY);
    const [billerCategoryListData, setBillerCategoryListData] = React.useState([]);
    const [billerName, setBillerName] = React.useState('');
    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateName, setStateName] = React.useState('');
    const [stateList, setStateList] = React.useState([]);
    const [billerDetailsFields, setBillerDetailsFields] = React.useState([]);
    const [states, setStates] = React.useState(initialState);
    const [addStates, setAddStates] = React.useState({});
    const onChangeHandle = (e) => setStates({ ...states, [e.target.name]: e.target.value });

    const onChangeAddHandle = (fieldId, fieldType, e) => {
        setAddStates({
            ...addStates, [fieldId]: {
                "fieldId": fieldId,
                "recordValue": fieldType == 'date' ? formatDate(e) : e.target.value,
            }
        });
    }


    const handleChangeBillerCategory = (event) => {
        setBillerCategory(event.target.value);
        setStates({ ...states, ["BillerCategory"]: event.target.value });
    };

    const handleChangeBillerName = async (event) => {
        showLoader()
        try {
            const billerNameCode = event?.target?.value?.split('/');
            setBillerName(event.target.value);
            setStates({ ...states, ["BillerName"]: billerNameCode[1], ["BillerCode"]: billerNameCode[0], ["Alias"]: billerNameCode[2], ["Active"]: Number(billerNameCode[3]) == 1 ? 2 : 1 });
            const data = await billerDetailsRequest(billerNameCode[0]);
            setBillerDetailsFields(data)
        } catch (error) {
            console.log("🚀 ~ file: SingleConsumerRegistrationComponent.js:96 ~ handleChangeBillerName ~ error:", error)
        } finally {
            hideLoader()
        }

    };


    const handleChangeStateName = async (event) => {
        showLoader()
        setStateName(event.target.value)
        await billerNameRequest(billerCategory, event.target.value).then((data) => {
            if (data) {
                setBillerNameListData(data);
            }
        }).catch((error) => {
            console.log("🚀 ~ file: js:104 ~ await billerNameRequest ~ error:", error)
        }).finally(() => {
            hideLoader()
        });
    };

    const handleDynamicFields = async (val, event, index) => {
        const newStates = {
            ...states,
            [`Parameter${index + 1}`]: val,
            [`Value${index + 1}`]: event.target.value
        }
        if (index === 0) {
            newStates["ConsumerId"] = event.target.value;
            newStates["ConsumerNumber"] = event.target.value;
        }
        setStates(newStates);
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        showLoader();
        try {
            if (states?.Active == 1 && states?.ConsumerType == "LT") {
                const customerParams = {}
                const consParams = Object.values({
                    ...customerParams,
                    0: {
                        name: states.Parameter1,
                        value: states.Value1
                    },
                    1: {
                        name: states.Parameter2,
                        value: states.Value2
                    },
                })
                const filterArray = consParams.filter((e) => e.name !== "" && typeof e.name !== "undefined");
                const resp = await getManualBill({ "billerId": states.BillerCode, "billerCategory": states.BillerCategory }, filterArray)
                if (resp?.reason?.responseCode === "000" || resp?.reason?.responseCode == 200) {
                    setIsError(false)
                    props.openAlertHandle("success", "This consumer is valid.");
                    await insertConsumerDatabase();
                } else {
                    setIsError(true)
                    props.openAlertHandle("error", "Invalid Consumer !");
                }
            } else {
                await insertConsumerDatabase()
            }
        } catch (error) {
            props.openAlertHandle("error", JSON.stringify(error));
        } finally {
            hideLoader()
        }
    }

    const insertConsumerDatabase = async () => {
        try {
            const resp = await singleConsumerSave(states, addStates, orgId);
            if (resp?.statusCode === 200) {
                props.openAlertHandle("success", "Your consumer will be registered within 24 hours : " + resp?.data);
            } else {
                props.openAlertHandle("error", JSON.stringify(resp?.data));
            }
        } catch (error) {
            props.openAlertHandle("error", JSON.stringify(error));

        }
    }

    const clearData = () => {
        setStates(initialState);
        setBillerName('')
        setStateName('')
        setBillerDetailsFields([])
        setIsError(false)
        setBillerNameListData([])
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

    // const handleChangeStateName = async (event) => {
    //     setStateName(event.target.value)
    //     billerNameRequest(billerCategory, event.target.value).then((data) => {
    //         if (data) {
    //             setBillerNameListData(data);
    //         }
    //     });
    // };

    React.useEffect(() => {
        getCategory()
    }, []);

    return (
        <>
            <Stack component="form" onSubmit={handleSubmit} flex={1}>
                <Box sx={{ m: 3 }} >
                    <FormControl>
                        <RadioGroup sx={{ flexDirection: "row", mb: 2 }} defaultValue="LT" name="ConsumerType" value={states.ConsumerType} onChange={onChangeHandle}  >
                            <FormControlLabel value="LT" control={<Radio />} label="Low Tension" />
                            <FormControlLabel value="HT" control={<Radio />} label="High Tension" />
                        </RadioGroup>
                    </FormControl>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4} >
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
                                    {billerCategoryListData && billerCategoryListData.length > 0 ? billerCategoryListData.map((val, index) => {
                                        return (<MenuItem key={index} value={val.Categoryname}>{val.Categoryname}</MenuItem>)
                                    }) : null
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} >
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
                                    {Array.isArray(stateList) ? stateList.sort((a, b) => a.stateName > b.stateName ? 1 : -1)?.map((val, index) => {
                                        return (<MenuItem key={`${index + 15}`} value={val?.stateName}>{val?.stateName}</MenuItem>)
                                    }) : null
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} >
                            <FormControl size="small" fullWidth>
                                <InputLabel id="singleBillerNameLabel">Select Biller Name</InputLabel>
                                <Select
                                    disabled={stateName ? false : true}
                                    required
                                    labelId="singleBillerNameLabel"
                                    id="singleBillerName"
                                    value={billerName}
                                    label="Select Biller Name"
                                    onChange={handleChangeBillerName}
                                >
                                    {billerNameListData.length > 0 ? billerNameListData.sort((a, b) => a.billerName > b.billerName ? 1 : -1).map((val, index) => {
                                        return (<MenuItem key={`${index + 15}`} value={val.billerId + '/' + val.billerName + '/' + val.alias + '/' + val.fetchType}>{val.billerName}</MenuItem>)
                                    }) : null
                                    }
                                </Select>
                            </FormControl>

                        </Grid>
                        <Grid item xs={2} sm={4} md={4} >
                            <TextField fullWidth required size='small' key={`uuid123987654`} label="Consumer Name" value={states.ConsumerName} name='ConsumerName' onChange={onChangeHandle} variant="outlined" />
                        </Grid>
                        <Grid item xs={2} sm={4} md={4} >
                            <TextField fullWidth inputProps={{ maxLength: 10 }} size='small' key={`uuid123987655`} label="Phone No" value={states.PhoneNumber} name='PhoneNumber' onChange={onChangeHandle} variant="outlined" />
                        </Grid>
                        {orgField && orgField.length > 0 ? orgField.map((field, index) => {

                            if (field?.typeTable == "Consumer") {
                                if (field?.fieldType === "char") {
                                    return <Grid item xs={2} key={index} sm={4} md={4} >
                                        <TextField
                                            required
                                            fullWidth
                                            size="small"
                                            id="outlined-basic"
                                            label={convertToTitleCase(field?.fieldName)}
                                            name={field.fieldName}
                                            onChange={(ele) => { onChangeAddHandle(field.fieldId, field?.fieldType, ele, index) }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                } else if (field?.fieldType === "date") {
                                    <Grid key={index} item xs={2} sm={4} md={4} p={1} >
                                        <DatePicker
                                            key={field?.fieldId}
                                            inputFormat="dd/MM/yyyy"
                                            label={convertToTitleCase(field?.fieldName)}
                                            name={field.fieldName}
                                            onChange={(ele) => { onChangeAddHandle(field.fieldId, field?.fieldType, ele, index) }}
                                            renderInput={(params) => <TextField fullWidth size='small' {...params} helperText={null} />}
                                        />
                                    </Grid>
                                }
                            }
                        }) : null}
                        {billerDetailsFields && billerDetailsFields.length > 0 ? billerDetailsFields.map((val, index) => {
                            return (
                                <Grid key={index} item xs={2} sm={4} md={4} >
                                    <TextField
                                        fullWidth
                                        error={isError}
                                        inputProps={{ maxLength: states.ConsumerType === "HT" ? null : val.ReqLength }}
                                        id="outlined-error-helper-text"
                                        helperText={isError ? `Please Enter valid Input` : val.ReqLength ? `Only ${val.ReqLength} character` : null}
                                        required
                                        size='small'
                                        key={index}
                                        label={val.BillerConsumerParam}
                                        onChange={(ele) => { handleDynamicFields(val.BillerConsumerParam, ele, index) }}
                                        variant="outlined" />
                                </Grid>
                            )
                        }) : null
                        }

                    </Grid>

                </Box>
                <Stack sx={{ m: 3 }} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {billerDetailsFields && billerDetailsFields.length > 0 && billerCategory === BILLER_CATEGORY ? <LoadingButton disabled={isError} loading={isLoading} type='submit' variant="contained">Submit</LoadingButton> : null}
                    <Button onClick={clearData} color='inherit' variant="contained">Clear</Button>
                </Stack>
            </Stack>

        </>

    );
}

export default memo(SingleConsumerRegistrationComponent)