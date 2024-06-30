import React, { useEffect } from 'react';

//** mui */
import { Box, Button, Card, Chip, Container, Grid, IconButton, Stack, Typography } from '@mui/material';

//** component */
import { TrafficByDevice } from './dashboard/traffic-by-device';
import SideFilterBarModal from './SideFilterBarModal';
import { ConsumptionCard } from './ConsumptionCard';
import { Sales } from './dashboard/sales';
import { AmountCard } from './AmountCard';

//** redux */
import { useSelector } from 'react-redux';

//** icon */
import { AccountBalanceWalletOutlined, ClearAll, ExplicitOutlined, SegmentOutlined, Today, VisibilityOff } from '@mui/icons-material';
import { RiFilterOffFill, RiFilterFill } from "react-icons/ri";

//** utils */
import { getMonthAndYear, getPreviousMonthFirstAndLastDay, getThisMonthFirstAndLastDay, getThisYearFirstAndLastDay } from '../utils/dateFormat';
import { convertToTitleCase } from '../utils';

//** hook */
import { useLoader } from '../Provider/LoaderContext';
import { dashboardFilter } from '../utils/bbps/billerServices';



const DashboardData = ({ hideDashboard }) => {

    //** redux */
    const { orgId } = useSelector((state) => state.user);
    const { showLoader, hideLoader } = useLoader();

    const initiateFilterBody = {
        "billerId": null,
        "billerName": null,
        "stateName": "ALL",
        "paymentDateFrom": null,
        "paymentDateTo": null,
        "transactionDateFrom": null,
        "transactionDateTo": null,
        "orgId": orgId,
        "payStatus": "ALL",
        "ConsumerType": "ALL",
        "payType": "ALL"
    }

    const [filterBody, setFilterBody] = React.useState(initiateFilterBody);
    const [lastMonthData, setLastMonthData] = React.useState([]);
    const [thisMonthData, setThisMonthData] = React.useState([]);
    const [thisMonthBillStatus, setThisMonthBillStatus] = React.useState([]);
    const [consumerCount, setConsumerCount] = React.useState([]);
    const [financialYear, setFinancialYear] = React.useState(new Date());
    const [customAmount, setCustomPaidAmount] = React.useState(0);
    const [customAdminAmount, setCustomAdminPaidAmount] = React.useState(0);
    const [customConsumption, setCustomConsumption] = React.useState(0);
    const [openFilterModal, setOpenFilterModal] = React.useState(false);
    const [clearFlag, setClearFlag] = React.useState(false);

    const handleOpenFilterModal = () => {
        setOpenFilterModal(true);
    };

    const handleCloseFilterModal = () => {
        setOpenFilterModal(false);
    };


    const [thisMonthPaidAmount, setThisMonthPaidAmount] = React.useState(0)
    const [lastMonthPaidAmount, setLastMonthPaidAmount] = React.useState(0)
    const [totalAmount, setTotalAmount] = React.useState(0);

    const [thisMonthConsumption, setThisMonthConsumption] = React.useState(0)
    const [lastMonthConsumption, setLastMonthConsumption] = React.useState(0)
    const [totalConsumption, setTotalConsumption] = React.useState(0);

    const [thisMonthAdminPaidAmount, setThisMonthAdminPaidAmount] = React.useState(0)
    const [lastMonthAdminPaidAmount, setLastMonthAdminPaidAmount] = React.useState(0)
    const [totalAdminAmount, setTotalAdminAmount] = React.useState(0);
    const [todayAdminPaidAmount, setTodayAdminPaidAmount] = React.useState(0)

    const [todayPaidAmount, setTodayPaidAmount] = React.useState(0)
    const [todayConsumption, setTodayConsumption] = React.useState(0)

    const getMonthHistory = async () => {

        const previousMonth = getPreviousMonthFirstAndLastDay();
        const thisMonth = getThisMonthFirstAndLastDay();

        const body = {
            "type": "MonthHistory",
            "data": {
                "BillerCode": filterBody?.billerId,
                "from": thisMonth.firstDay,
                "to": thisMonth.lastDay,
                "lastFrom": previousMonth.firstDay,
                "lastTo": previousMonth.lastDay,
                "orgId": orgId,
                "monthYear": getMonthAndYear()
            }
        };

        const resp = await dashboardFilter(body);
        return resp;
    };

    const getConsumerCount = async () => {

        const initialValue = {
            "type": "ConsumerCount",
            "data": filterBody
        }
        const resp = await dashboardFilter(initialValue);
        return resp;
    };


    const getFilterDataChip = () => Object.entries(filterBody).filter(([key, value]) => value != null && value != "ALL" && value != orgId);

    const getAmountCustomDate = async () => {
        if (filterBody.paymentDateFrom && filterBody.paymentDateTo) {

            const newFilterData = { ...filterBody, "type": "CLIENT" }

            const body = {
                "type": "RangeHistory",
                "data": newFilterData
            }
            const data = await dashboardFilter(body);
            return data;
        } else {
            setCustomPaidAmount(0);
            setCustomAdminPaidAmount(0);
        }

    };

    const getTotalPaidAmount = async () => {
        const { firstDay, lastDay } = getThisYearFirstAndLastDay(financialYear);

        const newFilterData = { ...filterBody, "paymentDateFrom": firstDay, "paymentDateTo": lastDay, "type": "CLIENT" }

        const body = {
            "type": "RangeHistory",
            "data": newFilterData
        }
        const data = await dashboardFilter(body);
        return data;
    };

    const getLastMonthPaidAmount = async () => {
        const { firstDay, lastDay } = getPreviousMonthFirstAndLastDay();

        const newFilterData = { ...filterBody, "paymentDateFrom": firstDay, "paymentDateTo": lastDay, "type": "CLIENT" }
        const body = {
            "type": "RangeHistory",
            "data": newFilterData
        }

        const data = await dashboardFilter(body);
        return data
    };

    const getThisMonthPaidAmount = async () => {
        const { firstDay, lastDay } = getThisMonthFirstAndLastDay();
        const newFilterData = { ...filterBody, "paymentDateFrom": firstDay, "paymentDateTo": lastDay, "type": "CLIENT" }

        const body =
        {
            "type": "RangeHistory",
            "data": newFilterData
        }
        const data = await dashboardFilter(body);
        return data

    };

    const getTodayPaidAmount = async () => {

        const todayDate = new Date().toISOString().split("T")[0];

        const newFilterData = { ...filterBody, "paymentDateFrom": todayDate, "paymentDateTo": todayDate, "type": "CLIENT" }

        const body = {
            "type": "RangeHistory",
            "data": newFilterData
        }
        const data = await dashboardFilter(body);
        return data
    };

    const getAdminTotalPaidAmount = async () => {
        const { firstDay, lastDay } = getThisYearFirstAndLastDay(financialYear);

        const newFilterData = { ...filterBody, "transactionDateFrom": firstDay, "transactionDateTo": lastDay, "type": "ADMIN" }

        const body = {
            "type": "RangeHistory",
            "data": newFilterData
        }
        const data = await dashboardFilter(body);
        return data;
    };

    const getAdminLastMonthPaidAmount = async () => {
        const { firstDay, lastDay } = getPreviousMonthFirstAndLastDay();

        const newFilterData = { ...filterBody, "transactionDateFrom": firstDay, "transactionDateTo": lastDay, "type": "ADMIN" }

        const body = {
            "type": "RangeHistory",
            "data": newFilterData
        }

        const data = await dashboardFilter(body);
        return data
    };

    const getAdminThisMonthPaidAmount = async () => {
        const { firstDay, lastDay } = getThisMonthFirstAndLastDay();
        const newFilterData = { ...filterBody, "transactionDateFrom": firstDay, "transactionDateTo": lastDay, "type": "ADMIN" }

        const body =
        {
            "type": "RangeHistory",
            "data": newFilterData
        }
        const data = await dashboardFilter(body);
        return data

    };

    const getAdminTodayPaidAmount = async () => {

        const todayDate = new Date().toISOString().split("T")[0];

        const newFilterData = { ...filterBody, "transactionDateFrom": todayDate, "transactionDateTo": todayDate, "type": "ADMIN" }

        const body = {
            "type": "RangeHistory",
            "data": newFilterData
        }
        const data = await dashboardFilter(body);
        return data
    };

    const getAdminAmountCustomDate = async () => {
        if (filterBody.transactionDateFrom && filterBody.transactionDateTo) {

            const newFilterData = { ...filterBody, "type": "ADMIN" }

            const body = {
                "type": "RangeHistory",
                "data": newFilterData
            }
            const data = await dashboardFilter(body);
            return data;
        } else {
            setCustomPaidAmount(0);
            setCustomAdminPaidAmount(0);
        }

    };

    const getDashboardReports = async () => {
        const body = {
            "type": "DashboardReports",
            "data": { orgId: filterBody.orgId }
        }
        const data = await dashboardFilter(body);
        return data
    };

    const fetchPaymentInitialData = async () => {
        showLoader()
        try {

            const [
                reports,
                customPaid,
                customPaidAdmin,
                conCount,
                monthHistory
            ] = await Promise.all([
                getDashboardReports(),
                getAmountCustomDate(),
                getAdminAmountCustomDate(),
                getConsumerCount(),
                getMonthHistory(),
            ]);

            //current month paid amount & consumption
            setThisMonthPaidAmount(reports?.ClientCurrAmount)
            setThisMonthConsumption(reports?.CurrConsumption);
            //previous month paid amount & consumption
            setLastMonthPaidAmount(reports?.ClientPrevAmount)
            setLastMonthConsumption(reports?.PrevConsumption);
            //today paid amount & consumption
            setTodayPaidAmount(reports?.ClientTodaysAmount)
            setTodayConsumption(reports?.TodaysConsumption)
            //total paid amount & consumption
            setTotalAmount(reports?.ClientYearlyAmount)
            setTotalConsumption(reports?.YearlyConsumption)

            //custom paid amount 
            setCustomPaidAmount(customPaid?.clientPaidAmount);
            setCustomConsumption(customPaid?.totalConsumption);
            setCustomAdminPaidAmount(customPaidAdmin?.adminPaidAmount);
            setCustomAdminPaidAmount(customPaidAdmin?.adminPaidAmount);

            // count of consumer
            setConsumerCount(conCount)

            // month history
            setThisMonthBillStatus(monthHistory?.thisMonthBillStatus);
            setLastMonthData(monthHistory?.lastMonthData);
            setThisMonthData(monthHistory?.thisMonthData);

            setThisMonthAdminPaidAmount(reports?.AdminCurrAmount)
            setLastMonthAdminPaidAmount(reports?.AdminPrevAmount)
            setTodayAdminPaidAmount(reports?.AdminTodaysAmount)
            setTotalAdminAmount(reports?.AdminYearlyAmount)

        } catch (error) {
            console.error('Error fetching payment data:', error);

            // current month paid amount & consumption
            setThisMonthPaidAmount(0)
            setThisMonthAdminPaidAmount(0)
            setThisMonthConsumption(0);

            //previous month paid amount & consumption
            setLastMonthPaidAmount(0)
            setLastMonthAdminPaidAmount(0)
            setLastMonthConsumption(0);

            //today paid amount & consumption
            setTodayPaidAmount(0)
            setTodayAdminPaidAmount(0)
            setTodayConsumption(0)

            //total paid amount & consumption
            setTotalAmount(0);
            setTotalAdminAmount(0);
            setTotalConsumption(0);

            //custom paid amount & consumption
            setCustomPaidAmount(0);
            setCustomAdminPaidAmount(0);
            setCustomConsumption(0);

            // month history
            setThisMonthBillStatus([]);
            setLastMonthData([]);
            setThisMonthData([]);
        } finally {
            hideLoader();
            handleCloseFilterModal()
        }
    }

    const fetchPaymentData = async () => {
        showLoader()
        try {

            const [
                customPaid,
                customPaidAdmin,
                conCount,
                monthHistory
            ] = await Promise.all([
                getAmountCustomDate(),
                getAdminAmountCustomDate(),
                getConsumerCount(),
                getMonthHistory(),
            ]);

            //custom paid amount
            setCustomPaidAmount(customPaid?.clientPaidAmount);
            setCustomConsumption(customPaid?.totalConsumption);
            setCustomAdminPaidAmount(customPaidAdmin?.adminPaidAmount);

            // count of consumer
            setConsumerCount(conCount)

            // month history
            setThisMonthBillStatus(monthHistory?.thisMonthBillStatus);
            setLastMonthData(monthHistory?.lastMonthData);
            setThisMonthData(monthHistory?.thisMonthData);
        } catch (error) {
            console.error('Error fetching payment data:', error);

            //custom paid amount & consumption
            setCustomPaidAmount(0);
            setCustomAdminPaidAmount(0);
            setCustomConsumption(0);

        } finally {
            hideLoader();
            handleCloseFilterModal()
        }
    }

    useEffect(() => {
        fetchPaymentInitialData();
    }, [])

    const clearFilterBodyState = () => {
        setFinancialYear(new Date())
        setFilterBody(initiateFilterBody);
        setClearFlag(!clearFlag)
        handleCloseFilterModal()
    }

    const isFilterActive = JSON.stringify(initiateFilterBody) !== JSON.stringify(filterBody)

    const consumerStatus = {
        "0": "InActive",
        "1": "Active",
        "2": "Non-Fetch"
    }
    return (
        <>
            <Container maxWidth={false}>
                <Grid container item spacing={3} >
                    <Grid item lg={12} md={12} xl={12} xs={12} >
                        <Stack spacing={3} marginBottom={2}>
                            <Card sx={{ flex: 1, p: 2, }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3} >
                                    {consumerCount && consumerCount.length > 0 ?
                                        consumerCount?.map((consumer) => (<Typography key={consumer.Active} variant="overline" >No. of {consumerStatus[consumer.Active]} Consumers: {consumer.Count} </Typography>))
                                        : <Typography variant="overline">
                                            Consumer not found
                                        </Typography>}
                                    <Button
                                        onClick={handleOpenFilterModal}
                                        endIcon={isFilterActive ? <RiFilterFill color='#2196F3' /> : <RiFilterOffFill />}
                                    >
                                        Filter
                                    </Button>
                                    {
                                        isFilterActive ?
                                            <Button
                                                onClick={clearFilterBodyState}
                                                endIcon={<ClearAll sx={{ color: "#2196F3" }} />}
                                            >
                                                Clear
                                            </Button>
                                            : null
                                    }
                                    <IconButton onClick={hideDashboard}   >
                                        <VisibilityOff sx={{ color: "#2196F3" }} />
                                    </IconButton>
                                </Stack>
                            </Card>
                        </Stack>

                        <Grid container marginBottom={2} spacing={{ xs: 2, sm: 2, md: 2, }} columns={{ xs: 2, sm: 8, md: 16 }} >
                            {getFilterDataChip().map(([key, value]) => <Chip sx={{ margin: 2 }} key={key} label={`${convertToTitleCase(key)}: ${value}`} />)}
                        </Grid>
                        <Stack marginBottom={2} direction={{ xs: 'column', sm: 'row' }} justifyContent='start' alignItems='center' spacing={3}>
                            {filterBody.paymentDateFrom && filterBody.paymentDateTo ? <AmountCard amount={customAmount} title={`Client Paid amount (${filterBody.paymentDateFrom} to ${filterBody.paymentDateTo})`} iconColor={"#d3eafd"} icon={<ExplicitOutlined sx={{ color: "info.main" }} />} /> : null}
                            {filterBody.transactionDateFrom && filterBody.transactionDateTo ? <AmountCard amount={customAdminAmount} title={`Admin Paid amount (${filterBody.transactionDateFrom} to ${filterBody.transactionDateTo})`} iconColor={"#d3eafd"} icon={<ExplicitOutlined sx={{ color: "info.main" }} />} /> : null}
                        </Stack>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }} >
                                <Typography variant="h6" component="div">
                                    CLIENT PAID AMOUNT
                                </Typography>
                            </Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='start' alignItems='center' spacing={3}>
                                <AmountCard amount={totalAmount} title={`${financialYear.getFullYear()}-${financialYear.getFullYear() + 1} `} iconColor={"#d3eafd"} icon={<SegmentOutlined sx={{ color: "#2196F3" }} />} />
                                <AmountCard amount={lastMonthPaidAmount} title='Previous Month' iconColor={"#d3eafd"} icon={<AccountBalanceWalletOutlined sx={{ color: "#2196F3" }} />} />
                                <AmountCard amount={thisMonthPaidAmount} title='Current Month' iconColor={"#d3eafd"} icon={<ExplicitOutlined sx={{ color: "#2196F3" }} />} />
                                <AmountCard amount={todayPaidAmount} title='Today' iconColor={"#d3eafd"} icon={<Today sx={{ color: "#2196F3" }} />} />
                            </Stack>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }} >
                                <Typography variant="h6" component="div">
                                    ADMIN PAID AMOUNT
                                </Typography>
                            </Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='start' alignItems='center' spacing={3}>
                                <AmountCard amount={totalAdminAmount} title={`${financialYear.getFullYear()}-${financialYear.getFullYear() + 1} `} iconColor={"#d3eafd"} icon={<SegmentOutlined sx={{ color: "#2196F3", }} />} />
                                <AmountCard amount={lastMonthAdminPaidAmount} title='Previous Month' iconColor={"#d3eafd"} icon={<AccountBalanceWalletOutlined sx={{ color: "#2196F3" }} />} />
                                <AmountCard amount={thisMonthAdminPaidAmount} title='Current Month' iconColor={"#d3eafd"} icon={<ExplicitOutlined sx={{ color: "#2196F3" }} />} />
                                <AmountCard amount={todayAdminPaidAmount} title='Today' iconColor={"#d3eafd"} icon={<Today sx={{ color: "#2196F3" }} />} />
                            </Stack>
                            {/* {
                                role === "admin" ?
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }} >
                                            <Typography variant="h6" component="div">
                                                ADMIN PAID AMOUNT
                                            </Typography>
                                        </Box>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='start' alignItems='center' spacing={3}>
                                            <AmountCard amount={totalAdminAmount} title={`${financialYear.getFullYear()}-${financialYear.getFullYear() + 1} `} iconColor={"#d3eafd"} icon={<SegmentOutlined sx={{ color: "#2196F3", }} />} />
                                            <AmountCard amount={lastMonthAdminPaidAmount} title='Previous Month' iconColor={"#d3eafd"} icon={<AccountBalanceWalletOutlined sx={{ color: "#2196F3" }} />} />
                                            <AmountCard amount={thisMonthAdminPaidAmount} title='Current Month' iconColor={"#d3eafd"} icon={<ExplicitOutlined sx={{ color: "#2196F3" }} />} />
                                            <AmountCard amount={todayAdminPaidAmount} title='Today' iconColor={"#d3eafd"} icon={<Today sx={{ color: "#2196F3" }} />} />
                                        </Stack>
                                    </> : null
                            } */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', }} >
                                <Typography variant="h6" component="div">
                                    CONSUMPTION
                                </Typography>
                            </Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='start' alignItems='center' spacing={3}>
                                <ConsumptionCard unit={totalConsumption} title={`${financialYear.getFullYear()}-${financialYear.getFullYear() + 1} `} iconColor={"#d3eafd"} icon={<SegmentOutlined sx={{ color: "#2196F3", }} />} />
                                <ConsumptionCard unit={lastMonthConsumption} title='Previous Month' iconColor={"#d3eafd"} icon={<AccountBalanceWalletOutlined sx={{ color: "#2196F3" }} />} />
                                <ConsumptionCard unit={thisMonthConsumption} title='Current Month' iconColor={"#d3eafd"} icon={<ExplicitOutlined sx={{ color: "#2196F3" }} />} />
                                <ConsumptionCard unit={todayConsumption} title='Today' iconColor={"#d3eafd"} icon={<Today sx={{ color: "#2196F3" }} />} />
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item lg={8} md={12} xl={9} xs={12}>
                        {lastMonthData?.length > 0 || thisMonthData?.length > 0 ? <Sales lastMonthData={lastMonthData} thisMonthData={thisMonthData} /> : null}
                    </Grid>
                    <Grid item lg={4} md={6} xl={3} xs={12} >
                        {thisMonthBillStatus && thisMonthBillStatus?.length > 0 ? <TrafficByDevice thisMonthBillStatus={thisMonthBillStatus} /> : null}
                    </Grid>
                </Grid>
                {
                    openFilterModal ?
                        <SideFilterBarModal submitFilter={fetchPaymentData} financialYear={financialYear} setFinancialYear={setFinancialYear} clearFilterBodyState={clearFilterBodyState} filterBody={filterBody} setFilterBody={setFilterBody} open={openFilterModal} onClose={handleCloseFilterModal} /> : null
                }
            </Container>
        </>
    );
}



export default DashboardData;