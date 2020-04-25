// http://127.0.0.1:9001
// http://localhost:9001

const fs = require('fs');
const path = require('path');
const url = require('url');
var httpServer = require('http');

const ioServer = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');

var PORT = 9001;
var isUseHTTPs = false;

const jsonPath = {
    config: 'config.json',
    logs: 'logs.json'
};

const BASH_COLORS_HELPER = RTCMultiConnectionServer.BASH_COLORS_HELPER;
const getValuesFromConfigJson = RTCMultiConnectionServer.getValuesFromConfigJson;
const getBashParameters = RTCMultiConnectionServer.getBashParameters;
const resolveURL = RTCMultiConnectionServer.resolveURL;

var config = getValuesFromConfigJson(jsonPath);
config = getBashParameters(config, BASH_COLORS_HELPER);

// if user didn't modifed "PORT" object
// then read value from "config.json"
if(PORT === 9001) {
    PORT = config.port;
}
if(isUseHTTPs === false) {
    isUseHTTPs = config.isUseHTTPs;
}

function serverHandler(request, response) {
    // to make sure we always get valid info from json file
    // even if external codes are overriding it
    config = getValuesFromConfigJson(jsonPath);
    config = getBashParameters(config, BASH_COLORS_HELPER);
    // console.log("*************");
    // console.log(config);
    // console.log("*************");

    // HTTP_GET handling code goes below
    try {
        var uri, filename;

        try {
            if (!config.dirPath || !config.dirPath.length) {
                config.dirPath = null;
            }

            uri = url.parse(request.url).pathname;
     
            filename = path.join(config.dirPath ? resolveURL(config.dirPath) : process.cwd(), uri);
        } catch (e) {
            pushLogs(config, 'url.parse', e);
        }

        filename = (filename || '').toString();
        //console.log(filename);

        if(uri=='/uploadFile'){
            uploadFile(request,response);
            //redirect('/admin');
        }
        if(uri=='/showd'){
            showd(request,response);
            //redirect('/admin');
        }

        if (request.method !== 'GET' || uri.indexOf('..') !== -1) {
            try {
                response.writeHead(401, {
                    'Content-Type': 'text/plain'
                });
                response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(config, '!GET or ..', e);
            }
        }

        if(filename.indexOf(resolveURL('/admin/')) !== -1 && config.enableAdmin !== true) {
            try {
                response.writeHead(401, {
                    'Content-Type': 'text/plain'
                });
                response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(config, '!GET or ..', e);
            }
            return;
        }

        var matched = false;
        ['/demos/', '/dev/', '/dist/', '/socket.io/', '/node_modules/canvas-designer/', '/admin/','/home'].forEach(function(item) {
            if (filename.indexOf(resolveURL(item)) !== -1) {
                matched = true;
            }
        });

        // files from node_modules
        ['RecordRTC.js', 'FileBufferReader.js', 'getStats.js', 'getScreenId.js', 'adapter.js', 'MultiStreamsMixer.js'].forEach(function(item) {
            if (filename.indexOf(resolveURL('/node_modules/')) !== -1 && filename.indexOf(resolveURL(item)) !== -1) {
                matched = true;
            }
        });

        if (filename.search(/.js|.json/g) !== -1 && !matched) {
            try {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            } catch (e) {
                pushLogs(config, '404 Not Found', e);
            }
        }

        ['Video-Broadcasting', 'Screen-Sharing', 'Switch-Cameras'].forEach(function(fname) {
            try {
                if (filename.indexOf(fname + '.html') !== -1) {
                    filename = filename.replace(fname + '.html', fname.toLowerCase() + '.html');
                }
            } catch (e) {
                pushLogs(config, 'forEach', e);
            }
        });

        var stats;

        try {
            stats = fs.lstatSync(filename);

            if (filename.search(/demos/g) === -1 && filename.search(/admin/g) === -1 && stats.isDirectory() && config.homePage === '/demos/index.html') {
                if (response.redirect) {
                    response.redirect('/admin/');
                } else {
                    response.writeHead(301, {
                        'Location': '/demos/'
                    });
                }
                response.end();
                return;
            }
        } catch (e) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        try {
            if (fs.statSync(filename).isDirectory()) {
                response.writeHead(404, {
                    'Content-Type': 'text/html'
                });

                if (filename.indexOf(resolveURL('/demos/MultiRTC/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/MultiRTC/'), '');
                    filename += resolveURL('/demos/MultiRTC/index.html');
                } else if (filename.indexOf(resolveURL('/admin/')) !== -1) {
                    filename = filename.replace(resolveURL('/admin/'), '');
                    filename += resolveURL('/admin/index.html');
                } else if (filename.indexOf(resolveURL('/demos/dashboard/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/dashboard/'), '');
                    filename += resolveURL('/demos/dashboard/index.html');
                } else if (filename.indexOf(resolveURL('/demos/video-conference/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/video-conference/'), '');
                    filename += resolveURL('/demos/video-conference/index.html');
                } else if (filename.indexOf(resolveURL('/demos')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/'), '');
                    filename = filename.replace(resolveURL('/demos'), '');
                    filename += resolveURL('/demos/index.html');
                }
                else if (filename.indexOf(resolveURL('/home/')) !== -1) {
                    filename = filename.replace(resolveURL('/home/'), '');
                    filename += resolveURL('/home/index.html');
                }
                 else {
                    filename += resolveURL(config.homePage);
                }
            }
        } catch (e) {
            pushLogs(config, 'statSync.isDirectory', e);
        }

        var contentType = 'text/plain';
        if (filename.toLowerCase().indexOf('.html') !== -1) {
            contentType = 'text/html';
        }
        if (filename.toLowerCase().indexOf('.css') !== -1) {
            contentType = 'text/css';
        }
        if (filename.toLowerCase().indexOf('.png') !== -1) {
            contentType = 'image/png';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }

            try {
                file = file.replace('connection.socketURL = \'/\';', 'connection.socketURL = \'' + config.socketURL + '\';');
            } catch (e) {}

            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, 'binary');
            response.end();
        });
    } catch (e) {
        pushLogs(config, 'Unexpected', e);

        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('404 Not Found: Unexpected error.\n' + e.message + '\n\n' + e.stack);
        response.end();
    }
}

