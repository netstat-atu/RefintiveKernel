import { checkConsumerExist } from "./billerServices";
const async = require("async");

export const fetchBulkUploadVerify = (data, orgId) => {

    return new Promise((rs, rj) => {

        async.mapLimit(data, 2, async (res) => {

            let response = {
                "reason": {
                    "responseCode": 400,
                    "complianceReason": "Something wrong !"
                }
            }
            try {
                let CID = String(res?.BillerAlias) + String(res?.ConsumerId);
                const data = await checkConsumerExist(CID, orgId);
                const consumerExits = data?.consumerExist
                const consumerData = data?.consumer;
                if (consumerExits) {
                    if (consumerData?.Active == 0) {
                        response = {
                            "reason": {
                                "responseCode": 400,
                                "complianceReason": "That Consumer Inactive !"
                            }
                        }
                    } else {
                        response = {
                            "reason": {
                                "responseCode": 200,
                                "complianceReason": "Valid Consumer"
                            },
                        }
                    }
                } else {
                    response = {
                        "reason": {
                            "responseCode": 400,
                            "complianceReason": "No Consumer Found ! :  Please Register Consumer"
                        }
                    }
                }

            } catch (error) {
                response = {
                    "reason": {
                        "responseCode": 400,
                        "complianceReason": JSON.stringify(error)
                    }
                }
            }

            return response

        }, async (err, results) => {
            if (err)
                rj(err);

            for (let req = 0; req < results.length; req++) {

                if (results[req]?.reason?.responseCode === "000" || results[req]?.reason?.responseCode == 200) {
                    data[req]["Status"] = 1;
                    data[req]["Reason"] = results[req]?.reason?.complianceReason;
                } else {
                    data[req]["Status"] = 0;
                    data[req]["Reason"] = results[req]?.reason?.complianceReason;
                }
            }
            rs(data);
        })
    })
}