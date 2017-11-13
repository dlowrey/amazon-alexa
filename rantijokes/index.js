const request = require('request');
const Alexa = require('alexa-sdk');
const filter = require('profanity-filter');
filter.seed('profanity');  // file that contains profanity to censor
filter.setReplacementMethod('stars'); // replacement method

const APP_ID = ""; // leave this blank, Amazon will tell you it is incorrect no matter what
const SKILL_NAME = "Anti-Jokes";
const HELP_MESSAGE = "You can say give me an anti-joke, or tell me an anti-joke.. What can I help you with?";
const HELP_REPROMPT = "What can I help you with?";
const STOP_MESSAGE = "Goodbye!";

function cleanDataToSelfOnlyPosts(posts) {
  let index;
  let cleanPosts = [];
  for (index = 0; index < posts.length; ++index) {
    let currPost = posts[index];
    if (currPost.data.is_self) {
      cleanPosts.push({title: currPost.data.title, content: currPost.data.selftext});  // clean profanity
    }
  }
  return cleanPosts;
}

function getAntiJokes(callback) {
  request('https://www.reddit.com/r/AntiJokes/hot.json?limit=50', (err, response, body) => {
    if (!err) {
      const data = JSON.parse(body);
      const posts = cleanDataToSelfOnlyPosts(data.data.children);
      callback(posts);
    } else {
      callback('err');
    }
  });
}


/**
* pick a random quote from a specified character in data.js
**/
function pickRandom(posts) {
  let index = Math.floor(Math.random() * posts.length);
  let randomSLPT = posts[index];
  return randomSLPT;
}


// UNCOMMENT BELOW TO TEST IN CONSOLE
// getAntiJokes((posts) => {
//   if (posts !== 'err') {
//     let post = pickRandom(posts);
//     const speechOutput = post.title + ' ... ' + post.content;
//     console.log(speechOutput);
//   }
// });

const handlers = {
    // LaunchRequest when user says 'Alexa, open shiitty life pro tips'
    'LaunchRequest': function () {
      this.emit('GetAntiJokeIntent');
    },
    'GetAntiJokeIntent': function () {
      getAntiJokes((posts) => {
        if (posts !== 'err') {
          let post = pickRandom(posts);
          const speechOutput = post.title + ' ... ' + post.content;
          this.emit(':tellWithCard', speechOutput, SKILL_NAME, filter.clean(speechOutput));
        }
      });
    },
    'YesIntent': function () {
      this.emit('GetAntiJokeIntent');
    },
    // HelpIntent when user says 'Help'
    'AMAZON.HelpIntent': function () {
      const speechOutput = HELP_MESSAGE;
      const reprompt = HELP_REPROMPT;
      this.emit(':ask', speechOutput, reprompt);
    },
    // CancelIntent when the user says 'cancel'
    'AMAZON.CancelIntent': function () {
      this.emit(':tell', STOP_MESSAGE);
    },
    // StopIntent when the user says 'no' or 'stop'
    'AMAZON.StopIntent': function () {
      this.emit(':tell', STOP_MESSAGE);
    }
};

// Give the handler object and it's functions to the lambda for
// execution
exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context); // create alexa obj
    alexa.appId = APP_ID; // register app id
    alexa.registerHandlers(handlers); // register handlers
    alexa.execute(); // begin
};
