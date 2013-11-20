var express = require('express');
var fs = require('fs');
var cp = require('child_process');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Start listening
var port = 3001;
server.listen(port);
console.log('serving on port', port);

// serves post request from Fourier (level tool)
app.post('/levels/:level', function (req,res) {
    var body = '';
    req.on('data', function(data) {
        body += data;
    });
    req.on('end', function() {
        fs.writeFile('levels/'+req.params.level, body, function(err) {
            if (err) {
                res.status(400).send("failed to write level");
            }
            else {
				cp.exec('./build.py', function(err) {
					res.send("wrote file and built zip");
				});
            }
        });
    });
});

app.post('/bg/:bg/:file', function (req,res) {
	var body = '';
	req.on('data', function(data) {
		body += data;
	});
    req.on('end', function() {
        fs.writeFile('bg/'+req.params.bg+'/'+req.params.file, body, function(err) {
            if (err) {
                res.status(400).send("failed to write level");
            }
            else {
				res.send("wrote file");
            }
        });
    });
});

// serves post request from Baklava (background tool)
app.post('/bgtool/:bg', function (req,res) {
    var body = '';
    req.on('data', function(data) {
        body += data;
    });
    req.on('end', function() {

		var origLayers;
		var newLayers = JSON.parse(body);
		var filename = 'bg/'+req.params.bg+'/layers.json';

		fs.readFile(filename,
			function(err,data) {

				// handle read errors
				if (err) {
					res.status(400).send("could not read original bg layer file");
					return;
				}

				// parse the original json layers
				origLayers = JSON.parse(data);


				// update original layers with any attributes from the new layers
				var i,len=origLayers.length;
				for (i=0; i<len; i++) {
					for (name in newLayers[i]) {
						origLayers[i][name] = newLayers[i][name];
					}
				}

				// write to file
				fs.writeFile(filename, JSON.stringify(origLayers, null, '\t'),
					function(err) {

						// handle write errors
						if (err) {
							res.status(400).send("could not write bg layer file");
							return;
						}

						// build the new cocoon zip
						cp.exec('./build.py', function(err) {
							res.send("wrote file and built zip");
						});
					}
				);
			}
		);
    });
});

// Catch all to return any file requested.
app.use(express.static(__dirname)); // Current directory is root

// Sockets
io.sockets.on('connection', function(socket) {
	socket.emit('clientlog', { msg: 'hello from server' });
	socket.on('serverlog', function(data) {
		console.log(data.msg);
	});
	socket.on('shoot', function(data) {
		console.log('shoot:',data);
		socket.broadcast.emit('shoot',data);
	});
	socket.on('net', function(data) {
		console.log('net:',data);
		socket.broadcast.emit('net',data);
	});
});
