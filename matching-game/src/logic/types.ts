import ComputerPlayer from './ComputerPlayer';

export type Player = {
  id: string,
  name: string,
  type: 'local' | 'remote' | 'computer',
}

export type Match = {
  id: string,
  img?: string,
  text?: string,
}

export type Tile = {
  id: string, // unique id
  match: Match,
  state: 'hidden' | 'revealed' | 'matched',
}

export type State = {
  gameState: 'setup' | 'in-progress' | 'ended',
  turn: {
    player?: string,
    revealedTileIds: string[],
  },
  players: Player[],
  scores: {[playerId: string]: number},
  tiles: {[tileId: string]: Tile},
  tileOrder: string[],
  computerPlayers: {[playerId: string]: ComputerPlayer}
}

export interface Action<Type extends string, Payload extends {} = {}> {
  type: Type,
  payload: Payload,
  error?: boolean,
  meta?: {},
}

export type Actions = |
  Action<'ADD_PLAYER', {
    player: Player,
  }> |
  Action<'START'> |
  Action<'REVEAL_TILE', {
    tileId: string,
  }> | 
  Action<'TURN_OVER'> |
  Action<'GAME_COMPLETE'>;