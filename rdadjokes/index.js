const request = require('request');
const Alexa = require('alexa-sdk');
const filter = require('profanity-filter');
filter.seed('profanity');
filter.setReplacementMethod('word'); // replacement method


const APP_ID = ""; // leave blank, amazon will say it is incorrect no matter what
const SKILL_NAME = "Dad Jokes";
const HELP_MESSAGE = "You can say tell me a dad joke.. What can I help you with?";
const HELP_REPROMPT = "What can I help you with?";
const STOP_MESSAGE = "Goodbye!";
const ERROR_MESSAGE = 'I\'m sorry, there was a problem getting a lift pro tip. Please try again.';

function cleanDataToSelfOnlyPosts(posts) {
  let index;
  let cleanPosts = [];
  for (index = 0; index < posts.length; ++index) {
    let currPost = posts[index];
    if (currPost.data.is_self) {
      cleanPosts.push({title:currPost.data.title, content:currPost.data.selftext});  // clean profanity
    }
  }
  return cleanPosts;
}

function getDadJokes(callback) {
  request('https://www.reddit.com/r/dadjokes/hot.json?limit=50', (err, response, body) => {
    if (!err && response.statusCode === 200) {
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
// UNCOMMENT TO TEST IN CONSOLE
// getDadJokes((posts) => {
//   if (posts !== 'err') {
//     let post = pickRandom(posts);
//     let speechOutput = post.title + ' ... ' + post.content;
//     console.log(filter.clean(speechOutput));
//   } else {
//     console.log(ERROR_MESSAGE);
//   }
// });

const handlers = {
    // LaunchRequest when user says 'Alexa, open shiitty life pro tips'
    'LaunchRequest': function () {
      this.emit('GetDadJokeIntent');
    },
    'GetDadJokeIntent': function () {
      getDadJokes((posts) => {
        if (posts !== 'err') {
          let post = pickRandom(posts);
          let speechOutput = post.title + ' ... ' + post.content;
          this.emit(':tellWithCard', speechOutput, SKILL_NAME, filter.clean(speechOutput));
        } else {
          this.emit(':tell', ERROR_MESSAGE);
        }
      });
    },
    'YesIntent': function () {
      this.emit('GetDadJokeIntent');
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
