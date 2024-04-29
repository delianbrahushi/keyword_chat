
import React, {useState} from "react";
import './Chatbot.css';

import {Header} from "./Header";
import {MessageArea} from "./MessageArea";

import {io} from "socket.io-client";
const socket = io();

function Chatbot() {
    let answerID = 0;
    const [messages, setMessages] = useState([
        {}]);
    let [serverResponse, setServerResponse] = useState("");

    const messageList = messages.map((message, index) => ({
        ...message,
        key: index.toString(),
    }));



    function onSubmitMessage(inputText) {
        answerID = answerID + 1;
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: inputText, position: "right", id: answerID},
        ]);

        socket.emit("question", inputText); // Emit the question to the server
        socket.on("answer", (data) => {
            let answerID = data.id;
            let answerText = data.text;
            setMessages([...messages, {text: answerText, position: "left", id: answerID}])
            setServerResponse(data);
        });

    }

    return (
        <div className="Body">
            <Header />
            <div className="Full-chat-box">
                <div className="Outer-container">
                    <div className="Message-Container">
                    </div>
                    <MessageArea messages={messageList} onSubmitMessage={onSubmitMessage} serverResponse={serverResponse}/>
                </div>
            </div>
        </div>
    );
}


export default Chatbot;
