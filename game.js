game = new Chess();
var socket = io();

var color = "white";
var players;
var roomId;
var play = true;
var gameOn = false;
var rn;
var playerType;

var room = document.getElementById("room")
var roomNumber = document.getElementById("roomNumbers")
var button = document.getElementById("button")
var state = document.getElementById('state')
var btn1 = document.getElementById('btn1')
var board = document.getElementById('board')

function begin(){
    rn=prompt("Enter room number 51-100 :");
    roomId = rn;
    if(rn === null){
        window.location.assign('/');
    }else if(rn>50 && rn<101){
        console.log("Room "+rn);
        socket.emit('joinedC',rn);
    }else{
        alert("Enter a valid Room number !!");
        begin();
    }
    
  }

begin();

// var cfg = {
//     orientation: color,
//     draggable: true,
//     position: 'start',
//     onDragStart: onDragStart,
//     onDrop: onDrop,
//     onMouseoutSquare: onMouseoutSquare,
//     onMouseoverSquare: onMouseoverSquare,
//     onSnapEnd: onSnapEnd
// };
// board = ChessBoard('board', cfg);

function again(){
    if(gameOn){
        state.innerHTML = "Wait for your turn"
    }else{
        console.log("chessStart")
        socket.emit('chessStart',roomId);
    }
}

socket.on('full', function (msg) {
    if(roomId == msg){
        console.log("Room full");
        alert("Room full !! Enter another number.");
        begin();
    }
        
});

socket.on('play', function (msg) {
    if (msg == roomId) {
        play = false;
        btn1.innerHTML = 'Again';
        state.innerHTML = "Game in progress"
    }
    // console.log(msg)
});

socket.on('moveC', function (msg) {
    if (msg.room == roomId) {
        game.move(msg.move);
        board.position(game.fen());
        console.log("moved")
    }
});

socket.on('gameOver',function(msg){
    if(msg == roomId){
        state.innerHTML = 'GAME OVER';
        btn1.innerHTML = 'Again';
        gameOn = false;
    }
})

socket.on('player1',function(roomId){
    if(roomId==rn){
      playerType="1";
      var plno = document.getElementById('player');
      plno.innerHTML = 'Player ' + playerType + " : white" ;      
      console.log("player:"+playerType);
    }
})
  
  socket.on('player2',function(roomId){
    if(roomId==rn){
      playerType="2";
      var plno = document.getElementById('player');
      plno.innerHTML = 'Player ' + playerType + " : black";
      console.log("player:"+playerType);
    }
})

socket.on('nan',function(roomId){
    if(roomId==rn){
        alert("Opponent left!! Go back.");
        state.innerHTML = 'GAME OVER';
        btn1.innerHTML = 'Start';
        gameOn = false;
        console.log("nan received")
        console.log(gameOn)
    }
})

socket.on('wait',function(){
    console.log("Not enough players");
    alert("Waiting for opponent ... \nAsk your friend to join room "+rn+" .");
    state.innerHTML = "Waiting for Second player";
})

var removeGreySquares = function () {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function (square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

var onDragStart = function (source, piece) {
    // do not pick up pieces if the game is over
    // or if it's not that side's turn
    if (game.game_over() === true || play ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() === 'w' && color === 'black') ||
        (game.turn() === 'b' && color === 'white') ) {
            return false;
    }
    // console.log({play, players});
};

var onDrop = function (source, target) {
    removeGreySquares();

    // see if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });
    if (game.game_over()) {
        state.innerHTML = 'GAME OVER';
        btn1.innerHTML = 'Again';
        gameOn = false;
        socket.emit('gameOver', roomId)
    }

    // illegal move
    if (move === null) return 'snapback';
    else
        socket.emit('moveC', { move: move, board: game.fen(), room: roomId });

};

var onMouseoverSquare = function (square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
        square: square,
        verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    // highlight the square they moused over
    greySquare(square);

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function (square, piece) {
    removeGreySquares();
};

var onSnapEnd = function () {
    board.position(game.fen());
};


socket.on('player', (msg) => {
    var plno = document.getElementById('player')
    color = msg.color;
    if(color=='white')
        playerType="1";
    else
        playerType="2";

    plno.innerHTML = 'Player ' + playerType + " : " + color;
    players = msg.players;

    if(players == 2){
        play = false;
        socket.emit('play', msg.roomId);
        btn1.innerHTML = 'Again';
        state.innerHTML = "Game in Progress"
        gameOn = true;
    }
    else
        state.innerHTML = "Waiting for Second player";


    var cfg = {
        orientation: color,
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };
    board = ChessBoard('board', cfg);
});
// console.log(color)

var board;
