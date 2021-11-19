const express = require('express');
const http = require('http');
const socket = require('socket.io');

const port = process.env.PORT || 8080

var app = express();
const server = http.createServer(app)
const io = socket(server)
var players;
var joined = true;

app.use(express.static(__dirname + "/"));

var games = Array(100);
for (let i = 0; i < 100; i++) {
    games[i] = {players: 0 , pid: [0 , 0]};
}


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/chess.html');
});

io.on('connection', function (socket) {
    // console.log(players);
    var color;
    var playerId =  Math.floor((Math.random() * 100) + 1)
    

    console.log(playerId + ' connected');

    socket.on('joinedC', function (roomId) {
        // games[roomId] = {}
        if (games[roomId].players < 2) {
            games[roomId].players++;
            games[roomId].pid[games[roomId].players - 1] = playerId;
        }
        else{
            socket.emit('full', roomId)
            return;
        }
        
        console.log(games[roomId]);
        players = games[roomId].players
        

        if (players % 2 == 0) color = 'black';
        else color = 'white';

        socket.emit('player', { playerId, players, color, roomId })
        // players--;
        if(players==2){
            color='white';
            socket.broadcast.emit('player', { playerId, players, color, roomId })
        }

        
    });

    socket.on('moveC', function (msg) {
        socket.broadcast.emit('moveC', msg);
        // console.log(msg);
    });

    socket.on('play', function (msg) {
        socket.broadcast.emit('play', msg);
        console.log("ready " + msg);
    });

    socket.on('gameOver',function(msg){
        socket.broadcast.emit('gameOver',msg);
        console.log("Game Over");
    })

    socket.on('chessStart',function(data){
        players = games[data].players
        console.log(players)
        if(players==1){
            socket.emit('wait');
        }
    })

    socket.on('disconnect', function () {
        var r;
        for (let i = 0; i < 100; i++) {
            if (games[i].pid[0] == playerId){
              games[i].players--;
              games[i].pid[0]=0;
              r=i;
            }else if(games[i].pid[1] == playerId){
              games[i].players--;
              games[i].pid[1]=0;
              r=i;
            }            
        }

        socket.broadcast.emit('player1',r); 
        socket.broadcast.emit('nan',r);

        console.log(playerId + ' disconnected');
        console.log(games[r]);

    }); 

    
});

server.listen(port);
console.log('Connected');