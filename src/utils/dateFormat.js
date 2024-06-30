
export const ddmmyy = (date) => {

  if (isJSDate(date)) {
    const newValue = new Date(date)
    let str = String(newValue.getDate());
    if (str.length == 1) {
      str = '0' + str;
    }
    str += '-';
    if (String(newValue.getMonth() + 1).length == 1) {
      str = str + '0' + String(newValue.getMonth() + 1) + '-' + String(newValue.getFullYear());
    } else {
      str = str + String(newValue.getMonth() + 1) + '-' + String(newValue.getFullYear());
    }
    return str;
  } else {
    return "N/A"
  }

};

export const formatDate = (date) => {

  if (date) {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  } else {
    return "N/A"
  }

}

export const mmyy = (newValue) => {
  let str;
  if (String(newValue.getMonth() + 1).length == 1) {
    str = String('0') + String(newValue.getMonth() + 1) + String(newValue.getFullYear());
  }
  else {
    str = String(newValue.getMonth() + 1) + String(newValue.getFullYear());
  }
  return str;
}

export const yymm = (newValue) => {
  let str;
  if (String(newValue.getMonth() + 1).length == 1) {
    str = String(newValue.getFullYear()) + String('0') + String(newValue.getMonth() + 1);
  }
  else {
    str = String(newValue.getFullYear()) + String(newValue.getMonth() + 1);
  }
  return str;
}

export const creationTime = (newValue) => {
  let str = new Date(String(newValue));
  let returnDate = str.getDate() + '/' + (str.getMonth() + 1) + '/' + str.getFullYear() + ' ' + str.getHours() + ':' + str.getMinutes();
  return returnDate;
}

export const creationDateTime = (date) => {
  date = new Date(String(date));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
}

export const monthYearStr = (date) => {
  let months = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  };
  let ans = "";
  ans = months[date.substr(0, 2)] + " - " + date.substr(2, date.length);
  return ans;
}

export const getCurrentYearFirstMonth = () => {
  let date = new Date()
  date.setMonth(0)
  date.setDate(1)
  return formatDate(date)
}

export const excelDateToJSDate = (serial) => {

  if (serial != "" && serial != null && serial != undefined) {

    if (typeof serial === "number") {
      let utc_days = Math.floor(serial - 25569);
      let utc_value = utc_days * 86400;
      let date_info = new Date(utc_value * 1000);

      let fractional_day = serial - Math.floor(serial) + 0.0000001;

      let total_seconds = Math.floor(86400 * fractional_day);

      let seconds = total_seconds % 60;

      total_seconds -= seconds;

      let hours = Math.floor(total_seconds / (60 * 60));
      let minutes = Math.floor(total_seconds / 60) % 60;

      return formatDate(new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds));
    }

  } else {
    return "N/A"
  }
}

export const yyyymmddExcelDateToJSDate = (serial) => {

  let utc_days = Math.floor(serial - 25569);
  let utc_value = utc_days * 86400;
  let date_info = new Date(utc_value * 1000);

  let fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  let seconds = total_seconds % 60;

  total_seconds -= seconds;

  let hours = Math.floor(total_seconds / (60 * 60));
  let minutes = Math.floor(total_seconds / 60) % 60;

  return yyyymmddDate(new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds))
}

export const getTentativeDate = (date) => {
  // let date = new Date(tentDate);

  if (date !== null && date !== undefined && date !== "") {


    let day = new Date(date).getDate()

    let thisMonth = new Date().getMonth() + 1
    let thisYear = new Date().getFullYear()

    return `${day}-${thisMonth}-${thisYear}`
  } else {
    return "N/A"
  }

}

export const yyyymmdd = (date) => {


  if (date != "" && date != null && date != undefined) {

    if (typeof date === "number") {
      return excelDateToJSDate(date)
    } else {
      const newDate = new Date(date)

      if (newDate instanceof Date) {

        return formatDate(newDate)
        // date object is valid
      } else {
        return formatDate(new Date())
        // not a date object
      }


    }

  }


}

