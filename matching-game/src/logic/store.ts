import {createStore, applyMiddleware, Store} from 'redux';
import reducer from './reducer';
import {State, Actions} from './types';
import thunk from 'redux-thunk'
import { getPlayer } from './reducer';

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
  // console.log('dispatching', action);
  const result = next(action);
  // console.log('next state', store.getState());
  return result;
}

const handleComputerPlayer = (store: Store<State, Actions>) => (next: (action: Actions) => State) => (action: Actions) => {
  const nextState = next(action);
  const {turn, computerPlayer} = nextState;
  
  if (!turn.player) return nextState;

  const nextPlayer = getPlayer(nextState, turn.player);
  if (nextPlayer && nextPlayer.type === 'computer' && !!computerPlayer) {
    setTimeout(() => {
      computerPlayer.doTurn();
    }, 0);
  }

  return nextState;
};