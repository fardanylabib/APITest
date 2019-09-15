const restApp   = require('./REST').restApp;
const webSocket = require('./Websocket');
const server    = require('http').createServer(restApp); // set REST APIs on server

//run websocket
webSocket.runOn(server);

//server port
const PORT = 8081;
//run the server
server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});


