const talkNow = new Audio();
talkNow.src = "./static/talk.mp3";
talkNow.load();

const app = new Vue({
    el: "#voiceApp",
    data: {
        all_commands: [],
        recognized_text: null,
        coords: {
            lat: null,
            lng: null
        },
        key: {
            darksky: "", //https://darksky.net/dev/
            google: "",
            wordnik: "", //http://developer.wordnik.com/
            omdb: "" //http://www.omdbapi.com/
        },
        news_link: null
    },
    created() {
        const self = this;
        this.getLocation();
        this.startOneCommandArtyom()
        setTimeout(() => {
            voiceCommands.forEach(c => {
                c.indexes.forEach(command => {
                    self.all_commands.push({
                        name: command
                    })
                })
            })
        }, 0)
    },
    methods: {
        getLocation() {
            const self = this;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function showPosition(position) {
                    self.coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                });
            } else {
                console.log("Geolocation is not supported by this browser.");
            }
        },
        startOneCommandArtyom() {
            const self = this;
            artyom.fatality(); // use this to stop any of

            setTimeout(() => { // if you use artyom.fatality , wait 250 ms to initialize again.
                artyom.initialize({
                    lang: "en-US", // A lot of languages are supported. Read the docs !
                    continuous: false, // recognize 1 command and stop listening !
                    obeyKeyword: "Alexa", // start obeying
                    listen: true, // Start recognizing
                    debug: true, // Show everything in the console
                    speed: 0.9 // talk normally
                }).then(() => {
                    //artyom.dontObey();
                    axios.get('http://robertsoriano.com').then(response => {
                        artyom.dontObey();
                        //talkNow.play()
                        artyom.redirectRecognizedTextOutput((recognized, isFinal) => {
                            if (isFinal) {
                                if(recognized == "Alexa") {
                                    self.recognized_text = "waiting for command...";
                                } else {
                                    self.recognized_text = recognized;
                                }
                                
                            }
                        });
                    }).catch(err => {
                        deliver("Voice assistant needs internet connection.");
                    })
                });
            }, 250);
        }
    }
});