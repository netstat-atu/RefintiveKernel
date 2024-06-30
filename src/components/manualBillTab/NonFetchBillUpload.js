import * as React from 'react';

//** mui */
import { Box, Card, FormControl, InputLabel, Select, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Grid, Paper } from '@mui/material';
import { LoadingButton } from '@mui/lab';

//** icon */
//** service */
import { getOtherBill } from '../../utils/bbps/billerServices';

//** npm */
import { useDispatch, useSelector } from 'react-redux';

//** utils */
import { ddmmyy, getMonthAndYear } from '../../utils/dateFormat';
import { isEmpty, amountFormat } from '../../utils';

//** redux */
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { useLoader } from '../../Provider/LoaderContext';
import StyledTableRow from '../StyledTableRow';

const NonFetchBillUpload = () => {
    const { showLoader, hideLoader, isLoading } = useLoader();

    const { orgId, userId } = useSelector((state) => state.user);
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
        "billStatus": 1
    }

    //** state */
    const [isError, setIsError] = React.useState(false)
    const [billerCategory, setBillerCategory] = React.useState('');
    const [billerName, setBillerName] = React.useState('');
    const [filterBody, setFilterBody] = React.useState(initialFilterBody);
    const [billerDetailsFields, setBillerDetailsFields] = React.useState([]);
    const [states, setStates] = React.useState({});
    const [billerNameListData, setBillerNameListData] = React.useState([
        {
            billerId: "GJ",
            billerCode: "TORR00000AHM02",
            billerName: "Torrent Power - Ahmedabad",
            region: "AHD"
        },
        {
            billerId: "GJ",
            billerCode: "TORR00000SUR04",
            billerName: "Torrent Power - Surat",
            region: "SRT"
        },
        {
            billerId: "GJ",
            billerCode: "TORR00000AGR01",
            billerName: "Torrent Power - Agra",
            region: "AGR"
        },
        {
            billerId: "GJ",
            billerCode: "TORR00000BHW03",
            billerName: "Torrent Power - Bhiwandi",
            region: "BHW"
        },
        {
            billerId: "AP",
            billerCode: "CPDCLOB00ANP01",
            billerName: "Andhra Pardesh - Central",
            region: "central"
        },
        {
            billerId: "AP",
            billerCode: "EPDCLOB00ANP01",
            billerName: "Andhra Pardesh - Eastern",
            region: "eastern"
        },
        {
            billerId: "AP",
            billerCode: "SPDCLOB00ANP01",
            billerName: "Andhra Pardesh - Southern",
            region: "southern"
        },
        {
            billerId: "TG",
            billerCode: "TSSPDCL000TS02",
            billerName: "Telanagana - Southern",
            region: "southern"

        },
        {
            billerId: "TG",
            billerCode: "TSNPDCL000TS01",
            billerName: "Telanagana - Northern",
            region: "northern"

        },
        {
            billerId: "TG",
            billerCode: "",
            billerName: "Telanagana - Eastern",
            region: "eastern"

        },

    ]);
    const [billDetails, setBillDetails] = React.useState(null);
    const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }));

    const handleChangeBillerName = (event) => {
        setBillDetails(null)
        let billerNameCode = event.target.value.split('/');
        const billerId = billerNameCode[0];
        const region = billerNameCode[1];
        const billerCode = billerNameCode[2];
        setFilterBody({ ...filterBody, "BillerId": billerCode })
        setBillerName(event.target.value);
        setStates({ ...states, billerId: billerId, region: region });
        setBillerDetailsFields([{ "BillerConsumerParam": "Service No" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        showLoader()

        await getOtherBill(states).then((res) => {
            if (res.statusCode == 200) {
                const isEmpty = Object.keys(res?.body).length === 0;
                if (!isEmpty) {
                    const { serviceNo } = res?.body;
                    if (serviceNo != "") {
                        setBillDetails(res?.body);
                        openAlertHandle("success", "Successfully Bill Fetch Complete");
                    } else {
                        openAlertHandle("error", "Service Number Not Available");

                    }
                } else {
                    openAlertHandle("error", "Bill Not Available");
                }
            } else {
                openAlertHandle("error", "Bill Not Available");
            }
        }).catch(error => {
            console.log("🚀 ~ file: NonFetchBillUpload.js:160 ~ await getOtherBill ~ error:", error);
        }).finally(() => {
            hideLoader()
            e.target.reset()
            clearData()
        })

    }
    const clearData = () => {
        setStates({});
        setBillerCategory('')
        setBillerName('')
        setBillerDetailsFields([])
    }
    const handleDynamicFields = (event) => {
        const serviceNo = event.target.value
        setStates({ ...states, serviceNo: serviceNo });
    }

    return (
        <Stack spacing={3}>
            <Card component="form" onSubmit={handleSubmit}>
                <Stack>
                    <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
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
                                        return (<MenuItem key={`${index}`} value={val.billerId + '/' + val.region + "/" + val.billerCode}>{val.billerName}</MenuItem>)
                                    }) : null
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        {billerDetailsFields && billerDetailsFields.length > 0 ? billerDetailsFields.map((val, index) => {
                            return (
                                <Grid key={index} item xs={2} sm={4} md={4} p={1} >
                                    <TextField id="outlined-error-helper-text" required size='small' key={index} label={val.BillerConsumerParam} onChange={(ele) => { handleDynamicFields(ele) }} variant="outlined" />
                                </Grid>
                            )
                        }) : null
                        }
                    </Grid>
                    <Box p={1}>
                        {billerDetailsFields && billerDetailsFields.length > 0 && <LoadingButton disabled={isError} loading={isLoading} type='submit' variant="contained">Proceed</LoadingButton>}
                    </Box>
                </Stack>
            </Card>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {billDetails != null &&
                    <Table sx={{ minWidth: 650, mt: 2 }} size="medium" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Service No</TableCell>
                                <TableCell align="center">Consumer Name</TableCell>
                                <TableCell align="center">Amount</TableCell>
                                <TableCell align="center">Bill Creation Date</TableCell>
                                <TableCell align="center">Due Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <StyledTableRow key={billDetails?.billerId} sx={{ '&:last-child td, &:last-child th': { border: 0, } }} >
                                <TableCell align="center">{isEmpty(billDetails.consumerNumber)}</TableCell>
                                <TableCell align="center">{isEmpty(billDetails.billConName)}</TableCell>
                                <TableCell align="center">{amountFormat(billDetails.amount)}</TableCell>
                                <TableCell align="center">{ddmmyy(new Date(billDetails.billDate))}</TableCell>
                                <TableCell align="center">{ddmmyy(new Date(billDetails.billDueDate))}</TableCell>
                            </StyledTableRow>
                        </TableBody>
                    </Table>
                }
            </Paper>
        </Stack>
    )
}



export default NonFetchBillUpload;