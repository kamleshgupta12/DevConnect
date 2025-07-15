module.exports.getClientIp = (req) => {
    // Check for forwarded header (common with proxies)
    const forwarded = req.headers['x-forwarded-for'];
    
    // Get the client IP from the forwarded header or direct connection
    return forwarded 
        ? forwarded.split(',')[0].trim() 
        : req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
};