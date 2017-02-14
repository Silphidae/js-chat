var express = require('express');
var app = express();

// Configuration
var PORT = process.env.PORT || 3000;

// Start server
var server = app.listen(PORT, function() {
    console.log('Listening on port ' + PORT + ' in %s mode', app.settings.env);
});

// Add socket.io
require('./socket').listen(server);


// some routing
app.get('/', function(req, res) {
    res.send('Chat backend.');
});

