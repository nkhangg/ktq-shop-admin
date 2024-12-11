import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { appReducer, comfirmReducer, forgotPasswordReducer, mainLayoutReducer } from './slices';

// config persist
const persistConfig = {
    key: 'app',
    storage,
    whitelist: ['forgotPass', 'app'],
};

const rootReducer = combineReducers({
    forgotPass: forgotPasswordReducer,
    app: appReducer,
    mainLayout: mainLayoutReducer,
    comfirm: comfirmReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
