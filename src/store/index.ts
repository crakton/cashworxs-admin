import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import activitiesReducer from './slices/activitiesSlice'
import dashboardReducer from './slices/dashboardSlice'
import onboardingReducer from './slices/onboardingSlice'
import userReducer from './slices/userSlice'
import paymentsReducer from './slices/paymentsSlice'
import invoicesReducer from './slices/invoicesSlice'
import feesReducer from './slices/feesSlice'
import taxesReducer from './slices/taxesSlice'

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    onboarding: onboardingReducer,
    users: userReducer,
    payments: paymentsReducer,
    fees: feesReducer,
    taxes: taxesReducer,
    invoices: invoicesReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
