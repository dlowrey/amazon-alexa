const request = require('request');
const Alexa = require('alexa-sdk');
const APP_ID = "amzn1.ask.skill.dcf44319-75dc-4557-a6ca-a13d6e424592";
const SKILL_NAME = "Shitty Life Pro Tips";
const HELP_MESSAGE = "You can say give me a shitty life pro tip, or life pro tip.. What can I help you with?";
const HELP_REPROMPT = "What can I help you with?";
const STOP_MESSAGE = "Goodbye!";

function cleanDataToSelfOnlyPosts(posts) {
  let index;
  let cleanPosts = [];
  for (index = 0; index < posts.length; ++index) {
    let currPost = posts[index];
    if (currPost.data.is_self) {
      cleanPosts.push(currPost.data.title);
    }
  }
  return cleanPosts;
}

function getShittyLifeProTips(callback) {
  request('https://www.reddit.com/r/shittylifeprotips/hot.json?limit=100', (err, response, body) => {
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
function pickRandomSLPT(posts) {
  let index = Math.floor(Math.random() * posts.length);
  let randomSLPT = posts[index];
  return randomSLPT;
}

const handlers = {
    // LaunchRequest when user says 'Alexa, open shiitty life pro tips'
    'LaunchRequest': function () {
      this.emit('GetSLPTIntent');
    },
    'GetSLPTIntent': function () {
      getShittyLifeProTips((posts) => {
        if (posts !== 'err') {
          let title = pickRandomSLPT(posts);
          this.emit(':tell', title, SKILL_NAME, title);
        }
      });
    },
    'YesIntent': function () {
      this.emit('GetSLPTIntent');
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
