import {createStore, applyMiddleware, Store} from 'redux';
import reducer from './reducer';
import {State, Actions} from './types';
import thunk from 'redux-thunk'
import { 
  getComputerPlayer,
  getCurrentPlayer, 
  getComputerPlayers, 
  hasComputerPlayers,
  canRevealTile,
} from './reducer';

export function configureStore() {
  return createStore<State, Actions, any, any>(
    reducer, 
    applyMiddleware(
      logger, 
      handleComputerPlayer as any,
      thunk
    )
  );
}

const logger = (store: any) => (next: any) => (action: any) => {
  if (typeof action === 'object' && !!action.type) console.log('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
}

const handleComputerPlayer = (store: Store<State, Actions>) => (next: (action: Actions) => State) => (action: Actions) => {
  const result = next(action);
  if (!hasComputerPlayers(store.getState()) || action.type === 'START' || action.type === 'ADD_PLAYER') return result;

  const computerPlayersArr = getComputerPlayers(store.getState());
  const currentPlayer = getCurrentPlayer(store.getState());

  // on every turn, each ComputerPlayer calls `observeTurn()`, even if there own turn
  if (computerPlayersArr.length > 0) {
    computerPlayersArr.forEach(computerPlayer => computerPlayer.observeTurn(store));
  }

  // when a ComputerPlayer's turn, `doTurn()`
  if (currentPlayer?.type === 'computer' && canRevealTile(store.getState())) {
    const computerPlayer = getComputerPlayer(store.getState(), currentPlayer.id);
    // timeout because it'll trigger a new state update, but we're in the middle of one already
    setTimeout(() => {
      computerPlayer.doTurn(store);
    }, 0);
  }

  return result;
};