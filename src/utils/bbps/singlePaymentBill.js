import { adminBatchPayment, adminRetryPayment } from "./billerServices";
const async = require("async");

export const singlePaymentBill = (data, payMode) => {
    return new Promise((rs, rj) => {
        async.mapLimit(data, 1, async (res) => {
            const response = await adminBatchPayment({ "ID": res.ID, "payMode": payMode });
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

export const singleRetryPaymentBill = (data) => {
    return new Promise((rs, rj) => {
        async.mapLimit(data, 1, async (res) => {
            const response = await adminRetryPayment({ "ID": res.ID });
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
