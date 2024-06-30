import React from 'react';
//** mui */
import { Box, Card, CardContent, CardHeader, Divider, Typography, useTheme } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';

//** icon */
import { Money, UnpublishedSharp } from '@mui/icons-material';

//** npm */
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export const TrafficByDevice = ({ thisMonthBillStatus }) => {
  const [billPaidPercentage, setBillPaidPercentage] = React.useState(0)
  const [billPendingPercentage, setBillPendingPercentage] = React.useState(0)
  const [billPaidLabelPercentage, setBillPaidLabelPercentage] = React.useState('')
  const [billPendingLabelPercentage, setBillPendingLabelPercentage] = React.useState('')

  const getThisMonthPaidAmount = async () => {
    const data = await getPercentageByFilter();
    setBillPaidPercentage(data?.paidBillPercentage)
    setBillPendingPercentage(data?.pendingBillPercentage)
    setBillPaidLabelPercentage(data?.paidLabelBillPercentage)
    setBillPendingLabelPercentage(data?.pendingLabelBillPercentage)
  }
  const getPercentageByFilter = async () => {
    try {
      if (thisMonthBillStatus && thisMonthBillStatus?.length > 0) {

        let totalBill = 0;
        for (let index = 0; index < thisMonthBillStatus.length; index++) {
          totalBill += thisMonthBillStatus[index]?.Count ?? 0;
        }
        const paidBill = thisMonthBillStatus.find(e => e.Status === "Paid")?.Count ?? 0;
        const notFetchBill = thisMonthBillStatus.find(e => e.Status === "Bill Not Fetched")?.Count ?? 0;
        const inProcessBill = thisMonthBillStatus.find(e => e.Status === "In Process")?.Count ?? 0;
        const pendingBill = inProcessBill + notFetchBill;

        const paidBillPercentage = (paidBill / totalBill) * 100;
        const pendingBillPercentage = (pendingBill / totalBill) * 100;

        return {
          paidBillPercentage: paidBillPercentage.toFixed(2),
          pendingBillPercentage: pendingBillPercentage.toFixed(2),
          pendingLabelBillPercentage: pendingBill,
          paidLabelBillPercentage: paidBill,

        }

      } else {
        return {
          paidBillPercentage: 0,
          pendingBillPercentage: 0,
          pendingLabelBillPercentage: "",
          paidLabelBillPercentage: "",

        }

      }
    } catch (error) {
      console.log(error);
      return {
        paidBillPercentage: 0,
        pendingBillPercentage: 0,
        pendingLabelBillPercentage: "",
        paidLabelBillPercentage: "",

      }
    }

  }

  const data = {
    datasets: [
      {
        data: [billPaidPercentage, billPendingPercentage],
        backgroundColor: ['#2D87BB', '#EC6B56'],
        borderWidth: 8,
        borderColor: '#FFFFFF',
        hoverBorderColor: '#FFFFFF'
      }
    ],
    labels: ['Bill Paid : ' + billPaidLabelPercentage + " ", 'Bill Pending : ' + billPendingLabelPercentage + " "]
  };


  const devices = [
    {
      title: 'Bill Paid',
      value: billPaidPercentage,
      icon: Money,
      color: '#2D87BB'
    },
    {
      title: 'Bill Pending',
      value: billPendingPercentage,
      icon: UnpublishedSharp,
      color: '#EC6B56'
    }
  ];

  React.useEffect(() => {
    getThisMonthPaidAmount()
  }, [thisMonthBillStatus])

  return (
    <Card>
      <CardHeader title="Bills Paid For This Month" />
      <Divider />
      <CardContent>
        <Box
          sx={{
            // height: 240,
            position: 'relative'
          }}
        >
          <Doughnut
            data={data}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 2
          }}
        >
          {devices.map(({
            color,
            icon: Icon,
            title,
            value
          }) => (
            <Box
              key={title}
              sx={{
                p: 1,
                textAlign: 'center'
              }}
            >
              {/* <Icon color="action" /> */}
              <Typography
                color="textPrimary"
                variant='subtitle1'
              >
                {title}
              </Typography>
              <Typography
                style={{ color }}
                variant="h5"
              >
                {value}
                %
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};