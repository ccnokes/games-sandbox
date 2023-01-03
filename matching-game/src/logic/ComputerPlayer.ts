import {Store} from 'redux';
import {State, Actions} from './types';
import { revealTileAction } from './reducer';

export default class ComputerPlayer {

  private revealedTiles = new Set<string>();

  constructor(public readonly id: string) {}

  observeTurn(store: Store<State, Actions>) {
    console.log('observe turn');
    const {turn, tiles} = store.getState();
    const tilesArr = Object.values(tiles);
    const matchedTiles = tilesArr.filter(tile => tile.state === 'matched');

    // add revealed tiles
    // TODO add in a way that makes it easy to check for if we've seen a match before
    turn.revealedTileIds.forEach(tileId => this.revealedTiles.add(tileId));

    // remove any matched tiles
    matchedTiles.forEach(tile => {
      this.revealedTiles.delete(tile.id);
    });
  }

  async doTurn(store: Store<State, Actions>) {
    console.log('do turn');
    const {tiles} = store.getState();
    const tilesArr = Object.values(tiles);
    const hiddenTiles = tilesArr.filter(tile => tile.state === 'hidden');
    const randomTileIndex = randomIntFromInterval(0, hiddenTiles.length - 1);
    store.dispatch(revealTileAction(tilesArr[randomTileIndex].id) as any);
  }
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
