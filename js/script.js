var ctx = $('#canvas')[0].getContext("2d");

var GOL = GOL ||  {};

GOL.BOARD_SIZE = 60;
GOL.DOT_SIZE = 15;

GOL.gameModel = function() {

    var board = undefined;

    /**
     * @return a new BOARD_SIZE * BOARD_SIZE multi-dimensional array initialized with all zeros
     */
    var initBoard = function() {
        var newBoard = [];
        for (var i = 0; i < GOL.BOARD_SIZE; i++) {
            newBoard[i] = [];
            for(var k = 0; k < GOL.BOARD_SIZE; k++) {
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
            x: Math.floor(x / GOL.DOT_SIZE),
            y: Math.floor(y / GOL.DOT_SIZE)
        };
    };

    var copyBoard = function() {
        var boardCopy = [];
        for(var i = 0; i < GOL.BOARD_SIZE; i++) {
            boardCopy[i] = [];
            for(var k = 0; k < GOL.BOARD_SIZE; k++) {
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
                if(x+i < 0 || y+i < 0 || x+i > GOL.BOARD_SIZE - 1 || y+i > GOL.BOARD_SIZE - 1) {
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
        for(var i = 0; i < GOL.BOARD_SIZE; i++) {
            for(var k = 0; k < GOL.BOARD_SIZE; k++) {
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
        copyBoard: copyBoard,
        tick: tick
    };
}();

GOL.gameDrawer = function(ctx, gameModel) {
    var resetBoard = function() {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, GOL.DOT_SIZE * GOL.BOARD_SIZE, GOL.DOT_SIZE * GOL.BOARD_SIZE);
    };

    var drawBoardOutline = function() {
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        var i = 0;
        for(i = 0; i < GOL.BOARD_SIZE; i++) {
            ctx.moveTo(i * GOL.DOT_SIZE + GOL.DOT_SIZE - 0.5, -0.5);
            ctx.lineTo(i * GOL.DOT_SIZE + GOL.DOT_SIZE - 0.5, GOL.DOT_SIZE * GOL.BOARD_SIZE - 0.5);
            ctx.moveTo(-0.5, i * GOL.DOT_SIZE + GOL.DOT_SIZE - 0.5);
            ctx.lineTo(GOL.DOT_SIZE * GOL.BOARD_SIZE - 0.5, i * GOL.DOT_SIZE + GOL.DOT_SIZE - 0.5);
            ctx.stroke();
        }
        ctx.closePath();
    };

    var drawDot = function(x, y) {
        ctx.fillStyle = "#000";
        ctx.fillRect(x * GOL.DOT_SIZE - 0.5, y * GOL.DOT_SIZE - 0.5, GOL.DOT_SIZE, GOL.DOT_SIZE);
    };

    var drawBoard = function() {
        var board = gameModel.copyBoard();
        for(var i = 0; i < GOL.BOARD_SIZE; i++) {
            for(var k = 0; k < GOL.BOARD_SIZE; k++) {
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

GOL.gameController = function() {
    var updateSpeed = 1000;
    var gameRunning = false;
    var currentIntervalId = null;

    var gameTick = function() {
        GOL.gameModel.tick();
        GOL.gameDrawer.drawGame();
    };

    var startGame = function() {
        console.log("start game");
        if(!gameRunning) {
            gameRunning = true;
            currentIntervalId = setInterval(gameTick, updateSpeed);
        }
    };

    var stopGame = function() {
        gameRunning = false;
        if(currentIntervalId !== null) {
            clearInterval(currentIntervalId);
            currentIntervalId = null;
        }
    };

    var resetGame = function() {
        stopGame();
        GOL.gameModel.resetGame();
        GOL.gameDrawer.drawGame();
    };


    var setUpdateSpeed = function(newUpdateSpeed) {
        console.log("set new update speed");
        stopGame();
        updateSpeed = newUpdateSpeed;
        startGame();
    };

    var getUpdateSpeed = function() {
        return updateSpeed;
    };

    return {
        startGame: startGame,
        stopGame: stopGame,
        resetGame: resetGame,
        getUpdateSpeed: getUpdateSpeed,
        setUpdateSpeed: setUpdateSpeed
    }

}();

GOL.gameDrawer.drawGame();

$("#startGame").click(function(evt) {
    GOL.gameController.startGame();
});

$("#stopGame").click(function(evt){
    GOL.gameController.stopGame();
});

$("#resetGame").click(function(evt){
    GOL.gameController.resetGame();
});

$("#gameSpeedInput").change(function(evt) {
    var inputSpeed = $("#gameSpeedInput").val();
    var newSpeed = parseInt(inputSpeed);
    if(isNaN(newSpeed)) {
        newSpeed = GOL.gameController.getUpdateSpeed();
    } else if(newSpeed < 10) {
        newSpeed = 10;
    } else if(newSpeed > 2000) {
        newSpeed = 2000;
    }

    GOL.gameController.setUpdateSpeed(newSpeed);
    $("#gameSpeedInput").val(newSpeed);
    console.log(newSpeed);
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