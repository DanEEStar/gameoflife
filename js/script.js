var ctx = $('#canvas')[0].getContext("2d");

var GOL = GOL ||  {};

GOL.gameModel = function() {

    var board = undefined;

    var initBoard = function() {
        var newBoard = new Array(50);
        for (var i = 0; i < 50; i++) {
            newBoard[i] = new Array(50);
            for(var k = 0; k < 50; k++) {
                newBoard[i][k] = 0;
            }
        };
        return newBoard;
    };

    var setDot = function(x, y) {
        board[x][y] = 1;
    };

    var toggleDot = function(x, y) {
        if(board[x][y] === 1) {
            board[x][y] = 0;
        }
        else {
            board[x][y] = 1;
        }
    };

    var resetGame = function() {
        board = initBoard();
    };

    var convertMouseToMap = function(x, y) {
        return {
            x: Math.floor(x / 10),
            y: Math.floor(y / 10)
        };
    };

    var getBoard = function() {
        var boardCopy = new Array(50);
        for(var i = 0; i < 50; i++) {
            boardCopy[i] = new Array(50);
            for(var k = 0; k < 50; k++) {
                boardCopy[i][k] = board[i][k];
            }
        }

        return boardCopy;
    };

    var getNumOfLifeNeighbors = function(board, x, y) {
        var num = 0;
        for(var i = -1; i < 2; i++) {
            for(var k = -1; k < 2; k++) {
                if(i === 0 && k === 0) {
                    continue;
                }
                if(x+i < 0 || y+i < 0 || x+i > 49 || y+i > 49) {
                    continue;
                }
                if(board[x+i][y+k] === 1) {
                    num += 1;
                }
            }
        }
        return num;
    };

    var tick = function() {
        console.log("tick");
        var newBoard = initBoard();
        // implement the game rules
        for(var i = 0; i < 50; i++) {
            for(var k = 0; k < 50; k++) {
                var numOfLifeMembers = getNumOfLifeNeighbors(board, i, k);
                if(board[i][k] === 1) {
                    // handling live cell
                    if(numOfLifeMembers < 2 || numOfLifeMembers > 3) {
                        newBoard[i][k] = 0;
                    } else {
                        newBoard[i][k] = 1;
                    }
                } else {
                    // handling dead cell
                    if(numOfLifeMembers === 3) {
                        newBoard[i][k] = 1;
                    } else {
                        newBoard[i][k] = 0;
                    }
                }
            }
        }
        board = newBoard;
    };

    board = initBoard();

    return {
        setDot: setDot,
        toggleDot: toggleDot,
        resetGame: resetGame,
        convertMouseToMap: convertMouseToMap,
        getBoardCopy: getBoard,
        tick: tick
    };
}();

GOL.gameDrawer = function(ctx, gameModel) {
    var resetBoard = function() {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 500, 500);
    };

    var drawBoardOutline = function() {
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        var i = 0;
        for(i = 0; i < 50; i++) {
            ctx.moveTo(i * 10 + 9.5, -0.5);
            ctx.lineTo(i * 10 + 9.5, 499.5);
            ctx.moveTo(-0.5, i * 10 + 9.5);
            ctx.lineTo(499.5, i * 10 + 9.5);
            ctx.stroke();
        }
        ctx.closePath();
    };

    var drawDot = function(x, y) {
        ctx.fillStyle = "#000";
        ctx.fillRect(x * 10 - 0.5, y * 10 - 0.5, 10, 10);
    };

    var drawBoard = function() {
        var board = gameModel.getBoardCopy();
        for(var i = 0; i < 50; i++) {
            for(var k = 0; k < 50; k++) {
                if(board[i][k] === 1) {
                    drawDot(i, k);
                }
            }
        }
    };

    var drawGame = function() {
        resetBoard();
        drawBoardOutline();
        drawBoard();
    };

    return {
        drawGame: drawGame
    }
}(ctx, GOL.gameModel);


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomLayout() {
    for(var i = 0; i < 50; i++) {
        GOL.gameModel.setDot(getRandomInt(0, 49), getRandomInt(0, 49));
    }
}

function exampleGameTick() {
    //GOL.gameModel.resetGame();
    GOL.gameModel.tick();
    GOL.gameDrawer.drawGame();
}

GOL.gameDrawer.drawGame();

$("#startGame").click(function(evt) {
    console.log("start game");
    var intervalId = setInterval(exampleGameTick, 1000);
});

$("#canvas").mouseup(function(evt) {
    var x = evt.pageX - this.offsetLeft;
    var y = evt.pageY - this.offsetTop;
    var msg = "handler for mouseup called at ";
    msg += x + ", " + y;
    console.log(msg);

    mapCoordinates = GOL.gameModel.convertMouseToMap(x, y);
    GOL.gameModel.toggleDot(mapCoordinates.x, mapCoordinates.y);
    GOL.gameDrawer.drawGame();
});