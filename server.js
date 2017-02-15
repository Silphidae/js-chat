var express = require('express');
var app = express();
var server = require('http').createServer(app);

// Configuration
var PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('app'));

// Add socket.io
require('./socket').listen(server);

// Start server
server.listen(PORT, function() {
    console.log('Listening on port ' + PORT + ' in %s mode', app.settings.env);
});
