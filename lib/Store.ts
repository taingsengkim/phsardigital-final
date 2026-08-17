import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api/authApi";
import { sellerApi } from "@/lib/api/sellerApi";
import { homeApi } from "@/lib/api/homeApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [sellerApi.reducerPath]: sellerApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        sellerApi.middleware,
        homeApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

