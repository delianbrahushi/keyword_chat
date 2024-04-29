const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const fs = require('fs');
const keywordQuestions = JSON.parse(fs.readFileSync('keywords.json', 'utf8'));
const PORT = process.env.PORT || 5002;

const conversationHistory = [];
let unknownMessageCount = 0;
let lastKeyword = '';

server.listen(PORT, function () {
    console.log("server started at port " + PORT);
});

app.use(express.static('public'));

let answerID = 0;

io.on("connection", (socket) => {
    console.log(`connect ${socket.id}`);

    socket.on("disconnect", (reason) => {
        console.log(`disconnect ${socket.id} due to ${reason}`);
    });

    socket.on("question", (data) => {
        console.log("received question: " + data);
        console.log(isKeyword(data))
        let fullQuestionKeywords;
        answerID += 1;
        fullQuestionKeywords = data;
        const answer = findAnswer(fullQuestionKeywords.toLowerCase());

        socket.emit("answer", { id: answerID, text: answer });
    });

    socket.on("restartConversation", () => {
        conversationHistory.length = 0;
        unknownMessageCount = 0;

        const firstMessage = "Hello, I am your FAQ JED-bot! Designed to assist you with product inquiries. From features and specifications to troubleshooting tips, our chatbot is here to ensure a seamless and informative customer experience.\n You can simply ask to : 'track your order', 'cancel your order' and many other product related features.\n You can start by 'place an order'";
        socket.emit("answer", { id: answerID + 1, text: firstMessage });
    });
});

function isKeyword(keywordsquestion){
    for (const keywordAnswer of keywordQuestions) {
        const { keywords, answers } = keywordAnswer;
        let matchCount = 0;

        for (const keyword of keywords) {
            if (keywordsquestion.includes(keyword)) {
                return true;
            }}}
}

function findAnswer(question) {
    let bestMatch = { count: 0, answer: "" };

    for (const keywordAnswer of keywordQuestions) {
        const { keywords, answers } = keywordAnswer;
        let matchCount = 0;

        for (const keyword of keywords) {
            if (question.includes(keyword)) {
                matchCount++;
                if (!conversationHistory.includes(keyword)) {
                    conversationHistory.push(keyword);
                    lastKeyword = keyword;
                } else {
                    conversationHistory.push(conversationHistory.splice(conversationHistory.indexOf(keyword), 1)[0]);
                }
            }
        }


        if (matchCount > bestMatch.count) {
            bestMatch.count = matchCount;
            if (lastKeyword === "track" && question.includes('##')){
                bestMatch.answer = answers[2];
            }
            else if (lastKeyword === "cancel" && question.includes('##')){
                bestMatch.answer = answers[2];
            }
            else{
                bestMatch.answer = getRandomAnswer(answers);
            }
            console.log(conversationHistory);
            console.log(lastKeyword);
        }
    }
    lastKeyword = conversationHistory[conversationHistory.length - 1]

    if (bestMatch.count > 0) {
        unknownMessageCount = 0;
        return bestMatch.answer;
    }

    unknownMessageCount++;
    if (unknownMessageCount >= 3) {
        unknownMessageCount = 0;

        return "Hello, I am your FAQ JED-bot! Designed to assist you with product inquiries. From features and specifications to troubleshooting tips, our chatbot is here to ensure a seamless and informative customer experience.\n You can simply ask to : 'track your order', 'cancel your order' and many other product related features.\n You can start by 'place an order'";
    }
    return "I'm sorry, but I couldn't understand your question. Can you please rephrase it?";
}

function getRandomAnswer(answers) {
    const randomIndex = Math.ceil(Math.random() * 2) - 1; // Generates either 0 or 1
    console.log(randomIndex);
    return answers[randomIndex];
}

