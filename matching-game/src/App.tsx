import React, { useCallback } from 'react';
import './App.css';
import {Provider, useDispatch as reduxUseDispatch} from 'react-redux';
import {
  configureStore, 
  State, 
  useSelector, 
  useDispatch, 
  Tile,
  revealTileAction,
  getCurrentPlayer,
  Player,
} from './logic';

// this is an app global
const store = configureStore();

function App() {
  const gameState = useSelector<State['gameState']>(state => state.gameState);

  return (
    <div className="App">
      {gameState}
      <br />
      {gameState === 'setup' && <SetupGame />}
      {gameState === 'in-progress' && <Game />}
    </div>
  );
}

function SetupGame() {
  const players = useSelector<State['players']>(state => state.players);
  const startGame = useDispatch({ type: 'START', payload: {} });
  // const addPlayer = useDispatch({ type: 'ADD_PLAYER', payload: {player} }), []);
  
  return (
    <div>
      <h1>Setup Game</h1>
      <ul>
        {players.map(player => (<li key={player.id}>{player.name}</li>))}
      </ul>
      <button onClick={startGame}>Start</button>
      
      {/* <button onClick={() => addPlayer()}>Add Computer Player</button> */}
    </div>
  );
}

function Game() {
  const tiles = useSelector<State['tileOrder']>(state => state.tileOrder);

  return (
    <div>
      <GameHeader />
      <div className="tile-grid">
        {tiles.map(tileId => <GameTile key={tileId} tileId={tileId} />)}
      </div>
    </div>
  );
}

function GameHeader() {
  const currentPlayer = useSelector<Player | undefined>(state => getCurrentPlayer(state));
  return (
    <header>
      <h1>Game</h1>
      {currentPlayer && 
        <p>{currentPlayer.name}'s turn</p>
      }
    </header>
  );
}

function GameTile({tileId}: {tileId: string}) {
  const tile = useSelector<Tile>(state => state.tiles[tileId]);
  const currentPlayer = useSelector<Player | undefined>(state => getCurrentPlayer(state));

  const dispatch = reduxUseDispatch();
  
  const doRevealTileAction = useCallback(() => {
    dispatch(revealTileAction(tileId) as any);
  }, [tileId, dispatch]);

  return (
    <button data-tile-id={tile.id} onClick={doRevealTileAction} disabled={tile.state === 'matched' || currentPlayer?.type !== 'local'}>
      {tile.state === 'hidden' && <p>hidden</p>}
      {(tile.state === 'revealed' || tile.state === 'matched') && <p>{tile.match.text}</p>}
    </button>
  );
}

export default function AppContainer() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
