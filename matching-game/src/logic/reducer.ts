import { ThunkAction } from 'redux-thunk';
import ComputerPlayer from './ComputerPlayer';
import id from './id';
import {
  Tile,
  State,
  Actions,
  Match,
  Player,
} from './types';

function createDefaultPlayer(): Player {
  return {
    id: id(),
    name: 'You',
    type: 'local'
  };
}

function createComputerPlayer(): Player {
  return {
    id: id(),
    name: 'Computer',
    type: 'computer'
  };
}

export function createDefaultState(): State {
  const player = createDefaultPlayer();
  const player2 = createComputerPlayer();
  return {
    gameState: 'setup',
    turn: {
      player: undefined,
      revealedTileIds: [],
    },
    players: [player, player2],
    scores: {
      [player.id]: 0,
      [player2.id]: 0,
    },
    tiles: {},
    tileOrder: [],
    computerPlayers: {
      [player2.id]: new ComputerPlayer(player2.id),
    },
  };
}

export default function gameReducer(state: State | undefined = createDefaultState(), action: Actions): State {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const {player} = action.payload;
      
      // handle computer players
      let nextComputerPlayers = {...state.computerPlayers};
      if (player.type === 'computer') {
        nextComputerPlayers[player.id] = new ComputerPlayer(player.id);
      }

      return {
        ...state,
        players: state.players.concat(player),
        scores: {
          ...state.scores,
          [player.id]: 0,
        },
        computerPlayers: nextComputerPlayers,
      };
    }
    case 'START': {
      if (!validateGameBeforeStart(state)) {
        throw new Error('invalid game');
      }
      const tiles = generateTiles();
      const tileOrder = shuffleTiles(tiles);
      return {
        ...state,
        gameState: 'in-progress',
        tiles,
        tileOrder,
        turn: {
          ...state.turn,
          player: state.players[0].id,
        },
      };
    }

    case 'REVEAL_TILE': {
      const {tileId} = action.payload;
      const {turn, tiles} = state;
      const tile = tiles[tileId];
      
      if (tile.state !== 'hidden' || turn.revealedTileIds.length >= 2) {
        // TODO - nope
        console.log('nope, invalid REVEAL_TILE');
        return state;
      }

      const revealedTileIds = turn.revealedTileIds.concat(tileId);

      const updatedTile: Tile = {
        ...tile,
        state: 'revealed',
      };
      const updatedTiles = {
        ...state.tiles,
        [updatedTile.id]: updatedTile,
      };

      return {
        ...state,
        turn: {
          ...state.turn,
          revealedTileIds,
        },
        tiles: updatedTiles,
      };
    }
    // handle updating tile matches's state if needed
    // or changing to next player's turn
    case 'TURN_OVER': {
      const {turn, tiles, players, scores} = state;
      let nextTurn = {
        ...turn,
      };
      let updatedTiles = {
        ...tiles,
      };
      let nextScores = {
        ...scores,
      };
      const [tileA, tileB] = getRevealedTiles(state);

      if (revealedTilesMatch(state)) {
        // update tiles
        updatedTiles[tileA.id] = {
          ...tileA,
          state: 'matched',
        };
        updatedTiles[tileB.id] = {
          ...tileB,
          state: 'matched',
        };
        // player stays the same
        if (turn.player) {
          nextScores[turn.player] = scores[turn.player] + 1;
        }
      } else {
        updatedTiles[tileA.id] = {
          ...tileA,
          state: 'hidden',
        };
        updatedTiles[tileB.id] = {
          ...tileB,
          state: 'hidden',
        };
        // next player
        const currentPlayerIdx = players.findIndex(player => turn.player === player.id);
        const nextPlayer = getNextArrayItem(currentPlayerIdx, players);
        nextTurn.player = nextPlayer.id;
      }

      // reset tiles
      nextTurn.revealedTileIds = [];

      return {
        ...state,
        turn: nextTurn,
        tiles: updatedTiles,
        scores: nextScores,
      };
    }

    case 'GAME_COMPLETE': {
      return {
        ...state,
        gameState: 'ended',
        turn: {
          player: undefined,
          revealedTileIds: [],
        },
      };
    }

    default:
      return state;
  }
}

