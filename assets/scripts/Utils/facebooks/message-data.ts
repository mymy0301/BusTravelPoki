type MessageType = {
    message: any;
    bot_message_payload_elements: any[];
    schedule_interval?: number;
    payload?: any;
};

const DAILY_MESSAGE = {
    gameid: "tileFactory!",
    dataDaily: [
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "Taking a break",
            sub_text: "The traffic is piling up.Get back in the game.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        },
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "Your buses are stuck",
            sub_text: "Time to clear the jam and get them moving again.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        },
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "Can you escape this one",
            sub_text: "A new tricky puzzle awaits—test your skills now.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        },
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "Only YOU can fix this traffic chaos",
            sub_text: "Jump in and master the escape puzzle.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        },
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "A perfect lineup is waiting",
            sub_text: "Plan every move and clear the jam like a pro.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        },
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "Think you’ve mastered it all",
            sub_text: "Try this new challenge and prove your skills.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        },
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "Traffic won’t clear itself",
            sub_text: "Your passengers are waiting—get back on the road.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        },
        {
            imageUrl: "https://game.gameoki.com/playfab/assets/6ea503b7-a6a1-4173-8d6d-f0a8f99e15be-Banner_800x450.jpg",
            text: "Color sorting madness",
            sub_text: "Can you seat every passenger perfectly.",
            buttons: [
                {
                    type: "game_play",
                    title: "Play Now",
                    webview_height_ratio: "tall",
                    payload: {
                        type: "a2u",
                    },
                    url: ""
                }
            ],
        }
    ],
};

export class A2uData {
    static a2uNotification(delayTime: number) {
        let _elements = [];
        let page = DAILY_MESSAGE.dataDaily;
        let length = page.length;
        let _index = Math.floor(Math.random() * length);
        // let rd:number = Math.random();
        // if(rd< 0.5){
        //     _index = 7;
        // }else{
        //     _index = 8;
        // }
        let _data = page[_index];
        let buttonDatas = _data.buttons;
        let buttons = [];
        for (let buttonData of buttonDatas) {
            switch (buttonData.type) {
                case "web_url":
                    let _buttonWeb = {
                        type: buttonData.type,
                        title: buttonData.title,
                        url: buttonData.url,
                    };
                    buttons.push(_buttonWeb);
                    break;
                case "game_play":
                    if (buttonData.payload) {
                        var payload = JSON.parse(
                            JSON.stringify(buttonData.payload)
                        );
                        payload.time = Date.now() + delayTime * 1000;
                        payload.index = _index;
                    }
                    let _buttonPlay = {
                        type: buttonData.type,
                        title: buttonData.title,
                        payload: payload ? JSON.stringify(payload) : "{}",
                    };
                    buttons.push(_buttonPlay);
                    break;
                default:
                    break;
            }
        }

        _elements.push({
            title: _data.text,
            subtitle: _data.sub_text,
            image_url: _data.imageUrl,
            buttons: buttons,
        });

        let element = _elements[0];
        if (delayTime > 0) {
            var messageData: MessageType = {
                message: {
                    title: element.title,
                    body: element.subtitle,
                    media_url: element.image_url,
                },
                payload: buttons[0].payload,
                schedule_interval: delayTime,
                bot_message_payload_elements: _elements,
            };
        } else {
            messageData = {
                message: {
                    title: element.title,
                    body: element.subtitle,
                    media_url: element.image_url,
                },
                payload: buttons[0].payload,
                bot_message_payload_elements: _elements,
            };
        }

        return messageData;
    }
}
