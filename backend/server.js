const http = require('http');
const url = require('url');
require('dotenv').config();

const postController = require('./controllers/postController');
const { sendJson } = postController;

const PORT = process.env.PORT || 5000;

// Helper to parse JSON request bodies natively in Node.js
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            // Prevent payload abuse (> 1MB)
            if (body.length > 1e6) {
                req.destroy();
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body || body.trim() === '') {
                return resolve({});
            }
            try {
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch (err) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// Pure Node.js HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = (parsedUrl.pathname || '/').replace(/\/+$/, '') || '/';
    const method = req.method.toUpperCase();

    // CORS Headers for cross-origin frontend requests
    const origin = process.env.FRONTEND_URL || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

    try {
        // Health check endpoint
        if (pathname === '/api/health' && method === 'GET') {
            return sendJson(res, 200, {
                status: 'ok',
                message: 'Developer Blog API (Pure Node.js) is running smoothly'
            });
        }

        // GET /api/posts - Get all blog posts
        if (pathname === '/api/posts' && method === 'GET') {
            return await postController.getAllPosts(req, res);
        }

        // POST /api/posts - Create a new blog post
        if (pathname === '/api/posts' && method === 'POST') {
            const body = await parseJsonBody(req);
            return await postController.createPost(req, res, body);
        }

        // Match /api/posts/:id
        const postDetailMatch = pathname.match(/^\/api\/posts\/(\d+)$/);
        if (postDetailMatch) {
            const id = postDetailMatch[1];

            if (method === 'GET') {
                return await postController.getPostById(req, res, id);
            }
            if (method === 'PUT') {
                const body = await parseJsonBody(req);
                return await postController.updatePost(req, res, id, body);
            }
            if (method === 'DELETE') {
                return await postController.deletePost(req, res, id);
            }
        }

        // Fallback 404 handler for undefined API routes
        return sendJson(res, 404, { message: 'API route not found' });
    } catch (err) {
        console.error('Unhandled server error:', err);
        if (err.message === 'Invalid JSON') {
            return sendJson(res, 400, { message: 'Invalid JSON body provided' });
        }
        if (err.message === 'Payload too large') {
            return sendJson(res, 413, { message: 'Request payload is too large' });
        }
        return sendJson(res, 500, { message: 'An unexpected error occurred on the server' });
    }
});

// Start Pure Node.js Server
server.listen(PORT, () => {
    console.log(`🚀 Pure Node.js Blog API running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints available under http://localhost:${PORT}/api/posts`);
});

