'use strict';

const element = React.createElement;
const INITIAL_MESSAGE = 'Type your message here...';
const webSocket = io();

class ClientApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      message: INITIAL_MESSAGE,
      numOfMessage:1,
      messageFetched:null,
      realTimeMessages:null,
      messageStatus:'',
      messageFetchedErrorStatus:''
     };
  }

  componentDidMount(){
    webSocket.on('messages-data', (data) => {
      this.setState({realTimeMessages:data})
    })
    webSocket.on('messages-status',(resp) =>{
      this.setState({messageStatus: resp.status});
    })
  }

  handleFocusMessage = () => {
    this.setState({message:'', messageStatus:''});
  }

   handleChangeNumber= (event) => {
    this.setState({numOfMessage: event.target.value});
  }

  handleChangeMessage = (event) =>{
    this.setState({message: event.target.value});
  }

  handleSubmitMessage = (event) => {
    event.preventDefault();
    if(this.state.message === INITIAL_MESSAGE){
      this.setState({ messageStatus:'Please write by yourself'});
    }else{
      fetch('/send',{
        method  : 'POST',
        headers : {"Content-Type": "application/json"},
        body    : JSON.stringify({ message : this.state.message})          
      }).then((resp) => {
        return resp.clone().json();
      }).then((respData) => {
        this.setState({message: INITIAL_MESSAGE, messageStatus:respData.status});
      });
    }
  }

  handleRealTimeSubmit = (event) => {
    event.preventDefault();
    if(this.state.message === INITIAL_MESSAGE){
      this.setState({ messageStatus:'Please write by yourself'});
    }else{
      webSocket.emit('messages-sumbit',{ message : this.state.message});
    }
  }

  handleGetMessages = (event,numOfMessage) =>{
    event.preventDefault();
    let fetchUrl = '/collect'
    if(numOfMessage){
      fetchUrl += `/${numOfMessage}`
    }
    fetch(fetchUrl,{
      method  : 'GET',
      headers : {"Content-Type": "application/json"},
    }).then((resp) => {
        return resp.clone().json();
    }).then((respData) => {
        if(respData){
          this.setState({messageFetched:respData});
        }
    });
  }

  handleDeleteMessages = (event) =>{
    event.preventDefault();
    fetch('/delete',{
      method  : 'GET',
      headers : {"Content-Type": "application/json"},
    }).then((resp) => {
      return resp.clone().json();
    }).then((respData) => {
      alert(respData.status);
      webSocket.emit('messages-delete');
    });
  }

  render() {
    return element(
      'div',null,
        [
          element('h2',null,'#1 REST - Sending a Message'),
          element(
            'textarea', 
            {
              value : this.state.message, rows: 5, cols: 100, 
              onFocus:this.handleFocusMessage, onChange : this.handleChangeMessage
            }
          ), 
          element('br'),
          element(
            'button', {onClick : this.handleSubmitMessage}, 'Submit'
          ),
          "\u00a0","\u00a0","\u00a0",
          element(
            'button', {onClick : this.handleRealTimeSubmit}, 'Submit (Real Time)'
          ),
          "\u00a0","\u00a0","\u00a0",
          this.state.messageStatus,
          element('br'),
          element('hr'),  
          element('h2',null,'#2 REST - Getting Messages'),
          element(
            'form', 
            {onSubmit : (event) => this.handleGetMessages(event, this.state.numOfMessage)},
            [
              'Number of messages: ',
              element('input', {
                type : 'number', value : this.state.numOfMessage,
                onChange: this.handleChangeNumber
              }),
              element('input', {type : 'submit', value: 'Get'})
            ]     
          ),
          'or',
          element('br'),
          element('button',{onClick: (event) => this.handleGetMessages(event,null)},'Get all messages'),
          this.state.messageFetchedErrorStatus,
          element('h3',null,
            [
              'Messages',
              "\u00a0","\u00a0","\u00a0",
              element('button',{onClick: this.handleDeleteMessages},'Delete All')
            ]
          ),
          element('ul',null,
              this.state.messageFetched !== null?
                this.state.messageFetched.map((data)=>(
                  element('li',{key : data.id}, data.message)
                )) 
                : null
          ),
          element('hr'),  
          element('h2',null,'#3 Websocket - Real Time Messages'),
          element('ul',null,
          this.state.realTimeMessages !== null?
            this.state.realTimeMessages.map((data)=>(
              element('li',{key : data.id}, data.message)
            )) 
            : null
      ),
        ]
    );
  }
}

const domContainer = document.querySelector('#client-app');
ReactDOM.render(element(ClientApp), domContainer);