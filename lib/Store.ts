import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api/authApi";
import { sellerApi } from "@/lib/api/sellerApi";
import { homeApi } from "@/lib/api/homeApi";
import { sellerProductApi } from "@/lib/redux/service/sellerProductApi";
import { sellerDashboardApi } from "@/lib/redux/service/sellerDashboardApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [sellerApi.reducerPath]: sellerApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
      [sellerProductApi.reducerPath]: sellerProductApi.reducer,
      [sellerDashboardApi.reducerPath]: sellerDashboardApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        sellerApi.middleware,
        homeApi.middleware,
        sellerProductApi.middleware,
        sellerDashboardApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

