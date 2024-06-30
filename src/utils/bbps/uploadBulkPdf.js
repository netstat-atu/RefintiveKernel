import { pdfBillFetchUpload } from "./billerServices";
const async = require("async");


export const bulkPDFUpload = (data, lookupFields) => {

    return new Promise((rs, rj) => {
        async.mapLimit(data, 8, async (res) => {
            let base64 = await res?.async("base64");
            base64 = base64?.replace("dataapplication/pdfbase64", "");
            const fileName = res.name.split('.').slice(0, -1).join('.');
            const [ID, alias] = fileName.split("&");
            const orgId = lookupFields.get(alias);
            const body = {
                orgId: orgId,
                userId: "TEST",
                ID: ID,
                data: base64
            }
            const response = await pdfBillFetchUpload(body);
            return response

        }, async (err, results) => {
            if (err)
                rj(err);
            rs(results);
        })
    })
}
