import { bbpsResAPI, mysqlResAPI, b2pPayResAPI, baseResApi } from '../../services/configHandle';
const BASE_URL = mysqlResAPI;
const BPPS_BASE_URL = bbpsResAPI;
const B2P_PAY_BASE_URL = b2pPayResAPI;
const New_Base_url = baseResApi;

const getToken = () => {
  if (typeof window !== 'undefined' && window.localStorage !== undefined) {
    const token = window.localStorage.getItem('token');
    return { 'authorization': 'Bearer ' + token };
  } else {
    return { 'authorization': null };
  }
};

const headers = () => ({ "Content-Type": "application/json", "Accept": "*/*", ...getToken() })

//** BILLER API START */
export const billerNameRequest = async (category, stateName) => {

  try {

    let body = {
      "type": "BILLER_LIST",
      "data": {
        "Category": category,
        "stateName": stateName === "ALL" ? "" : stateName
      }
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BASE_URL + "/biller/list", requestOptions);
    const data = await response.json();
    return data;

  } catch (err) {
    return
  }
};
export const billerCategoryRequest = async () => {

  try {

    let body = {
      "type": "BILLER_CATEGORY",
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BASE_URL + "/biller/category-list", requestOptions);
    const data = await response.json();
    return data;

  } catch (err) {
    return
  }
};
export const billerNameStates = async () => {

  try {

    let body = {
      "type": "BILLER_STATE"
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/biller/state-list", requestOptions);
    const data = await response.json();
    return data;


  } catch (err) {
    return
  }
};

export const getBillerBoard = async () => {

  try {

    let body = {
      "type": "BILLER"
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/biller/list", requestOptions);
    const data = await response.json();
    return data;


  } catch (err) {
    return
  }
};

export const billerDetailsRequest = async (billerId) => {
  try {

    let body = {
      "type": "BILLER_DETAILS",
      "data": {
        "BillerId": billerId
      }
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/biller/details-list", requestOptions);
    const data = await response.json();
    return data;
  } catch (err) {
    return
  }
};
export const billerDetailReq = async (billerId) => {
  try {

    let body = {
      "type": "DETAILS",
      "data": {
        "BillerId": billerId
      }
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/biller/details-list", requestOptions);
    const data = await response.json();
    return data;
  } catch (err) {
    return
  }
};

//** CONSUMER API START */
export const singleConsumerSave = async (states, addStates, orgId) => {

  try {
    let body = {
      "type": "CONSUMER_SAVE",
      "data": {
        orgId: orgId,
        defaultData: states,
        additionalData: addStates
      }
    }

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/consumer/single-save", requestOptions)

    const data = await response.json()
    return data;
  } catch (err) {
    return
  }
};

export const bulkConsumerSave = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BASE_URL + "/consumer/bulk-save", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const checkConsumerExist = async (ID, orgId) => {

  try {
    let body = {
      "type": "CONSUMER_EXIST",
      "ID": ID,
      "orgId": orgId
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BASE_URL + "/consumer/single-save", requestOptions);
    const data = await response.json()
    return data;

  } catch (err) {
    return
  }
};

export const consumerListByFilter = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/consumer/list", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const consumerListAddComment = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/consumer/add-comment", requestOptions);
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const consumerManageAPI = async (reqBody) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/consumer/status-update", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const consumerUpdate = async (reqBody) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/consumer/single-save", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

//** BILL BATCH API START */

export const batchVerification = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/batch-verification", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const createBatch = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/batch-create", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const checkAndUploadBillForBatchCreation = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/batch-verify-create", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const getBatchBillList = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/clearance-bill-list", requestOptions)
    const data = await response.json()

    return data
  } catch (err) {
    return
  }
};

export const getPaymentBillList = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/payment-bill-list", requestOptions)
    const data = await response.json()

    return data
  } catch (err) {
    return
  }
};

export const getBatchIdFromAPI = async (orgId) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify({
        "orgId": orgId
      }),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/get-batch-id", requestOptions)

    const data = await response.json()
    return data;


  } catch (err) {
    return
  }
};

//** ORGANIZATION API START */
export const getOrgField = async (orgId) => {
  try {
    let body = {
      "type": "ORGANIZATION_FIELD",
      "data": {
        orgId: orgId
      }
    };

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BASE_URL + "/organization/org-field-list", requestOptions);
    const data = await response.json();
    return data;

  } catch (err) {
    return
  }
};

