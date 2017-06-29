// Initialize fields when page is loaded
$(document).ready(function() {
	console.log('Initial page load');
//	initialize player stats object
//	initialize gameboard object
//	initialize GameActive object
});

// *** BUTTON *** Clicked on "New Game" button; resets board and stats
$('#newgame-btn').click(function() {
	console.log('User clicked on newgame button');
	
	if (isGameActive()) {
	  
	  clearStats();
	  displayStats();

	  shuffleDeck();
	  resetGameBoard();

	  setGameActive();
	}
});

// *** BUTTON *** Clicked on "Let's Play!"; resets board & stats, stores names entered
$('#startgame-btn').click(function() {
	console.log('User clicked on startgame button');
	
	putNames();
	
	clearStats();
	displayStats();
	
	displayInstructions();
	
	shuffleDeck();
	resetGameBoard();

	setGameActive();	
});

// *** BUTTON *** Clicked on "New Players"; ends the game and allows new names to be input
$('#newplayers-btn').click(function() {
	console.log('User clicked on newplayers button');
	
	resetGameActive();
	
	getNames(); // Might not need this
	displayNewNames();

});

// Click on card
// $('.big-card-cell').click(function () {
$('#game-pieces td').click(function () {
   console.log('User clicked on a card');
   
   // Do not process if we are still displaying last pair selected
   if (!isGameActive()) {
     return;
   }
   
   // Only process if card back is showing
   if (!$(this).hasClass('back')) {
     return;
   }
   
   console.log('About to process cell ' + $(this).prop('id'));
   
   processCard(this);
   
});

// *************************************
// Set up path name to image files
// stored in a GitHub repository
// (for licensing reasons)
var imagePath = 'https://kunikla.github.io/media-library/images/memory/';

// *************************************
// This set of functions will act on an
// object that represents the game board

var card_deck = [
  'bear',   'bear',
  'boar',   'boar',
  'deer',   'deer',
  'fox',    'fox',
  'okapi',  'okapi',
  'rabbit', 'rabbit'];
  
var current_cell = null, cell1 = null, cell2 = null;
var current_card = null, card1 = null, card2 = null;
var current_animal = null, animal1 = null, animal2 = null;
var which_card = 1;

// Display the card front
function turnCardOver (cell) {
	console.log('turnCardOver');
	
	current_cell = cell;
	console.log('turnCardOver: current_cell = ' + $(cell).prop('id'));
	current_card = $(cell).prop('id').replace('cell-','');
	console.log('turnCardOver: current_card = ' + current_card);
	current_animal = card_deck[current_card-1];
	console.log('turnCardOver: current_animal = ' + current_animal);
	
	$(cell).html('<img src="' + imagePath + current_animal + '.svg" class="big-card rounded">');
	$(cell).removeClass('back');
	$(cell).addClass('front');
}

// Display the card back
function turnCardUnder (cell) {
	console.log('turnCardUnder: selected cell = ' + $(cell).prop('id'));
	
	$(cell).html('<img src="images/card-back.png" class="big-card rounded">');
	$(cell).removeClass('front');
	$(cell).addClass('back');
}

// Display no card (remove from the game board)
function removeCard (cell) {
	console.log('removeCard: selected cell = ' + $(cell).prop('id'));
	
	$(cell).html('');
	$(cell).removeClass('front');
}

// Figure out what to do after card is turned over
function processCard (cell) {
  	console.log('processCard: which_card = ' + which_card);
	
	turnCardOver(cell);
	
	if (which_card == 1) { // process first card
	  cell1 = current_cell;
	  card1 = current_card;
	  animal1 = current_animal;
	  which_card = 2;
	} else {  // process second card
	  resetGameActive(); // can't turn over third card
	  cell2 = current_cell;
	  card2 = current_card;
	  animal2 = current_animal;
	  which_card = 1;
	  
	  if (animal1 == animal2) { // process case for match
	      awardPair(current_animal);
	      displayPrompt('Congratulations!');

	      setTimeout(function () {
		removeCard(cell1);
		removeCard(cell2);
		displayStats();
		setGameActive(); // can turn over card now
	      }, 2000);

	  } else {  // process case where no match
	    displayPrompt('Not a match, better luck next time!');
	    setTimeout(function () {
	      turnCardUnder(cell1);
	      turnCardUnder(cell2);
	      nextPlayer();
	      displayStats();
	      setGameActive(); // can turn over card now
	    }, 2000);

	  } // end case where no match
	  
	  current_card = null;
	  card1 = null;
	  card2 = null;
	  current_animal = null;
	  animal1 = null;
	  animal2 = null;
	  
	} // done processing second card
}

// Lay all the cards on the board face down
function resetGameBoard () {
	console.log('resetGameBoard');
	
	$('#game-pieces td').html('<img src="images/card-back.png" class="big-card rounded">');
	$('#game-pieces td').removeClass('front');
	$('#game-pieces td').addClass('back');	
}

// Put the cards in random order
// Durstenfeld shuffle
// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleDeck () {
	console.log('shuffleDeck');

	for (var i = card_deck.length - 1; i > 0; i--) {
	  var j = Math.floor(Math.random() * (i + 1));
	  var temp = card_deck[i];
	  card_deck[i] = card_deck[j];
	  card_deck[j] = temp;
	  }
}

