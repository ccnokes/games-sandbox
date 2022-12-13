import { useCallback } from 'react';
import {useSelector as reduxUseSelector, useDispatch as reduxUseDispatch, useStore as reduxUseStore} from 'react-redux';
import {State, Actions, Action} from './types';

export function useSelector<R>(fn: (state: State) => R) {
  return reduxUseSelector<State, ReturnType<typeof fn>>(fn);
}

export function useStore() {
  return reduxUseStore<State, Actions>();
}

export function useDispatch(action: Actions, deps: any[] = []): () => void {
  const dispatch = reduxUseDispatch();
  // eslint-disable-next-line
  return useCallback(() => dispatch(action), [action, dispatch, ...deps]);
}

// memoized by default
// export function useSelector<R>(fn: (state: State) => R, deps: any[] = []) {
//   const store = useStore<State>();
//   return useMemo(() => fn(store.getState()), deps);
// }