var httpApp;

if (isUseHTTPs) {
    httpServer = require('https');

    // See how to use a valid certificate:
    // https://github.com/muaz-khan/WebRTC-Experiment/issues/62
    var options = {
        key: null,
        cert: null,
        ca: null
    };

    var pfx = false;

    if (!fs.existsSync(config.sslKey)) {
        console.log(BASH_COLORS_HELPER.getRedFG(), 'sslKey:\t ' + config.sslKey + ' does not exist.');
    } else {
        pfx = config.sslKey.indexOf('.pfx') !== -1;
        options.key = fs.readFileSync(config.sslKey);
    }

    if (!fs.existsSync(config.sslCert)) {
        console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCert:\t ' + config.sslCert + ' does not exist.');
    } else {
        options.cert = fs.readFileSync(config.sslCert);
    }

    if (config.sslCabundle) {
        if (!fs.existsSync(config.sslCabundle)) {
            console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCabundle:\t ' + config.sslCabundle + ' does not exist.');
        }

        options.ca = fs.readFileSync(config.sslCabundle);
    }

    if (pfx === true) {
        options = {
            pfx: sslKey
        };
    }

    httpApp = httpServer.createServer(options, serverHandler);
} else {
    httpApp = httpServer.createServer(serverHandler);
}

RTCMultiConnectionServer.beforeHttpListen(httpApp, config);
httpApp = httpApp.listen(process.env.PORT || PORT, process.env.IP || "0.0.0.0", function() {
    RTCMultiConnectionServer.afterHttpListen(httpApp, config);
});

// --------------------------
// socket.io codes goes below


// app.post('/updateLives',(req,res) => {
//     lives = req.body.rooms;
//     console.log(lives);
// });

// app.post('/getLives',(req,res) => {
//     res.send(lives);
//     console.log(lives);
// });

ioServer(httpApp).on('connection', function(socket) {
    RTCMultiConnectionServer.addSocket(socket, config);

    // ----------------------
    // below code is optional

    const params = socket.handshake.query;

    if (!params.socketCustomEvent) {
        params.socketCustomEvent = 'custom-message';
    }

    socket.on(params.socketCustomEvent, function(message) {
        socket.broadcast.emit(params.socketCustomEvent, message);
    });
});


function uploadFile(request, response) {
    console.log("parse a file upload");
    var mime = require('mime');
    var formidable = require('formidable');
    var util = require('util');
    var form = new formidable.IncomingForm();
    console.log("***************");
    console.log(__dirname);
    var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';

    form.uploadDir = __dirname + dir;
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.maxFields = 1000;
    form.multiples = false;

    form.parse(request, function(err, fields, files) {
        var file = util.inspect(files);
        console.log(file);
        // files.map(file => {
        //     console.log(file)
        //   })
        //response.writeHead(200, getHeaders('Content-Type', 'application/json'));
        //console.log(file);
        // var fileName = file.split('path:')[1].split('\',')[0].split(dir)[1].toString().replace(/\\/g, '').replace(/\//g, '');
        // var fileURL = 'http://' + app.address + ':' + port + '/uploads/' + fileName;
        // console.log('fileURL: ', fileURL);
        // response.write(JSON.stringify({
        //     fileURL: fileURL
        // }));
        // response.end();
    });
    //response.redirect('/admin');
}

// function showd(request,response)
// {
//     console.log("1111");
//     console.log(__dirname);
//     var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';
//     var d=__dirname+dir;
//     console.log(d);
//     fs.readdir(d, function (err, files) {
//         //handling error
//         if (err) {
//             return console.log('Unable to scan directory: ' + err);
//         } 
//         //listing all files using forEach
//         //response.redirect('/admin/intdex.html?d='+files);
//         response.write(JSON.stringify({
//                 file: files
//             }));
//             response.end();
//     });
//     //response.writeHead(200, getHeaders('Content-Type', 'application/json'));
//     // console.log("11");
//     // response.write(JSON.stringify({
//     //     file: "hello"
//     // }));
//     // response.end();
// }
