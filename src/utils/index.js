import { config, stage } from "../services/configHandle";

export const indianFormat = (x) => x ? x.toString().split('.')[0].length > 3 ? x.toString().substring(0, x.toString().split('.')[0].length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + x.toString().substring(x.toString().split('.')[0].length - 3) : x.toString() : x;

export const amountFormat = (x) => x ? x > 0 ? `₹  ${indianFormat((Number(x) / 100).toFixed(2))}` : `₹  ${(Number(x) / 100).toFixed(2)}` : `₹  ${(0).toFixed(2)}`;

export const isEmpty = (x) => x ? x : "N/A";

export const convertToTitleCase = (str) => {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    }).replace(/([A-Z])/g, ' $1').trim();
}



export const BILLER_CATEGORY = "Electricity";


const ORG_ID_LIST_SANDBOX = {
    V2P: '9ff5aeb0-7a20-4f96-af15-a74bfdc31e83',
    HDFC: '078c66d0-7ade-43db-bad9-5cda15a6dc76',
    ITL: '26d92870-d222-47df-9434-c9697eecc80b',  
} 

const ORG_ID_LIST_PROD ={
    AGS: '08cff98c-aac2-4677-a5fc-1089aa86ee83',
    SIPL: '08cff98c-aac2-4677-a5fc-1089aa86pp97',
    PIEL: '08cff98c-aac2-4677-a5fc-1089aa86pp98',
    HDFC: '09a7c592-7193-44c8-aeab-e5152be655e3',
    MBL: '785f37ac-ed32-47cf-8f48-0136028e1bdf',
    VAYN: '993e5d6f-1458-4cb6-a15c-facda5434b31',
    TIPL: 'a27e3537-a56c-4242-b3fd-1bc88fb5d9a2',
    B2P: 'a386a164-0469-4894-98b2-ca303eda002b',
    ITL: 'd1ddd47e-49f7-49e5-bafa-1b0daffc34d2',
    V2P: 'e1c8bfa7-b541-4b56-9f45-c2ef79d9454e',
}

const ORG_ID_STAGE_WISE = {
    "dev":ORG_ID_LIST_SANDBOX,
    "sandbox":ORG_ID_LIST_SANDBOX,
    "prod":ORG_ID_LIST_PROD,
}
export const ORG_ID_LIST = ORG_ID_STAGE_WISE[stage];

export const isVerificationStatus = {
    false: {
        "title": "Pending",
        "variant": "warning"
    },
    true: {
        "title": "Authorized",
        "variant": "primary"
    }
}


export const batchTypeStatus = {
    "0": "Client Created Batch",
    "1": "Admin Created Batch",
    "2": "NEFT Payment Batch",
}

export const clientStatus = {
    "0": {
        title: "Unpaid",
        color: "warning"
    },
    "1": {
        title: "Card Pay Done",
        color: "success"
    },
    "2": {
        title: "NEFT Pay Done",
        color: "success"
    },
    '-1': {
        title: "Unverified",
        color: "warning"
    },
    '-2': {
        title: "Unverified",
        color: "warning"
    }
}

export const billStatus = {
    "1": {
        title: "New Bill",
        color: "warning"
    },
    "2": {
        title: "Verified",
        color: "success"
    }
}

export const adminStatus = {
    "0": {
        title: "Unpaid",
        color: "warning"
    },
    "1": {
        title: "B2P Pay Done",
        color: "success"

    },
    "2": {
        title: "Disable Bill",
        color: "error"
    },
    "3": {
        title: "BBPS Pay Done",
        color: "success"
    },
}

export const payStatusClientSideTitle = {
    "0": {
        title: "Pending",
        color: "warning",
    },
    "1": {
        title: "Client Paid",
        color: "info",
    },
    "2": {
        title: "B2P Paid",
        color: "success",
    },
    "3": {
        title: "Disable Bill",
        color: "error",
    },
    "4": {
        title: "B2P Paid",
        color: "success",
    },
    "-1": {
        title: "Unverified",
        color: "error"
    },
    "-2": {
        title: "Unverified",
        color: "error"
    }
};

export const payStatusAdminSideTitle = {
    0: {
        title: "In Batch Bills",
        color: "warning"
    },
    1: {
        title: "Client Payment Done",
        color: "info"
    },
    2: {
        title: "Admin Payment Done",
        color: "success"
    },
    3: {
        title: "Disable Bill",
        color: "error"

    },
    4: {
        title: "BBPS Payment Done",
        color: "success"
    },
    '-1': {
        title: "Unverified",
        color: "warning"
    },
    '-2': {
        title: "Unverified",
        color: "warning"
    }
};

export const batchTypeTitle = {
    "0": {
        title: "Client Created Batch",
        color: "info"
    },
    "1": {
        title: "Admin Created Batch",
        color: "success"
    },
    "2": {
        title: "NEFT Payment Batch",
        color: "success"
    },
    "3": {
        title: "B2P First Paid Bill",
        color: "success"
    },
    "4": {
        title: "NEFT Payment Completed Batch",
        color: "success"
    }
}

export const truncateString = (string = '', maxLength = 30) => string?.length > maxLength ? `${string?.substring(0, maxLength)}…` : string