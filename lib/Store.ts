import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api/authApi";
import { sellerApi } from "@/lib/api/sellerApi";
import { homeApi } from "@/lib/api/homeApi";
import { addressApi } from "@/lib/api/addressApi";
import { sellerDashboardApi } from "@/lib/redux/service/sellerDashboardApi";
import { sellerProductApi } from "@/lib/redux/service/sellerProductApi";
import { sellerCommentApi } from "@/lib/redux/service/sellerCommentApi";
import { sellerMessageApi } from "@/lib/redux/service/sellerMessageApi";
import { purchaseApi } from "@/lib/redux/service/purchaseApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [authApi.reducerPath]: authApi.reducer,
      [sellerApi.reducerPath]: sellerApi.reducer,
      [homeApi.reducerPath]: homeApi.reducer,
      [addressApi.reducerPath]: addressApi.reducer,
      [sellerDashboardApi.reducerPath]: sellerDashboardApi.reducer,
      [sellerProductApi.reducerPath]: sellerProductApi.reducer,
      [sellerCommentApi.reducerPath]: sellerCommentApi.reducer,
      [sellerMessageApi.reducerPath]: sellerMessageApi.reducer,
      [purchaseApi.reducerPath]: purchaseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        authApi.middleware,
        sellerApi.middleware,
        homeApi.middleware,
        addressApi.middleware,
        sellerDashboardApi.middleware,
        sellerProductApi.middleware,
        sellerCommentApi.middleware,
        sellerMessageApi.middleware,
        purchaseApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

