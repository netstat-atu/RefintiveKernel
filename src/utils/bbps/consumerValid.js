import { bulkConsumerSave } from "./billerServices";
const async = require("async");

export const consumerValid = (data, orgId, isIgnoreVerify) => {
    return new Promise((rs, rj) => {
        async.mapLimit(data, 2, async (res) => {
            let response;
            try {
                const body = {
                    "type": "VALIDATE_CONSUMER",
                    "data": res,
                    "orgId": orgId,
                    "isIgnoreVerify": isIgnoreVerify
                }
                response = await bulkConsumerSave(body)
                console.log('response', response)
                if (response.statusCode == 200) {
                    response = response.body
                } else {
                    response = {
                        "Error": true,
                        "Reason": response.body
                    }
                }
            } catch (error) {
                response = {
                    "Error": true,
                    "Reason": JSON.stringify(error?.stack || error)
                }

            };
            return response
        }, async (err, results) => {
            if (err)
                rj(err);
            rs(results);
        })
    })
}
