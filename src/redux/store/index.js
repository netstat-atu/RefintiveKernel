
import { createStore, applyMiddleware } from "redux";
import { persistStore } from "redux-persist";
import reducers from "./../reducers";
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

export const store = createStore(reducers, composedEnhancer);

export const persistor = persistStore(store);
export default { store, persistor };