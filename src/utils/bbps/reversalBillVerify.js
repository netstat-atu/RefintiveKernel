import { bulkBillUploadAPI, reversalBillFromAPI } from "./billerServices";
const async = require("async");
export const reversalBillVerify = (data, orgId) => {

    return new Promise((rs, rj) => {

        async.mapLimit(data, 2, async (res) => {

            let response = {
                "Status": 1,
                "Reason": "Client Side Issue"
            }
            try {
                const ID = res?.ID;
                const paymentBillBody = {
                    "type": "CHECK_PAYMENT_BILL",
                    "orgId": orgId,
                    "userId": "",
                    "data": ID
                };

                const billExits = await reversalBillFromAPI(paymentBillBody);

                if (billExits?.length > 0) {
                    const reversalBillBody = {
                        "type": "CHECK_REVERSAL_BILL",
                        "orgId": orgId,
                        "userId": "",
                        "data": ID
                    };
                    const reversalBillExits = await reversalBillFromAPI(reversalBillBody);

                    if (reversalBillExits?.length > 0) {
                        response["Status"] = 0;
                        response["Reason"] = "Reversal bill already exist !";
                    } else {
                        response["Status"] = 1;
                        response["Reason"] = "Valid bill";
                    }

                } else {
                    response["Status"] = 0;
                    response["Reason"] = "Bill not available !";
                }

            } catch (error) {
                response["Status"] = 0;
                response["Reason"] = JSON.stringify(error);
            }

            return response

        }, async (err, results) => {
            if (err)
                rj(err);

            console.log("Results: ", results);
            for (let req = 0; req < results.length; req++) {
                data[req]["Status"] = results[req].Status;
                data[req]["Reason"] = results[req]?.Reason;
            }
            rs(data);
        })
    })
}