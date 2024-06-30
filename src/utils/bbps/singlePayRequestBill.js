import { payRequestSingle } from "./billerServices";
const async = require("async");

export const singlePayRequestBill = (data) => {
    return new Promise((rs, rj) => {
        async.mapLimit(data, 1, async (res) => {
            const response = await payRequestSingle({ "clientTrackId": res.clientTrackId, type: "PAY" });
            return response

        }, async (err, results) => {
            if (err)
                rj(err);
            for (let req = 0; req < results.length; req++) {
                data[req]["billPaymentStatus"] = results[req];
            }
            rs(data);
        })
    })
}

export const singleRetryRequestBill = (data) => {
    return new Promise((rs, rj) => {
        async.mapLimit(data, 1, async (res) => {
            const response = await payRequestSingle({ "clientTrackId": res.clientTrackId, type: "RETRY" });
            return response
        }, async (err, results) => {
            if (err)
                rj(err);
            for (let req = 0; req < results.length; req++) {
                data[req]["billPaymentStatus"] = results[req];
            }
            rs(data);
        })
    })
}