// *********************************************
// This set of functions will act on an object
// that contains the players' stats

var active_player = 1, waiting_player = 2;
var player_names = ['', ''];
var cardpairs_p1 = [], cardpairs_p2 = [];
var awarded_pairs = 0;

// Initialize the players' names
function clearNames () {
	console.log('clearNames');
	player_names[0] = '';
	player_names[1] = '';
}

// Retrieve the player's names that were entered
function getNames () {
	console.log('getNames');
	$('#player1').prop('value', player_names[0]);
	$('#player2').prop('value', player_names[1]);
}

// Store the players' names that were entered
function putNames () {
	console.log('putNames');
	player_names[0] = $('#player1').prop('value');
	player_names[1] = $('#player2').prop('value');
}

// Initialize the players' statistics
// Clear the display of players' pairs
function clearStats () {
	console.log('clearStats');
	
	cardpairs_p1 = []; 
	cardpairs_p2 = [];
	awarded_pairs = 0;
	$('.sm-card-name').html('');
	$('.sm-card-cell').html('');
	active_player = 1;
	waiting_player = 2;
}

// Display the players' names and current stats
function displayStats () {
	console.log('displayStats');
	
	var p1_pairs = cardpairs_p1.length;
	$('#name-p1').html(player_names[0] + ',');
	$('#status-p1').html(' you have ' + p1_pairs + ' pairs.');
	var p2_pairs = cardpairs_p2.length;
	$('#name-p2').html(player_names[1] + ',');
	$('#status-p2').html(' you have ' + p2_pairs + ' pairs.');
	if (awarded_pairs == 6) {
	  if (p1_pairs == p2_pairs) {
	    displayPrompt('Tie game!');
	    nextPlayer();
	    displayPrompt('Tie game!');
	  } else if (p1_pairs > p2_pairs) {
	    setPlayer(1);
	    displayPrompt('You win!');
	    setPlayer(2);
	    displayPrompt('&nbsp;');
	  } else {
	    setPlayer(1);
	    displayPrompt('&nbsp;');
	    setPlayer(2);
	    displayPrompt('You win!');
	  }
	  
	  resetGameActive();
	  
	} else {  // awarded pairs < 6
	  $('#prompt-p' + active_player).html('Your turn, ' + player_names[active_player - 1]);
	  $('#prompt-p' + waiting_player).html('&nbsp;');	  
	}
}

// Display prompt
function displayPrompt (prompt) {
	console.log('displayPrompt: Player' + active_player + ' -- ' + prompt);
	
	var which_field = '#prompt-p' + active_player;
	$(which_field).html(prompt);
}

// Remove old prompts
function removePrompt () {
  	console.log('removePrompt: Player' + waiting_player);
	
	var which_field = '#prompt-p' + waiting_player;
	$(which_field).html('&nbsp;');
}

// Set active player
function setPlayer(player_num) {
	console.log('setPlayer');
	
	active_player = player_num;
	waiting_player = ((player_num % 2) + 1);
}

// Next player
function nextPlayer () {
	console.log('nextPlayer');
	
	active_player = ((active_player % 2) + 1);
	console.log('New active_player = ' + active_player);
	
	waiting_player = ((waiting_player % 2) + 1);
	console.log('New waiting_player = ' + waiting_player);
}

// Process the case when the two cards match, by updating player stats
function awardPair (which_animal) {
	console.log('awardPair: Player'  + active_player + ' gets ' + which_animal);
	
	var which_name_id, which_card_id;
	if (active_player == 1) {
	  which_cell = cardpairs_p1.length + 1;
	  which_name_id = '#p1n' + which_cell;
	  which_card_id = '#p1c' + which_cell;
	  cardpairs_p1.push(which_animal);
	} else {
	  which_cell = cardpairs_p2.length + 1;
	  which_name_id = '#p2n' + which_cell;
	  which_card_id = '#p2c' + which_cell;
	  cardpairs_p2.push(which_animal);
	}
	console.log('awardPair: which_cell = ' + which_cell);
	console.log('awardPair: which_name_id = ' + which_name_id);
	$(which_name_id).html(which_animal);
	console.log('awardPair: which_card_id = ' + which_card_id);
	$(which_card_id).html('<img src="images/' + which_animal + '.svg" class="sm-card rounded">');
	
	awarded_pairs++;
	
}


// *********************************************
// This set of functions will act on an object
// that remembers whether the player can click
// on a card at this point in time
var game_active = false;

// Check to see if the game has (re)started yet
function isGameActive () {
	console.log('isGameActive');
	return (game_active);
}

function setGameActive () {
	console.log('setGameActive');
	game_active = true;
}

function resetGameActive () {
	console.log('resetGameActive');
	game_active = false;
}

// *********************************************
// This set of functions controls the visibility
// of the divs enclosed in the 'players' div

// Switch to displaying the instructions and player stats
function displayInstructions () {
	console.log('displayInstructions');
	
	$('#new-names').addClass('hide');
	$('#play-game').removeClass('hide');
	setGameActive();

}

// Switch to displaying a screen to input new names
function displayNewNames () {
	console.log('displayNewNames');
	
  	$('#play-game').addClass('hide');
	$('#new-names').removeClass('hide');
	resetGameActive();
}