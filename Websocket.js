const io = require('socket.io');
const IOStream = require('./IOStream');

exports.runOn = (server) =>{
    const socketServer = io(server);
    socketServer.on('connection', (socket) => {
        console.log('User Id: '+socket.id+ ' connected');
        try{
            socket.emit('messages-data',IOStream.collectMessage());
        }catch(err){
            if(err.code === 'ENOENT'){
                socket.emit('messages-status' , {status:'No message on server'});         
            }else{
                throw new Error('Security violation'); //some line corrupted
            }
        }

        /**
         * Websocket API to display message after someone submit message on real-time 
        */
         socket.on('messages-sumbit',(data) => {
            try{
                if(IOStream.submitMessage(data.message) === true){
                    //broadcast the message if successfully written
                    socketServer.sockets.emit('messages-data',IOStream.collectMessage());
                    //send status only for the sender
                    socket.emit('messages-status' , {status:'Message Sent'});
                }else{
                    throw new Error('Security violation'); //some line corrupted
                }
            }catch(err){
                //send error only for the sender
                socket.emit('messages-status' , {status:'Sending message failed: ' + err});         
            }
        });

        /**
        * Additional: Websocket API to display message after someone delete message on real-time 
        */
        socket.on('messages-delete',() => {
            try{
                //broadcast empty message if successfulyy deleted
                socketServer.sockets.emit('messages-data',[]);
                //send status only for the sender
                socket.emit('messages-status' , {status:'No message on server'});
            }catch(error){
                //send error only for the sender
                socket.emit('messages-status' , {status:'Delete message failed: ' + err});         
            }
        });

    });
}

