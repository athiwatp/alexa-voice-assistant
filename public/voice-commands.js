function deliver(message) {
    artyom.say(message, {
        onStart() {
            artyom.dontObey();
        },
        onEnd() {
            app.startOneCommandArtyom();
        }
    });
}

function dateAndTime(format) {
    return moment().format(format);
}

function externalAccess(url, success) {
    return axios.get(url).then(success, error => {
        deliver("An error occured. Perhaps your internet connection?");
    })
}

const self = this;

const voiceCommands = [{
        description: "Basic Commands",
        indexes: ["mute", "unmute", "stop", "shut up"],
        action(i) {
            if (i == 0) {
                artyom.dontObey();
            } else if (i == 1) {
                artyom.obey();
            } else if (i == 2 || i == 3) {
                artyom.fatality();
            }
        }
    },
    {
        description: "Date and time",
        indexes: ["what time is it", "what's the date", "what's the complete date and time"],
        action(i) {
            if (i == 0) {
                deliver(`It's ${dateAndTime('LT')}`);
            } else if (i == 1) {
                deliver(`Today is, ${dateAndTime('LL')}`);
            } else if (i == 2) {
                deliver(`Today is, ${dateAndTime('LLLL')}`);
            }
        }
    },
    {
        description: "Play some games",
        indexes: ["play rock paper scissors", "flip a coin"],
        action(i) {
            if (i == 0) {
                var items = ["rock", "paper", "scissors"];
                var item = items[Math.floor(Math.random() * items.length)];
                deliver(`Okay, let's play. Three, two, one. ${item}`);
            } else if (i == 1) {
                var items = ["heads", "tails"];
                var item = items[Math.floor(Math.random() * items.length)];
                setTimeout(() => {
                    deliver(item);
                }, 500)
            }
        }
    },
    {
        description: "Jokes and quotes",
        indexes: ["tell me a yo momma joke", "tell me a yo mama joke", "tell me a chuck norris joke", "tell me something Donald Trump said", "tell me a random quote", "tell me another random quote"],
        action(i) {
            if (i == 0 || i == 1) {
                externalAccess("http://api.yomomma.info/", response => {
                    deliver(response.data.joke);
                });
            } else if (i == 2) {
                externalAccess("https://api.chucknorris.io/jokes/random", response => {
                    deliver(response.data.value);
                });
            } else if (i == 3) {
                externalAccess("https://api.tronalddump.io/random/quote", response => {
                    deliver(response.data.value);
                });
            } else if (i == 4 || i == 5) {
                externalAccess("https://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=en", response => {
                    const quote = response.data;
                    deliver(`Here's a quote from ${quote.quoteAuthor}.`);
                    deliver(quote.quoteText);
                });
            }
        }
    },
    {
        description: "Easter eggs",
        indexes: ["how old are you", "what's your height", "did you eat already", "i want the truth", "tell me about yourself"],
        action(i) {
            if (i == 0) {
                deliver("I was programmed today.");
            } else if (i == 1) {
                deliver("I'm about 1 inch.");
            } else if (i == 2) {
                deliver("I ate the battery.");
            } else if (i == 3) {
                deliver("You're very handsome.");
            } else if (i == 4) {
                deliver("I am a virtual assistant programmed by Mr. Robert Soriano.");
            }
        }
    },
    {
        description: "Fight Club",
        indexes: ["what's the * rule of fight club", "* rule of fight club"],
        smart: true,
        action(i, wildcard) {
            if (wildcard == "first" || wildcard == "second") {
                deliver("You do not talk about FIGHT CLUB.");
            } else if (wildcard == "third") {
                deliver(`If someone says "stop" or goes limp, taps out the fight is over.`);
            } else if (wildcard == "fourth") {
                deliver("Only two guys to a fight.");
            } else if (wildcard == "fifth") {
                deliver("One fight at a time.");
            } else if (wildcard == "sixth") {
                deliver("No shirts, no shoes.");
            } else if (wildcard == "seventh") {
                deliver("Fights will go on as long as they have to.");
            } else if (wildcard == "8th") {
                deliver("If this is your first night at FIGHT CLUB, you HAVE to fight.");
            }
        }
    },
    {
        description: "Smart Easter eggs",
        indexes: ["check the gender of *"],
        smart: true,
        action(i, wildcard) {
            if (i == 0) {
                externalAccess(`https://api.genderize.io/?name=${wildcard}`, response => {
                    deliver(`${wildcard} is a ${response.data.gender}`);
                });
            }
        }
    },
    {
        description: "News and weather",
        indexes: ["what's the weather like", "what's the weather", "will it rain today", "will I need an umbrella today", "popular news from new york times", "navigate to link of news"],
        action(i) {
            if (i == 0 || i == 1) {
                externalAccess(`https://api.darksky.net/forecast/${app.key.darksky}/${app.coords.lat},${app.coords.lng}`, darkskyResponse => {
                    externalAccess(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${app.coords.lat},${app.coords.lng}&key=${app.key.google}`, googleResponse => {
                        const g = googleResponse.data;
                        const d = darkskyResponse.data;
                        console.log(g)
                        deliver(`Currently, in ${g.results[2].formatted_address} it's ${d.currently.temperature} degrees with a humidity of ${d.currently.humidity} and windspeed of ${d.currently.windSpeed}. ${d.currently.summary}.`);
                    })
                });
            } else if (i == 2 || i == 3) {
                externalAccess(`https://api.darksky.net/forecast/${app.key.darksky}/${app.coords.lat},${app.coords.lng}`, darkskyResponse => {
                    const d = darkskyResponse.data;
                    let answer = false;
                    d.hourly.data.forEach(h => {
                        if (h.icon == "rain") {
                            answer = true;
                            return false;
                        }
                    })
                    if (answer) {
                        deliver("I believe it will rain today.");
                    } else {
                        deliver("There will be no rain tonight.");
                    }
                })
            } else if(i == 4) {
                let url = "https://api.nytimes.com/svc/mostpopular/v2/mostemailed/World/1.json";
                url += "?api-key=16f6c6e8585745cb84d83b25ca3ab69f"
                externalAccess(url, response => {
                    const newsData = response.data.results[0];
                    self.news_link = newsData.url;
                    deliver(`I got an article ${newsData.byline} titled ${newsData.title}. Please say navigate to link of news to view more.`);
                });
            } else if(i == 5) {
                if(!self.news_link) {
                    deliver("Please say popular news from new york times so that I can give you a link");
                } else {
                    const redirectWindow = window.open(news_link, '_blank');
                    redirectWindow.location;
                    self.news_link = null;
                    app.startOneCommandArtyom();
                }
            }
        }
    },
    {
        description: "Search",
        indexes: ["wikipedia *", "how many people live in *"],
        smart: true,
        action(i, wildcard) {
            if (i == 0) {
                externalAccess(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${wildcard}&format=json`, response => {
                    deliver(response.data[2][0]);
                });
            } else if (i == 1) {
                const country = wildcard.charAt(0).toUpperCase() + wildcard.slice(1).toLowerCase();
                externalAccess(`http://api.population.io/1.0/population/${country}/2017-06-16/`, response => {
                    deliver(`The population in ${wildcard} is ${response.data.total_population.population.toString()}`);
                });
            }
        }
    },
    {
        description: "Definition and spelling",
        indexes: ["definition of *", "what's an *", "what is a *", "what is an *", "how do you spell *"],
        smart: true,
        action(i, wildcard) {
            if (i == 4) {
                for (var i = 0; i < wildcard.length; i++) {
                    deliver(wildcard.charAt(i));
                }
            } else {
                externalAccess(`http://api.wordnik.com:80/v4/word.json/${wildcard}/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=${app.key.wordnik}`, response => {
                    deliver(response.data[0].text);
                });
            }
        }
    },
    {
        description: "Science",
        indexes: ["where's the International Space Station", "how many people are there in space right now", "how many people are there in space", "who are the people in space right now", "where's the recent earthquake", "current position of the international space station"],
        action(i) {
            if (i == 0) {
                externalAccess(`http://api.open-notify.org/iss-now.json`, issRes => {
                    const iss = issRes.data.iss_position;
                    externalAccess(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${iss.latitude},${iss.longitude}&key=${app.key.google}`, googleResponse => {
                        const g = googleResponse.data;
                        deliver(`The international space station's current location is in ${g.results[3].formatted_address}`)
                    })
                });
            } else if (i == 1 || i == 2) {
                externalAccess(`http://api.open-notify.org/astros.json`, issRes => {
                    const people = issRes.data.number;
                    deliver(`There are ${people} people in space right now.`);
                });
            } else if (i == 3) {
                externalAccess(`http://api.open-notify.org/astros.json`, issRes => {
                    const people = issRes.data;
                    deliver(`There are ${people.number} people in space right now.`);
                    people.people.forEach(p => {
                        deliver(`${p.name}, which is in ${p.craft} craft`);
                    })
                });
            } else if (i == 4) {
                externalAccess(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2017-06-15&endtime=2017-06-16`, eqRes => {
                    const eq = eqRes.data.features[0].properties;
                    deliver(`There was an earthquake in ${eq.place} with a magnitude of ${eq.mag}.`);
                });
            } else if (i == 5) {
                externalAccess(`http://api.open-notify.org/iss-now.json`, issRes => {
                    const iss = issRes.data.iss_position;
                    deliver(`The coordinates are ${iss.latitude} and ${iss.longitude}`);
                });
            }
        }
    },
    {
        description: "Entertainment and food",
        indexes: ["tell me about the movie *", "what's the IMDb rating of *", "rotten tomatoes rating of *", "metacritic rating of *", "tell me the plot of *", "how much did the * make", "how much did the * movie make"],
        smart: true,
        action(i, wildcard) {
            if (i == 0) {
                externalAccess(`http://www.omdbapi.com/?t=${wildcard}&apikey=${app.key.omdb}`, omdbRes => {
                    const movie = omdbRes.data;
                    deliver(`The movie ${wildcard} was released on ${movie.Released} starring ${movie.Actors} directed by ${movie.Director}.`);
                });
            } else if (i == 1) {
                externalAccess(`http://www.omdbapi.com/?t=${wildcard}&apikey=${app.key.omdb}`, omdbRes => {
                    const movie = omdbRes.data;
                    deliver(`The IMDB rating of ${wildcard} is ${movie.imdbRating}.`);
                });
            } else if (i == 2) {
                externalAccess(`http://www.omdbapi.com/?t=${wildcard}&apikey=${app.key.omdb}`, omdbRes => {
                    const movie = omdbRes.data;
                    deliver(`The Rotten Tomatoes rating of ${wildcard} is ${movie.Ratings[1].Value}.`);
                });
            } else if (i == 3) {
                externalAccess(`http://www.omdbapi.com/?t=${wildcard}&apikey=${app.key.omdb}`, omdbRes => {
                    const movie = omdbRes.data;
                    deliver(`The Metacritic rating of ${wildcard} is ${movie.Ratings[2].Value}.`);
                });
            } else if (i == 4) {
                externalAccess(`http://www.omdbapi.com/?t=${wildcard}&apikey=${app.key.omdb}`, omdbRes => {
                    const movie = omdbRes.data;
                    deliver(movie.Plot);
                });
            } else if (i == 5 || i == 6 || i == 7) {
                externalAccess(`http://www.omdbapi.com/?t=${wildcard}&apikey=${app.key.omdb}`, omdbRes => {
                    const movie = omdbRes.data;
                    deliver(`${wildcard} made ${movie.BoxOffice}`);
                });
            }
        }
    },
    {
        description: "Open Website",
        indexes: ["open *", "go to *"],
        smart: true,
        action(i, wildcard) {
            const redirectWindow = window.open(`http://${wildcard}.com`, '_blank');
            redirectWindow.location;
            app.startOneCommandArtyom();
        }
    }
];

artyom.addCommands(voiceCommands);
