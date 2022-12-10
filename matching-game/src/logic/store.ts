import {createStore, applyMiddleware} from 'redux';
import reducer from './reducer';
import {State, Actions} from './types';
import thunk from 'redux-thunk'

export function configureStore() {
  return createStore<State, Actions, any, any>(reducer, applyMiddleware(logger, thunk));
}

const logger = (store: any) => (next: any) => (action: any) => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}