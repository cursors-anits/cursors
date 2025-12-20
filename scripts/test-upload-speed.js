const fs = require('fs');
const path = require('path');
const http = require('http');

async function testUpload() {
    console.log('--- Vibe Coding Upload Speed Test ---');

    // 1. Create a dummy 5MB file buffer
    const fileSize = 5 * 1024 * 1024; // 5MB
    const buffer = Buffer.alloc(fileSize, 'a');

    console.log(`Generating synthetic 5MB payload...`);

    const boundary = '----WebKitFormBoundarytest' + Math.random().toString(16);
    const teamId = 'VIBE-001'; // Dummy

    const header = `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="teamId"\r\n\r\n` +
        `${teamId}\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n` +
        `Content-Type: image/jpeg\r\n\r\n`;

    const footer = `\r\n--${boundary}--\r\n`;

    const totalLength = header.length + buffer.length + footer.length;

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/participant/avatar',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': totalLength
        }
    };

    console.log(`Starting upload to http://localhost:3000/api/participant/avatar...`);
    const startTime = Date.now();

    const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        res.on('end', () => {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            const speed = (fileSize / 1024 / 1024 / duration).toFixed(2);

            console.log('\n--- Results ---');
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Time Taken: ${duration} seconds`);
            console.log(`Upload Speed: ${speed} MB/s`);
            console.log(`Response: ${responseData}`);
            console.log('----------------\n');
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    // Write form data
    req.write(header);
    req.write(buffer);
    req.write(footer);
    req.end();
}

testUpload().catch(console.error);