export const getOrgList = async () => {
  try {

    let body = {
      "type": "ORGANIZATION"
    }

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/organization/list", requestOptions);
    const data = await response.json()
    return data;
  } catch (err) {
    return
  }
};

export const getPayType = async () => {
  try {
    let body = {
      "type": "PAY_TYPE"
    }
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers(),
    };
    const response = await fetch(BASE_URL + "/organization/list", requestOptions);
    const data = await response.json()
    return data;
  } catch (err) {
    return
  }
};

export const getUserAccess = async (orgId) => {
  try {
    const body = {
      "type": "BATCH_VERIFICATION",
      "orgId": orgId
    }
    let requestOptions = {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body)
    };
    const response = await fetch(BASE_URL + "/user-access", requestOptions);
    const data = await response.json()
    return data;
  } catch (err) {
    return
  }
};



//** BILL API START */


export const autoBillFetchList = async (body) => {
  try {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/sync-bill-fetch", requestOptions);
    // TODO - uncomment below line for dev, once deployed from the main serverless endpoint we will not need it.
    // const response = await fetch('/api/sync-bill-fetch', requestOptions);
    const data = await response.json();
    return data;
  } catch (err) {
    return null
  }
};

export const fetchBillFetchReports = async (body) => {
  try {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/get-bill-fetch-reports", requestOptions);
    // TODO - uncomment below line for dev, once deployed from the main serverless endpoint we will not need it.
    // const response = await fetch('/api/get-bill-fetch-reports', requestOptions);
    const data = await response.json();
    return data;
  } catch (err) {
    return null
  }
};


export const getAutoBillFilter = async (body) => {
  try {


    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/auto-bill-payment-list", requestOptions);
    const data = await response.json()
    return data;
  } catch (err) {
    return
  }
};
export const billFetchListFilter = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/fetch-bill-list", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    console.log("🚀 ~ file: billerServices.js:440 ~ billFetchListFilter ~ err:", err)
    return
  }
};

export const billVerificationFilter = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/verification-bill-list", requestOptions);
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const billEnableDisableAPI = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/payment-bill-status-update", requestOptions)

    const data = await response.json();
    return data;


  } catch (err) {
    return
  }
};

export const thresholdRequest = async (body) => {

  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BASE_URL + "/bill/threshold", requestOptions);
    const data = await response.json();
    return data;


  } catch (err) {
    return
  }
};

export const billVerificationAddComment = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/verification-add-values", requestOptions)
    const data = await response.json()

    return data
  } catch (err) {
    return
  }
};

export const downloadExcelFromAPI = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/excel-create-download", requestOptions)

    const data = await response.json()
    return data;

  } catch (err) {
    return
  }
};

export const downloadPdfZipFromAPI = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/zip-create-download", requestOptions)

    const data = await response.json()
    return data;

  } catch (err) {
    return
  }
};

export const verifyBillFetch = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/verify-fetch", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};
export const validationBillFetch = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/verify-fetch", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const updateBillFetch = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/fetch-bill-update", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    throw err
  }
};

export const uploadBillFetch = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/upload-bill-file/fetch-bill-update", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    throw err
  }
};

export const billStatusFilter = async (reqBody) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/status", requestOptions);
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};


export const reversalBillFromAPI = async (reqBody) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/reversal-bill-upload", requestOptions);
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const dashboardFilter = async (reqBody) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/dashboard", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const reportByFilter = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/report", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const pdfBillDownload = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/bill/pdf-download", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

//** PAYMENT API START */ 
export const adminBatchPayment = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/payment/admin-single-pay", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const adminRetryPayment = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/payment/admin-single-retry", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const clientPaymentRequest = async (body) => {

  try {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()

    };
    const response = await fetch(BPPS_BASE_URL + "/payment/client-pay-gateway", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const adminAutoPayment = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/payment/admin-pay-auto", requestOptions)

    const data = await response.json();
    return data;


  } catch (err) {
    return
  }
};

export const adminAutoPaymentManage = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/payment/admin-pay-auto-manage", requestOptions)
    const data = await response.json();
    return data;

  } catch (err) {
    return
  }
};
export const adminAutoPrepaidBillPayment = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/payment/admin-prepaid-auto", requestOptions)
    const data = await response.json();
    return data;

  } catch (err) {
    return
  }
};

