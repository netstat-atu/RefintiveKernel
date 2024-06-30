export const config = require('./api-config.json')

export const stage = config.stage; // dev | sandbox | prod

const mysqlRes = {
    "dev": config['dev-sql-api'],
    "sandbox": config['sandbox-sql-api'],
    "prod": config['prod-sql-api'],
} 
const uploadStatmentRes = {
    "dev": config['base'],
} 

const bbpsRes = {
    "dev": config['dev-bbps-api'],
    "sandbox": config['sandbox-bbps-api'],
    "prod": config['prod-bbps-api'],
} 

const b2pPayRes = {
    "dev": config['dev-b2p-pay-api'],
    "sandbox": config['sandbox-b2p-pay-api'],
    "prod": config['prod-b2p-pay-api'],
} 
  
export const mysqlResAPI= mysqlRes[stage];
export const bbpsResAPI = bbpsRes[stage];
export const b2pPayResAPI = b2pPayRes[stage];
export const baseResApi= uploadStatmentRes[stage];

export const pathNameBaseOnStage = (val) => {
    return config.deploy ? val + ".html" : val
}

export const paymentVenderToPayUrl = () => {
    const stageWisePay = {
        "dev":`https://pg.vendor2pay.in/vayanapg/`,
        "sandbox":`https://pg.vendor2pay.in/vayanapg/`,
        "prod":`https://pg.vendortopay.com/vayanapg/`,
    }
   return stageWisePay[stage]
}

export const paymentRedirectUrl = (trackId, userId) => {
    const stageWiseUrl = {
        "dev":`http://localhost:3000/user/paymentClearance?trackId=${trackId}&userId=${userId}`,
        "sandbox":`https://billtopay.in/user/paymentClearance.html?trackId=${trackId}&userId=${userId}`,
        "prod":`https://billtopay.in/user/paymentClearance.html?trackId=${trackId}&userId=${userId}`,
    }
return stageWiseUrl[stage]
}

const theodoreApi = {
    "dev":config.theodore_sandbox,
    "sandbox":config.theodore_sandbox,
    "prod":config.theodore_prod
};

export const theodore_api = theodoreApi[stage]

