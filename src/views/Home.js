// This file can be broken up into many components and prevent the
// entire Home component from re-rendering. I spent too much time developing
// the algo and making the game work. Always can optimize later.

import React, { useEffect, useState, useCallback } from 'react';
import './components/styles/Home.css';
import { Graph, bfs, shortestPath } from '../utils/Graph';

const Home = () => {
    const [width, setWidth] = useState(0); // Width of the board
    const [height, setHeight] = useState(0); // Height of the board
    const [pathArr, setPathArr] = useState();
    const [pairs, setPairs] = useState(); // Valid paris, used for checking if user moves to a valid position 
    const [currentPosition, setCurrentPosition] = useState();
    const [gameOver, setGameOver] = useState(false); // Is game over boolean
    const [playerPath, setPlayerPath] = useState([]); // Count total moves for the user

    let difficulty = .2; // difficulty is range from 0 - 1.0. Percentage based

    let size = width * height; // size of the table

    let end = width - 1; // end ID
    let start = size - width; // start ID

    let g = new Graph();

    const solve = useCallback(() => {
        pathArr.forEach((path) => {
            let cell = document.getElementById(path);
            cell.style.backgroundColor = 'yellow';
        });
    }, [pathArr]);

    const handleEndGame = useCallback(() => {
        setGameOver(true);
        solve();
        alert('Game Over');
    }, [solve]);

    const player = useCallback(position => {
        let playerPosition = document.getElementById(position);
        playerPosition.classList.remove('taken-path');
        playerPosition.classList.add('user-avatar');
        setPlayerPath(oldArr => [...oldArr, position.toString()]);
        setCurrentPosition(position.toString());

        if (playerPath.length > 0) {
            let lastPosition = document.getElementById(playerPath[playerPath.length - 1]);
            lastPosition.classList.add('taken-path');
            lastPosition.classList.remove('user-avatar');

        }
        if (position === end.toString()) {
            handleEndGame();
        }
    }, [playerPath, end, handleEndGame]);



    useEffect(() => {
        console.log('[useEffect]');
        // gets the element clicked on
        if (pathArr && !gameOver) {
            window.onclick = e => {
                // Detects if the move is new or not
                if (currentPosition !== e.target.id) {
                    let compare = [currentPosition, e.target.id];
                    // Checks to see if the next move and current position is in the pairs
                    pairs.forEach((pair) => {
                        if (pair.includes(compare[0]) && pair.includes(compare[1])) {
                            if (!gameOver) {
                                player(e.target.id);
                            }
                        }
                    });
                }
            };
        }

    }, [pathArr, currentPosition, pairs, gameOver, player]);


    const generateTable = () => {
        let badZones = []; // Arr of square ID's that cannot be an 'obsticle' so the game can be won

        badZones.push(end);
        badZones.push(start);

        badZones.push(width - 2); // piece next to end
        badZones.push(size - width + 1); // piece next to end

        let arr = [];
        let key = 0; // used to store a unique key for each box
        let obsticlesIndexsId = generateObsticles(badZones);

        for (let i = 0; i < height; i++) {
            let innerArr = [];
            for (let j = 0; j < width; j++) {
                let boxInfo = { id: key, obsticle: false, isStart: false, isEnd: false };
                if (obsticlesIndexsId.includes(key)) {
                    boxInfo.obsticle = true;
                }
                if (key === start) {
                    boxInfo.isStart = true;
                }
                if (key === end) {
                    boxInfo.isEnd = true;
                }
                ++key;
                innerArr.push(boxInfo);
                // Finds start and end point and makes sure they are accessible
            }
            arr.push(innerArr);
        }
        return arr;
    };

    const generateObsticles = (badZones) => {

        let numObsticles = Math.floor(size * difficulty);

        let obsticlesIndexsId = [];
        for (let i = 0; i < numObsticles; i++) {
            let randomNumId = Math.floor(Math.random() * size);
            // Makes sure the random num is not a starting or ending ID value
            if (!badZones.includes(randomNumId)) {
                obsticlesIndexsId.push(randomNumId);
            }
        }
        return obsticlesIndexsId;
    };

    const pairArr = (arr) => {
        let pairs = [];
        for (let x in arr) {
            pairs.push(arr[x].reduce(function (result, value, index, array) {
                if (index !== array.length - 1) {
                    if (array[index].obsticle) {
                        return result;
                    }
                    else if (array[index + 1].obsticle) {
                        return result;
                    }
                    result.push(array.slice(index, index + 2));
                }
                return result;
            }, []));
        }
        return pairs;
    };

    const displayTable = (arr) => {
        let mazeEl = document.getElementById('maze');
       
        for (let i = 0; i < height; i++) {
            let node = document.createElement('tr');
            
            for (let j = 0; j < width; j++) {
                let { id, obsticle, isStart, isEnd } = arr[i][j];
                let node2 = document.createElement('td');
                if (obsticle) {
                    node2.setAttribute('class', 'obsticle');
                }
                if (isStart) {
                    node2.setAttribute('class', 'isStart');
                }
                if (isEnd) {
                    node2.setAttribute('class', 'isEnd');
                }
                node2.setAttribute('id', `${id}`);
                node.appendChild(node2);
                mazeEl.appendChild(node);
            }
        }
    };

    const handleWidthChange = (event) => {
        let width = event.target.value;
        if (width < 5) {
            width = 5;
        }
        setWidth(width);
    };
    const handleHeightChange = (event) => {
        let height = event.target.value;
        if (height < 5) {
            height = 5;
        }
        setHeight(height);
    };

    const make_table = () => {

        let arr = generateTable();

        // Add id of nodes to the graph

        let verticalArr = [];
        for (let i = 0; i < height; i++) {
            let innerArr = [];
            for (let j = 0; j < width; j++) {
                innerArr.push(arr[j][i]);
            }
            verticalArr.push(innerArr);
        }

        let horizontalPairs = pairArr(arr);
        let verticalPairs = pairArr(verticalArr);

        let pairs = [];
        pairs = pairs.concat(verticalPairs, horizontalPairs);

        addEdges(pairs);

        displayTable(arr);
        bfs(g, start.toString());
        setPathArr(shortestPath(g, start.toString(), end.toString()));

        player(start);

    };

    const addEdges = (pairs) => {
        // Loop through all of the pairs and add them to the the edges of the graph
        let simplifiedPairs = [];
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            for (let j = 0; j < pair.length; j++) {
                let node1 = pair[j][0].id.toString();
                let node2 = pair[j][1].id.toString();
                simplifiedPairs.push([node1, node2]);
                g.addEdge(node1, node2, 1);
            }
        }
        // Used to store a simpified array of pairs. Could've made a Graph implementation
        setPairs(simplifiedPairs);
    };

    const determineWin = () => {
        if (pathArr.length - 1 === playerPath.length - 1) {
            return (<p>You won! Shortest amount of moves was {pathArr.length - 1}</p>);
        }
        else {
            return (<p>You lost! Shortest amount of moves was {pathArr.length - 1}</p>);
        }
    };

    const rules = () => {
        return(
            <React.Fragment>
                <h4>Rules:</h4>
                <ul>
                    <li>Rows and columns must be >= 5</li>
                    <li>Can only move perpendicular and horizontally</li>
                    <li>Can only move 1 space at a time</li>
                </ul>
                <h4>Objective:</h4>
                <p>Get to the green square in few moves as possible</p>
            </React.Fragment>

        );
    };

    const userInputs = () => {
        return (
            <React.Fragment>
                {rules()}
                <label>Rows </label><input
                    type="number"
                    min="5"
                    onChange={handleHeightChange}
                    size="3"
                                    />
                <label>Columns </label><input
                    type="number"
                    min="5"
                    onChange={handleWidthChange}
                    size="3"
                                       />
                <button onClick={make_table}>Generate</button>
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
            {pathArr ? <p>Total Moves: {playerPath.length - 1}</p> : userInputs()}
            <table
                id="maze"
                className="center"
            />
            <div className="text-center">{gameOver ? determineWin() : null}</div>
        </React.Fragment>
    );
};

export default Home;