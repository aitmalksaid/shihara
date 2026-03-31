const http = require('http');

const endpoints = [
    '/api/produits-chimiques',
    '/api/stock-chimique',
    '/api/consommations-chimiques',
    '/api/recettes'
];

function testEndpoint(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode === 200) {
                        console.log(`✅ Success ${path}: ${Array.isArray(json) ? json.length + ' items' : 'OK'}`);
                    } else {
                        console.log(`❌ Error ${res.statusCode} ${path}:`, json);
                    }
                } catch (e) {
                    console.log(`❌ Invalid JSON ${path}:`, data.substring(0, 100));
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`🔥 Connection Failed ${path}:`, err.message);
            resolve();
        });

        req.end();
    });
}

async function runTests() {
    for (const path of endpoints) {
        await testEndpoint(path);
    }
}

runTests();
