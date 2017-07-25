'use strict;'

let express = require('express');
let app = express();
let server = require('http').createServer(app);

// Configuration
const PORT = process.env.PORT || 3000;

// Serve static files
app.use('/scripts', express.static(__dirname + '/node_modules/'));
app.use(express.static(__dirname + '/app'));
app.get('*', function(req, res) {
	res.sendFile( __dirname + 'index.html');
});

// Add socket.io
require('./socket').listen(server);

// Start server
server.listen(PORT, function() {
    console.log('Listening on port ' + PORT + ' in %s mode', app.settings.env);
});
