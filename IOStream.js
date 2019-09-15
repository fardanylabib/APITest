const FILE_PATH = '.\\data\\messages.txt';
const fileSystem = require('fs');

/**
 * method to save the message to server
 * @param {string} message 
 */
exports.submitMessage = (message) => {
    if(message.length < 1){
        throw new Error('Message can not be empty');
    }
    message += '|'; //set message boundary
    fileSystem.appendFileSync(FILE_PATH,message); 
    return true;
}

/**
 * method to collect messages saved in server
 * @param {number} numberOfMessages 
 */
exports.collectMessage = (numberOfMessages) => {
    const messages = fileSystem.readFileSync(FILE_PATH).toString();
    let messageArray = messages.split('|');
    messageArray.pop(); //highest index of messageArray contains empty string, so it shall be deleted
    let messageCount;
    if(numberOfMessages === null || numberOfMessages === undefined){
        messageCount = messageArray.length; //get all message if parameter is null
    }else{
        messageCount = numberOfMessages; //get n latest message
        if(messageCount > messageArray.length){
            messageCount = messageArray.length; //if overflow, send the maximum number
        }else if(messageCount < 0){
            throw new Error('Negative number of message');
        }
    }
    const lastMessageIndex = messageArray.length-messageCount;
    let result = [];
    for(let i = messageArray.length-1 ; i >= lastMessageIndex ; i--){
        result.push({'id': i, 'message':messageArray[i]});
    }
    return result;
}

exports.deleteMessages = () => {
    //delete the saved file
    fileSystem.unlinkSync(FILE_PATH);
    return true;
}