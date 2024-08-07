
// const logs = require('./logs.json')
// export default async (request, response) => {
//     return response.status(200).json(logs);
// };

const https = require('https');

export default async (request, response) => {
    const options = {
        method: 'GET',
        // TODO - fetch from json file
        hostname: '7tpcmml8uc.execute-api.ap-south-1.amazonaws.com',
        path: '/dev/get-bill-fetch-reports',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                var parseData = JSON.parse(data);
                if (parseData.statusCode !== 200) {
                    throw new Error(JSON.stringify({ data }));
                }

                response.status(200).json({ data: parseData });
            }
            catch (e) {
                response.status(400).json({
                    data: null, error: e?.message || 'Something went wrong'
                });
            }
        });
    });

    req.on('error', (error) => {
        console.error(error);
        response.status(500).json({ error: error });
    });

    req.write(postData);
    req.end();
};