export const adminAutoPaymentDownload = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/payment/admin-pay-auto-download-email", requestOptions)
    const data = await response.json();
    return data;

  } catch (err) {
    return
  }
};
export const checkStatusStepFunction = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/bill/step-function-status-check", requestOptions)
    const data = await response.json();
    return data;

  } catch (err) {
    return
  }
};

export const getPaymentReceipt = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/payment/receipts", requestOptions)

    const data = await response.json();
    return data;


  } catch (err) {
    return
  }
};


//** B2P PAYMENT REQUEST API */

export const payRequestList = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(B2P_PAY_BASE_URL + "/pay/request-list", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const payRequestSingle = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(B2P_PAY_BASE_URL + "/pay/request-single", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const payRequestManage = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(B2P_PAY_BASE_URL + "/pay/request-manage", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const payRequestReceipt = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(B2P_PAY_BASE_URL + "/pay/request-receipt", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};
export const payRequestAuto = async (reqBody) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: headers()
    };
    const response = await fetch(B2P_PAY_BASE_URL + "/pay/payment-requests-auto", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};


//** MANUAL BILL API START */
export const getManualBill = async (reqBody, customerParams) => {
  try {
    let body = {
      "type": "Search",
      "data": {
        "billerCategory": reqBody.billerCategory,
        "billerId": reqBody.billerId,
        "customerParams": customerParams
      }
    }
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BPPS_BASE_URL + "/manual-fetch/bbps-bill", requestOptions);
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const getOtherBill = async (reqBody) => {

  try {
    let body = {
      "state": reqBody.billerId,
      "data": reqBody
    }
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()


    };
    const response = await fetch(BPPS_BASE_URL + "/manual-fetch/other-bill", requestOptions);
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};


//** BILL UPLOAD API START */
export const insertManualBill = async (reqBody) => {

  try {
    let body = {
      "type": "Insert",
      "data": reqBody
    }
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()

    };
    const response = await fetch(BASE_URL + "/upload/single-bill", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};




export const insertHTManualBill = async (reqBody) => {
  try {
    let body = {
      "data": reqBody
    }
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/upload/ht-bill", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const bulkBillUploadAPI = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BASE_URL + "/upload/bulk-bill", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};
export const bulkFetchUploadAPI = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BPPS_BASE_URL + "/bill-fetch/bill-fetch-upload", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};
export const amountAsyncUpload = async (body) => {
  try {

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };

    const response = await fetch(BPPS_BASE_URL + "/bill-fetch-email", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

export const uploadBillPDFData = async (body) => {
  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()

    };
    const response = await fetch(BASE_URL + "/upload/pdf-data", requestOptions)
    const data = await response.json()
    return data
  } catch (err) {
    return
  }
};

//** UPLOAD FILE API START */
export const pdfBillFetchUpload = async (body) => {

  let requestOptions = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: headers()

  };
  try {
    const response = await fetch(BASE_URL + "/upload/fetch-bill-pdf", requestOptions)
    const data = await response.json();
    return data
  } catch (err) {
    return
  }
};

export const userInfoS3Store = async (body) => {

  try {
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers()
    };
    const response = await fetch(BASE_URL + "/user-info-session", requestOptions)
    const data = await response.json()
    return data;


  } catch (err) {
    return
  }
};
export const statementUpload = async (file,type,openAlert) => {
  try {
    // let formData = new FormData();
// formData.append('file', new Blob([fileData], { type: 'application/octet-stream' }), file.name);
 const formData = new FormData();
  // file.forEach(file => {
    formData.append('file', file);
  // });
    let requestOptions = {
      method: 'POST',
        maxBodyLength: Infinity,
      body: formData,
      headers: {
        'Accept-Encoding': 'gzip',
       ...getToken() 
      }
    };
let url=''
if(type==="kotak"){
  url=New_Base_url+'/Statement/KotakFileUpload'
}else{
    url=New_Base_url+'/Statement/IciciFileUpload'
}
    const response = await fetch(url, requestOptions);
    console.log(response)
     const data = await response.json()
     if (response?.status===200){
           openAlert('success',`Records Entered : ${data.recordsEntered} and Records Skipped : ${data.recordsSkipped}`)
     }
    return response;
  } catch (error) {
   openAlert('error',error.message)
  }
};



