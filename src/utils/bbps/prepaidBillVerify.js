import { bulkBillUploadAPI } from "./billerServices";
const async = require("async");
export const prepaidBillVerify = (data, orgId) => {

    return new Promise((rs, rj) => {

        async.mapLimit(data, 2, async (res) => {

            let response = {
                "Status": 1,
                "Reason": "Client Side Issue"
            }
            try {
                const ID = res?.ConsumerId;
                const paymentBillBody = {
                    "type": "CHECK_PREPAID_CONSUMER",
                    "orgId": orgId,
                    "userId": "",
                    "data": ID
                };

                const billExits = await bulkBillUploadAPI(paymentBillBody);
                if (billExits?.length > 0) {
                    response["Status"] = 1;
                    response["Reason"] = "Consumer is valid";
                    response["PayType"] = billExits.payType;
                } else {
                    response["Status"] = 0;
                    response["Reason"] = "Consumer not valid";
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
                data[req]["PayType"] = results[req]?.PayType;
            }
            rs(data);
        })
    })
}