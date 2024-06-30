import React from 'react'

//** mui */
import { Card, Tab } from '@mui/material';

//** utils */
import { TabContext, TabList, TabPanel } from '@mui/lab';

//** component */
import AmountAverageTab from '../averageTab/AmountAverageTab';
import ConsumptionAverageTab from '../averageTab/ConsumptionAverageTab';

const BillAverageTable = () => {
  const [autoPaymentTabValue, setAutoPaymentTabValue] = React.useState("0");
  const handleChangeUploadTab = (event, newValue) => setAutoPaymentTabValue(newValue);
  return (
    <>
      <TabContext value={autoPaymentTabValue}>
        <Card>
          <TabList variant="scrollable" allowScrollButtonsMobile onChange={handleChangeUploadTab} >
            <Tab label={`Amount Average`} value="0" />
            <Tab label={`Consumption Average`} value="1" />
          </TabList>
        </Card>
        <TabPanel sx={{ p: 0 }} value="0" >
          <AmountAverageTab />
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value="1" >
          <ConsumptionAverageTab />
        </TabPanel>
      </TabContext>
    </>
  )
}

export default BillAverageTable;