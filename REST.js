const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const IOStream = require('./IOStream');

//initialize middlewares
app.use(
    bodyParser.json(),
    bodyParser.urlencoded({extended: true}),
    express.static(__dirname + '/public')   //publish all static page files to client
);

/**
 * Get homepage
 */
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/public/index.html');
});


//===================================== REST APIs ==============================================
/**
 * REST API to submit a message string
 */
app.post('/send',(req,res)=>{
    try{
        if(IOStream.submitMessage(`${req.body.message}`) === true){
            res.send({status:'Message Sent'});
            return;
        }else{
            throw new Error('Security violation'); //some line corrupted on submitMessage()
        }
    }catch(err){
        res.status(500).send({status:'Sending message failed: ' + err});          
    }   
});

/**
 * REST API to collect the message(s)
 */
app.get('/collect/:numbOfMessage?',(req,res)=>{
    try{
        var messageCount = null;
        if(req.params.numbOfMessage){
            messageCount = parseInt(`${req.params.numbOfMessage}`); //get n latest message
        }
        const result = IOStream.collectMessage(messageCount);
        res.json(result);
    }catch(error){
        if(error.code === 'ENOENT'){
            res.json([]);
        }else{
            res.status(500).send({status:'Error, Message could not be collected: ' +error}); 
        }          
    }  
});

/**
 * Additional feature:
 * REST API to delete all messages
 */
app.get('/delete',(req,res)=>{
    try{
        if(IOStream.deleteMessages() === true){
            res.send({status:'All Messages Deleted'}); 
        }else{
            throw new Error('Security violation');
        }
    }catch(error){
        res.status(500).send({status:'Error, Messages Not Deleted: ' +error});          
    }   
});

exports.restApp = app;