export const checkUnderFifteenDay = (dateString) => {
  const givenDate = new Date(dateString);
  const today = new Date();
  const todayDate = new Date(today.toISOString().split("T")[0]);
  const fifteenDaysAgo = new Date(todayDate);
  fifteenDaysAgo.setDate(todayDate.getDate() - 15);
  if (givenDate <= todayDate) {
    if (givenDate.getTime() === todayDate.getTime()) {
      return { statusCode: 200, message: "Valid Date" }
    } else if (givenDate >= fifteenDaysAgo) {
      return { statusCode: 200, message: "Valid Date Under 15" }
    } else {
      return { statusCode: 500, message: "Valid Date but more than 15 days ago" }
    }
  } else {
    return { statusCode: 500, message: "Invalid Date above today's date" }
  }
}

export const yyyymmddDate = (date) => {
  let x = new Date(date);
  let y = x.getFullYear().toString();
  let m = (x.getMonth() + 1).toString();
  let d = x.getDate().toString();
  (d.length == 1) && (d = '0' + d);
  (m.length == 1) && (m = '0' + m);
  let yyyymmdd = y + m + d;
  return yyyymmdd;
}

export const yearMonthDate = (date) => {
  if (isExcelDate(date)) {
    return yyyymmddExcelDateToJSDate(date)
  } else if (isJSDate(date)) {
    return yyyymmddDate(date)
  }
}

export const getMonthAndYear = () => {
  const date = new Date()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${month}${year}`
}

export const indiaDate = (date) => {
  let dt = new Date(date.toLocaleString(undefined, { timeZone: "Asia/Kolkata" }));
  return formatDate(dt);
}

export const getThisMonthFirstAndLastDay = () => {
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    "firstDay": formatDate(firstDay),
    "lastDay": formatDate(lastDay)
  }
}

export const getPreviousMonthFirstAndLastDay = () => {
  let now = new Date();
  let prevMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0);
  let prevMonthFirstDate = new Date(now.getFullYear() - (now.getMonth() > 0 ? 0 : 1), (now.getMonth() - 1 + 12) % 12, 1);

  return {
    "firstDay": formatDate(prevMonthFirstDate),
    "lastDay": formatDate(prevMonthLastDate),
  }
}

export const getThisYearFirstAndLastDay = (financialYear) => {

  let thisYear = financialYear.getFullYear()
  let startYear = new Date(thisYear, 3, 1)
  let endYear = new Date(thisYear + 1, 3, 0)

  return {
    "firstDay": formatDate(startYear),
    "lastDay": formatDate(endYear),
  }
}


export const getPreviousMonth = () => {
  let makeDate = new Date();
  makeDate.setMonth(makeDate.getMonth() - 1)
  return makeDate.getMonth();
}


export const addDaysCurrent = (n) => {
  let t = new Date();
  t.setDate(t.getDate() + n);
  let month = "0" + (t.getMonth() + 1);
  let date = "0" + t.getDate();
  month = month.slice(-2);
  date = date.slice(-2);
  date = t.getFullYear() + "-" + month + "-" + date;
  return date
}

export const getAllDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const dates = [];
  while (date.getMonth() === month) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export const isJSDate = (value) => {
  if (value instanceof Date) {
    return !isNaN(value);
  }
  if (typeof value === 'string') {
    let date = new Date(value);
    return date instanceof Date && !isNaN(date);
  }

  return false;
}

export const isExcelDate = (serial) => {
  let utc_days = Math.floor(serial - 25569);
  let utc_value = utc_days * 86400;
  let date_info = new Date(utc_value * 1000);
  let fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  let seconds = total_seconds % 60;
  total_seconds -= seconds;
  let hours = Math.floor(total_seconds / (60 * 60));
  let minutes = Math.floor(total_seconds / 60) % 60;
  let jsDate = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
  return isJSDate(jsDate);
}





export const formateDDMMMYYYYhhmm = (timestamp) => {

  if (timestamp) {
    const [date, time] = timestamp.toString()?.split("T");
    const monthNames = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    const [year, month, day] = date.split("-");
    let [hour, minute] = time.split(":");

    let ampm = 'AM';
    if (hour >= 12) {
      ampm = 'PM';
      hour -= 12;
    }
    if (hour === 0) {
      hour = 12;
    }
    return `${day}-${monthNames[month - 1]}-${year} ${hour}:${minute} ${ampm}`
  } else {
    return ""
  }

}

// Example usage:
const timestamp = '2023-12-05T10:31:08.000Z'; // Your provided timestamp
// const formattedTimestamp = formatDate(timestamp);
// console.log(formattedTimestamp); // Output in the desired format