function tilesMatch(tileA: Tile, tileB?: Tile) {
  if (!tileB) return false;
  return tileA.match === tileB.match;
}

// handles rolling over
function getNextArrayItem<T = unknown>(index: number, arr: T[]) {
  return index + 1 >= arr.length ? 
    arr[0] : 
    arr[index + 1];
}

function validateGameBeforeStart(state: State) {
  return state.players.length > 0 && state.gameState === 'setup';
}

function isGameComplete(state: State) {
  const {tiles} = state;
  return Object.keys(tiles).every(tileId => tiles[tileId].state === 'matched');
}

function generateTiles(tileCount = 16): State['tiles'] {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // we need half the amount of matches because 2 tiles per match
  const matches: Match[] = new Array(tileCount / 2).fill({}).map((_, idx) => ({
    id: id(),
    text: alphabet[idx],
  }));

  const tilesMap: State['tiles'] = {};
  let n = 0;
  while (n < tileCount) {
    const tile: Tile = {
      id: id(),
      // modulo half the amount of matches so we walk around the array again and every match has 2 tiles
      match: matches[n % (tileCount / 2)],
      state: 'hidden',
    };
    tilesMap[tile.id] = tile;
    n++;
  }
  
  return tilesMap;
}

function shuffleTiles(tiles: State['tiles']) {
  const ids = Object.keys(tiles);
  return shuffle(ids);
}

// Fisher-Yates (aka Knuth) Shuffle.
// from https://stackoverflow.com/a/2450976/1397311
// shuffles in place
function shuffle(array: any[]) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function getPlayer(state: State, playerId: string | undefined) {
  if (!playerId) return undefined;

  const {players} = state;
  return players.find(player => player.id === playerId);
}

export function getCurrentPlayer(state: State) {
  const {turn} = state;
  return getPlayer(state, turn.player);
}

export function getComputerPlayers(state: State) {
  const {computerPlayers} = state;
  return Object.values(computerPlayers);
}

export function getComputerPlayer(state: State, playerId: string) {
  const {computerPlayers} = state;
  return computerPlayers[playerId];
}

export function hasComputerPlayers(state: State) {
  return getComputerPlayers(state).length > 0;
}

function isSecondReveal(state: State) {
  const {turn} = state;
  return turn.revealedTileIds.length === 1;
}

function getRevealedTiles(state: State) {
  const {turn, tiles} = state;
  return turn.revealedTileIds.map(tileId => tiles[tileId]);
}

function revealedTilesMatch(state: State) {
  const [tileA, tileB] = getRevealedTiles(state);
  return tilesMatch(tileA, tileB);
}

export function canRevealTile(state: State) {
  const {turn} = state;
  return turn.revealedTileIds.length < 2;
}

export function revealTileAction(tileId: string, abortController?: AbortController) {
  const revealTile: ThunkAction<void, State, void, Actions> = async (dispatch, getState) => {
    if (!canRevealTile(getState())) {
      abortController?.abort();
      return;
    }

    const isLastAction = isSecondReveal(getState());
    dispatch({ type: 'REVEAL_TILE', payload: {tileId} });
    
    if (isLastAction) {
      await wait(2000, abortController?.signal);
      dispatch({ type: 'TURN_OVER', payload: {} });
    }

    if (isGameComplete(getState())) {
      dispatch({ type: 'GAME_COMPLETE', payload: {} });
    }
  };
  return revealTile;
}

// aborting resolves it early
function wait(ms: number, abortSignal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (abortSignal?.aborted) return resolve();

    const id = setTimeout(resolve, ms);
    
    abortSignal?.addEventListener('abort', () => {
      clearTimeout(id);
      resolve();
    }, {once: true});
  });
}