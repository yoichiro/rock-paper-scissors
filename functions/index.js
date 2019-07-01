const functions = require('firebase-functions');
const {
  dialogflow,
  ImmersiveResponse
} = require('actions-on-google');

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

const app = dialogflow({
  debug: true
});

// TODO: Write your code here.

app.intent('Show - yes', conv => {
  conv.ask('Ok. Which do you want to show? Rock? Paper? Or, Scissors?');
  conv.ask(new ImmersiveResponse({
    state: {
      scene: 'restart'
    }
  }));
});

const judgeMap = {
  rock: {
    rock: 'Same.',
    paper: 'You lost.',
    scissors: 'You win!'
  },
  paper: {
    rock: 'You win!',
    paper: 'Same.',
    scissors: 'You lost.'
  },
  scissors: {
    rock: 'You lost.',
    paper: 'You win!',
    scissors: 'Same.'
  }
};

app.intent('Show', (conv, param) => {
  // Retrieve the user's hand.
  const userChoice = param['user-choice'].toLowerCase();
  // Determine the action's hand in random order.
  const actionChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
  // Get the message represents the duel.
  const message = judgeMap[userChoice][actionChoice];
  // Construct the reply message with SSML.
  const ssml = `
    <speak>
      <p>Ok, I decided my hand, too.</p>
      <p>Rock, paper, scissors, shoot!</p>
      <p>You showed ${userChoice}.</p>
      <p>I showed ${actionChoice}.</p>
      <p>${message}</p>
      <break time="400ms" />
      <p>Do you want to play again?</p>
    </speak>`;
  conv.ask(ssml);
  // ImmersiveResponse object with information to update the screen.
  conv.ask(new ImmersiveResponse({
    state: {
      scene: 'result',
      userChoice,
      actionChoice,
      message
    }
  }));
});

app.intent('Default Welcome Intent', conv => {
  conv.ask('Which do you want to show? Rock? Paper? Or, Scissors?');
  conv.ask(new ImmersiveResponse({
    url: `https://${firebaseConfig.projectId}.firebaseapp.com/`
  }));
});

exports.fulfillment = functions.https.onRequest(app);
