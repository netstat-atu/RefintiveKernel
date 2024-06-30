import React from 'react';
//** mui */
import { Box, Card, CardContent, CardHeader, Divider, useTheme } from '@mui/material';
import { Bar } from 'react-chartjs-2';

//** utils */
import { formatDate, getAllDaysInMonth, getPreviousMonth } from '../../utils/dateFormat';

//** npm */
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Sales = ({ thisMonthData, lastMonthData }) => {


  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const theme = useTheme();

  const [thisMonthPaidAmount, setThisMonthPaidAmount] = React.useState([]);
  const [lastMonthPaidAmount, setLastMonthPaidAmount] = React.useState([]);
  const [thisMonthPaidDay, setThisMonthPaidDay] = React.useState([]);
  const [lastMonthPaidDay, setLastMonthPaidDay] = React.useState([]);

  const getThisMonthPaidAmount = async (params) => {

    const toDate = new Date()
    const thisMonth = toDate.getMonth()
    const thisYear = toDate.getFullYear()
    const allDays = getAllDaysInMonth(thisYear, thisMonth)

    const data = await getAmountByFilter("this", allDays);
    if (params) {
      const amount = data?.amount.slice(-params)
      const day = data?.day.slice(-params)
      setThisMonthPaidAmount(amount)
      setThisMonthPaidDay(day)
    } else {
      setThisMonthPaidAmount(data?.amount);
      setThisMonthPaidDay(data?.day);
    }
  }

  const getLastMonthPaidAmount = async (params) => {
    const toDate = new Date()
    const thisMonth = toDate.getMonth()
    const thisYear = toDate.getFullYear()
    const allDays = getAllDaysInMonth(thisYear, thisMonth - 1)
    const data = await getAmountByFilter("last", allDays);
    if (params) {
      const amount = data?.amount.slice(-params)
      const day = data?.day.slice(-params)
      setLastMonthPaidAmount(amount)
      setLastMonthPaidDay(day)
    } else {
      setLastMonthPaidAmount(data?.amount);
      setLastMonthPaidDay(data?.day);
    }
  };

  const getAmountByFilter = async (body, allDays) => {
    try {
      const checkMonth = {
        "this": thisMonthData,
        "last": lastMonthData
      }
      if (checkMonth[body].length > 0) {
        let amountArray = [];
        let dateArray = [];
        allDays.map(date => {
          const allDay = new Date(date);
          const formatAllDay = formatDate(allDay)
          let totalAmount = 0;
          checkMonth[body].map((item) => {
            const { amount, PaymentDate } = item;
            const paymentDate = new Date(PaymentDate)
            const formatDates = formatDate(paymentDate)
            if (formatAllDay == formatDates) {
              let totalAmounts = Number(amount) / 100
              totalAmount += totalAmounts
            }
          });
          amountArray.push(totalAmount)
          dateArray.push(formatAllDay);
        })
        return { amount: amountArray, day: dateArray }
      } else {
        return { amount: [], day: [] }
      }
    } catch (error) {
      console.log("🚀 ~ file: sales.js:128 ~ getAmountByFilter ~ error:", error)
      return { amount: [], day: [] }
    }

  };

  const barData = {
    datasets: [
      {
        backgroundColor: '#AADEA7',
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: thisMonthPaidAmount,
        label: month[new Date().getMonth()],
        maxBarThickness: 10
      },
      {
        backgroundColor: '#FEAE65',
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: lastMonthPaidAmount,
        label: month[getPreviousMonth()],
        maxBarThickness: 10
      }
    ],
    labels: thisMonthPaidDay?.length > lastMonthPaidDay?.length ? thisMonthPaidDay?.map((e) => e.slice(-2)) : lastMonthPaidDay?.map((e) => e.slice(-2))
  };

  const options = {
    animation: false,
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: { display: false },
    maintainAspectRatio: false,
    responsive: true,
    xAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary
        },
        gridLines: {
          display: false,
          drawBorder: false
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary,
          beginAtZero: true,
          min: 0
        },
        gridLines: {
          borderDash: [2],
          borderDashOffset: [2],
          color: theme.palette.divider,
          drawBorder: false,
          zeroLineBorderDash: [2],
          zeroLineBorderDashOffset: [2],
          zeroLineColor: theme.palette.divider
        }
      }
    ],
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return tooltipItem.yLabel
        }
      },
      backgroundColor: theme.palette.background.paper,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: 'index',
      titleFontColor: theme.palette.text.primary
    }
  };

  React.useEffect(() => {
    getThisMonthPaidAmount()
    getLastMonthPaidAmount()
  }, [])
  return (
    <Card>
      <CardHeader title="Comparison of bills paid" />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: 'relative'
          }}
        >
          <Bar
            data={barData}
            options={options}
          />
        </Box>
      </CardContent>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        X-axis (Month of days) and Y-axis (Total Amount Paid)
      </Box>
    </Card>
  );
};