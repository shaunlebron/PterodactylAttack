var express = require('express');
var fs = require('fs');
var cp = require('child_process');

var app = express();

app.get('/img/:img', function(req,res) {
    var filename = 'img/' + req.params.img;
    fs.exists(filename, function(exists) {
        if (exists) {
            res.sendfile(filename);
        }
        else {
            res.status(404).send('file not found');
        }
    });
});

app.post('/img/:img', function (req,res) {
    var body = '';
    req.on('data', function(data) {
        body += data;
    });
    req.on('end', function() {
        fs.writeFile('img/'+req.params.img, body, function(err) {
            if (err) {
                res.status(400).send("failed to write img");
            }
            else {
				cp.exec('./build.py', function(err) {
					res.send("wrote file and built zip");
				});
            }
        });
    });
});

app.listen(3001);
