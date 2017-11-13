const Alexa = require('alexa-sdk');
const data = require('./data.js');
const APP_ID = "";
const SKILL_NAME = "The Office Quotes & Quiz";
const HELP_MESSAGE = "You can say give me a quote, or, you can say quiz me.. What can I help you with?";
const HELP_REPROMPT = "What can I help you with?";
const STOP_MESSAGE = "Goodbye!";


/**
* pick a random character from data.js
**/
function pickRandomCharacter(obj) {
    let result;
    let count = 0;
    for (let prop in obj) // for each property in obj
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}

/**
* pick a random quote from a specified character in data.js
**/
function pickRandomQuote(character) {
  let index = Math.floor(Math.random() * data[character].length);
  let quotes = data[character];
  let randomQuote = quotes[index];
  return randomQuote;
}

/**
* get a new random quote with who said it
**/
function getNewQuote() {
  const character = pickRandomCharacter(data);
  const quote = pickRandomQuote(character);
  const speechOutput = quote + ' ' + character;
  return speechOutput;
}

function checkAnswer(userAnswer, correctAnswer) {
  // only compare the first name
  let fName = userAnswer.split(' ')[0].toLowerCase();
  // check to see if the correct answer contains the first name of the
  // user answer
  return correctAnswer.toLowerCase().includes(fName);
}


const handlers = {
    // LaunchRequest when user says 'Alexa, open office quotes'
    'LaunchRequest': function () {
      this.emit('GetNewQuoteIntent');
    },
    // GetNewQuoteIntent when user says 'Give me a quote'
    'GetNewQuoteIntent': function () {
      const speechOutput = getNewQuote();
      this.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
    },
    // PlayQuizGameIntent when user says 'quiz me'
    'PlayQuizGameIntent': function () {
      const character = pickRandomCharacter(data); // get random character
      this.attributes.answer = character; // save character in session
      const quote = pickRandomQuote(character); // get random quote from character
      let speechOutput = 'Who said the quote: ' + quote;
      let reprompt = 'The quote is: ' + quote;
      this.emit(':ask', speechOutput, reprompt); // alexa response
    },
    'UserAnswerIntent': function () {
      const correctAnswer = this.attributes.answer; // stored in session
      const userAnswer = this.event.request.intent.slots.userAnswer.value; // from slots

      // if both have values
      if(correctAnswer && userAnswer) {
        const correct = checkAnswer(userAnswer, correctAnswer);
        const correctSpeechOut = 'Correct! ';
        const incorrectSpeechOut = `I'm sorry, that quote was from ${correctAnswer}. `
        const repromt = 'Would you like to play again?';

        if (correct) {
          this.emit(':ask', correctSpeechOut + repromt, repromt);
        } else if (!correct) {
          this.emit(':ask', incorrectSpeechOut + repromt, repromt);
        }
      } else {
        this.emit(':ask', 'Oh, would you like to play the quiz game?');
      }

    },
    'YesIntent': function () {
      this.emit('PlayQuizGameIntent');
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
