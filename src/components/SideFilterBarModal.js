import * as React from 'react';

//** mui */
import { Drawer, List, ListItem, IconButton, Button, CardActions, Container, FormControl, InputLabel, MenuItem, Select, TextField, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

//** service */
import { billerNameRequest, billerNameStates } from '../utils/bbps/billerServices';

//** utils */
import { BILLER_CATEGORY, convertToTitleCase } from '../utils';
import { formatDate } from '../utils/dateFormat';

//** icon */
import { Close } from '@mui/icons-material';

//** redux */
import { useSelector } from 'react-redux';

const drawerWidth = 300;

const SideFilterBarModal = ({ open, onClose, filterBody, setFilterBody, clearFilterBodyState, setFinancialYear, financialYear, submitFilter }) => {
    const { orgField, payTypeList } = useSelector((state) => state.extra);

    const consumerTypeList = ["ALL", "LT", "HT"];

    const [billerNameListData, setBillerNameListData] = React.useState([]);
    const [stateList, setStateList] = React.useState([]);

    const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
    const onChangeSelectPayTypeHandle = async (e) => setFilterBody({ ...filterBody, "payType": e.target.value });
    const onChangeSelectConsumerTypeHandle = async (e) => setFilterBody({ ...filterBody, "ConsumerType": e.target.value });
    const handleChangeStateName = event => {
        setFilterBody({ ...filterBody, ["stateName"]: event.target.value })

    }
    const onChangeDate = (name, value) => setFilterBody({ ...filterBody, [name]: formatDate(value) });

    const handleChangeBillerName = (event) => {
        let billerNameCode = event.target.value.split('/');
        const biller = billerNameListData.find((e) => e.billerId == billerNameCode)
        setFilterBody({ ...filterBody, ["billerId"]: billerNameCode[0], ["billerName"]: biller?.billerName })
    };

    const getBillerName = async () => {
        await billerNameRequest(BILLER_CATEGORY, filterBody.stateName).then((resp) => {
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

    React.useEffect(() => {
        getBillerStatesList();
    }, [])

    React.useEffect(() => {
        getBillerName();
    }, [filterBody.stateName])



    return (
        <Drawer
            variant="temporary"
            anchor="right"
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                },
            }}
        >
            <div>
                <div>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </div>
                <Container component={"form"}>
                    <List>
                        <ListItem>
                            <DatePicker
                                views={["year"]}
                                maxDate={new Date()}
                                label="Choose Year"
                                value={financialYear}
                                onChange={(newValue) => setFinancialYear(newValue)}
                                renderInput={(params) => <TextField size='small' {...params} helperText={null} />}
                            />
                        </ListItem>
                        <ListItem>
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
                                    {
                                        payTypeList && payTypeList.length > 0 ? payTypeList.map((e, i) => {
                                            return < MenuItem key={i + e?.payType} value={e?.payType}>{e?.payType}</MenuItem>
                                        }) : null
                                    }
                                </Select>
                            </FormControl>
                        </ListItem>
                        <ListItem>
                            <FormControl fullWidth size="small" >
                                <InputLabel id="demo-simple-select-pay-consumer">Choose Consumer Type</InputLabel>
                                <Select
                                    labelId="demo-simple-select-pay-consumer"
                                    id="demo-simple-pay-consumer"
                                    value={filterBody.ConsumerType}
                                    label="Choose Consumer Type"
                                    name='ConsumerType'
                                    onChange={onChangeSelectConsumerTypeHandle}
                                >
                                    {consumerTypeList && consumerTypeList.length > 0 ? consumerTypeList.map((e, i) => {
                                        return <MenuItem key={i + e} value={e}>{e}</MenuItem>
                                    }) : null}
                                </Select>
                            </FormControl>
                        </ListItem>
                        <ListItem>
                            <FormControl size="small" fullWidth>
                                <InputLabel id="singleBillerNameLabel">Select State</InputLabel>
                                <Select
                                    required
                                    labelId="singleBillerNameLabel"
                                    id="singleBillerName"
                                    value={filterBody?.stateName}
                                    label="Select State"
                                    onChange={handleChangeStateName}
                                >
                                    {stateList?.length > 0 ? stateList.map((val, index) => {
                                        return (<MenuItem key={index} value={val.stateName}>{val.stateName}</MenuItem>)
                                    }) : null
                                    }
                                </Select>
                            </FormControl>
                        </ListItem>
                        <ListItem>
                            <FormControl size="small" fullWidth>
                                <InputLabel id="singleBillerNameLabel">Select Biller Name</InputLabel>
                                <Select
                                    disabled={filterBody?.stateName ? false : true}
                                    required
                                    labelId="singleBillerNameLabel"
                                    id="singleBillerName"
                                    value={filterBody?.billerId}
                                    label="Select Biller Name"
                                    onChange={handleChangeBillerName}
                                >
                                    {billerNameListData?.length > 0 ? billerNameListData?.map((val, index) => {
                                        return (<MenuItem key={val.billerId + index} value={val.billerId}>{val.billerName}</MenuItem>)
                                    }) : null
                                    }
                                </Select>
                            </FormControl>
                        </ListItem>
                        <ListItem>
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                maxDate={new Date()}
                                label="Client Paid Date From"
                                name='paymentDateFrom'
                                value={filterBody?.paymentDateFrom}
                                onChange={(e) => onChangeDate("paymentDateFrom", e)}
                                renderInput={(params) => <TextField fullWidth size='small' {...params} helperText={null} />}
                            />
                        </ListItem>
                        <ListItem>
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                maxDate={new Date()}
                                label="Client Paid Date To"
                                name='paymentDateTo'
                                value={filterBody?.paymentDateTo}
                                onChange={(e) => onChangeDate("paymentDateTo", e)}
                                renderInput={(params) => <TextField fullWidth size='small' {...params} helperText={null} />}
                            />
                        </ListItem>
                        <ListItem>
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                maxDate={new Date()}
                                label="B2P Paid Date From"
                                name='transactionDateFrom'
                                value={filterBody?.transactionDateFrom}
                                onChange={(e) => onChangeDate("transactionDateFrom", e)}
                                renderInput={(params) => <TextField fullWidth size='small' {...params} helperText={null} />}
                            />
                        </ListItem>
                        <ListItem>
                            <DatePicker
                                inputFormat="dd/MM/yyyy"
                                maxDate={new Date()}
                                label="B2P Paid Date To"
                                name='transactionDateTo'
                                value={filterBody?.transactionDateTo}
                                onChange={(e) => onChangeDate("transactionDateTo", e)}
                                renderInput={(params) => <TextField fullWidth size='small' {...params} helperText={null} />}
                            />
                        </ListItem>
                        {orgField && orgField.length > 0 ? orgField.map((field, index) => {
                            if (field?.filterFlag === 1) {
                                if (field?.fieldType === "char") {
                                    return <ListItem key={index}>
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
                                    </ListItem>
                                }
                            }
                        }) : null
                        }
                    </List>
                    <CardActions>
                        <Button onClick={submitFilter} variant="contained">Search</Button>
                        <Button type='reset' color='inherit' onClick={clearFilterBodyState} variant="contained">Clear</Button>
                    </CardActions>
                </Container>
            </div>
        </Drawer>
    );
};

export default SideFilterBarModal;
