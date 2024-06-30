import React from 'react'

//** mui */
import { Card, Tab } from '@mui/material';

//** component */
import { DashboardLayoutAdmin } from '../../components/dashboard-layout-admin';
import Head from 'next/head';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TransactionStatement from '../../components/balanceStatementTab/TransactionStatement';
import PrepaidBalanceTab from '../../components/balanceStatementTab/PrepaidBalanceTab';

const BalanceStatement = () => {
    const [uploadTabValue, setUploadTabValue] = React.useState("0");
    const handleChangeUploadTab = (event, newValue) => {
        setUploadTabValue(newValue)
    };

    return (
        <>
            <Head>
                <title>
                    Statement
                </title>
            </Head>
            <TabContext value={uploadTabValue}>
                <Card sx={{ mx: 3, mt: 2 }}>
                    <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeUploadTab} >
                        <Tab label={`Transaction Statement`} value="0" />
                        <Tab label={`Prepaid Balance`} value="1" />
                    </TabList>
                </Card>
                <TabPanel value="0" >
                    <TransactionStatement />
                </TabPanel>
                <TabPanel value="1" >
                    <PrepaidBalanceTab />
                </TabPanel>
            </TabContext>
        </>
    )
}

BalanceStatement.getLayout = (page) => (
    <DashboardLayoutAdmin>
        {page}
    </DashboardLayoutAdmin>
);

export default BalanceStatement