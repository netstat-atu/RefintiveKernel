import { yearMonthDate } from "./dateFormat";

export const validateBillFetch = (data) => {
    console.log('data', data)
    return new Promise((resolve, reject) => {
        // Check if data is an array
        if (!Array.isArray(data)) {
            reject("Data is not an array");
            return;
        }

        // Check if each element of data is an object
        if (data.some(e => typeof e !== 'object' || e === null)) {
            reject("Data array contains non-object elements");
            return;
        }

        const validData = data.map((e) => {
            // Ensure e is an object
            if (typeof e !== 'object' || e === null) {
                return { Error: true, Reason: "Invalid data object" };
            }

            // Add properties Error and Reason to the object
            e.Error = false;
            e.Reason = "Valid bill";

            const ID = String(e.CID) + String(yearMonthDate(e.dueDate));
            if (e.ID === ID || ['', undefined, null].includes(e.pdfLink)) {
                e.Error = true;
                e.Reason = "Pdf data not available";
            }
            return e;
        });

        const isError = validData.some((e) => e.Error === true);
        resolve({ isError: isError, validData: validData });
    });
}

// // Example usage:
// validateData([{ CID: 123, dueDate: new Date(), pdfLink: 'example.pdf' }])
//     .then(result => {
//         console.log(result);
//     })
//     .catch(error => {
//         console.error("Error:", error);
//     });
