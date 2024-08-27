const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

app.listen(process.env.PORT, () => {
    console.log("webhook is listening");
});

// Verify the webhook URL
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send("Forbidden");
        }
    }
});

// Handle incoming messages
app.post("/webhook", (req, res) => {
    let body_param = req.body;

    console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object) {
        if (body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {
            let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body.toLowerCase();

            console.log("phone number " + phon_no_id);
            console.log("from " + from);
            console.log("body param " + msg_body);

            if (msg_body === "option1") {
                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v13.0/" + phon_no_id + "/messages?access_token=" + token,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        type: "interactive",
                        interactive: {
                            type: "button",
                            body: {
                                text: "You chose Option 1. Now choose one of the following:"
                            },
                            action: {
                                buttons: [
                                    {
                                        type: "reply",
                                        reply: {
                                            id: "next_button1",
                                            title: "Next Button 1"
                                        }
                                    },
                                    {
                                        type: "reply",
                                        reply: {
                                            id: "next_button2",
                                            title: "Next Button 2"
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            } else if (msg_body === "option2") {
                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v13.0/" + phon_no_id + "/messages?access_token=" + token,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        text: {
                            body: "You chose Option 2. Here's your custom message."
                        }
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            } else {
                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v13.0/" + phon_no_id + "/messages?access_token=" + token,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        text: {
                            body: "Please choose a valid option."
                        }
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            }

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
});

// Test route
app.get("/", (req, res) => {
    res.status(200).send("hello this is webhook setup");
});
