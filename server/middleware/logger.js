/**
 * Logger Middleware
 */
const logger = (req, res, next) => {
    // Record the exact time the request entered the server
    const start = Date.now();
    
    // Listen for the 'finish' event, which fires when the response is fully sent
    res.on('finish', () => {
        // Calculate how long the request took to process
        const duration = Date.now() - start;
        const date = new Date().toISOString();
        
        // Log the required details
        console.log(`[${date}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
    });
    next(); 
};

module.exports = logger;