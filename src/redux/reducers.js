

import userSlice from './slice/userSlice';
import alertSnackSlice from './slice/alertSnackSlice';
import extraSlice from './slice/extraSlice';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['user', 'extra', 'alertSnack'],
    blacklist: [],
}
const rootReducer = combineReducers({
    user: userSlice,
    extra: extraSlice,
    alertSnack: alertSnackSlice,
});
export default persistReducer(persistConfig, rootReducer);