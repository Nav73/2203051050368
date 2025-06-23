const http = require('http');

const port = 3352;
const shortUrlMap = new Map();

function uniqueUrl(len = 5) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let res = "";
    for (let i = 0; i < len; i++) {
        const randomIdx = Math.floor(Math.random() * chars.length);
        res += chars[randomIdx];
    }
    return res;
}

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        res.statusCode = 200
        res.end('base url for url shortner')
    }
    else if (req.url === '/shorturls' && req.method === 'POST') {
        req.on('end', () => {
            try {
                const { url, validity } = JSON.parse(body);
                if (!url || !validity || validity <= 0) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Please provide a valid url and validity duration' }));
                    return;
                }
                // Check if URL is already present
                for (let [shortcode, { longUrl, validDuration }] of shortUrlMap) {
                    if (longUrl === url) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ shortcode, url: longUrl, validity: validDuration }));
                        return;
                    }
                }
                // unique shortcode 
                let shortcode;
                do {
                    shortcode = uniqueUrl();
                } while (shortUrlMap.has(shortcode));
                shortUrlMap.set(shortcode, { longUrl: url, validDuration: validity });
                res.statusCode = 201;
                res.end(JSON.stringify({ shortcode, url, validity }));
            } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    else if (req.url === '/shorturls' && req.method === 'GET') {
        const result = Array.from(shortUrlMap.entries()).map(([shortcode, { longUrl, validDuration }]) => ({
            shortcode,
            url: longUrl,
            validity: validDuration
        }));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    }
    else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log("server running on port " + port);
});
