import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import activitiesReducer from './slices/activitiesSlice';
import dashboardReducer from './slices/dashboardSlice';
import onboardingReducer from './slices/onboardingSlice';
import organizationsReducer from './slices/organizationsSlice';
import userReducer from './slices/userSlice';
import paymentsReducer from './slices/paymentsSlice';
import invoicesReducer from './slices/invoicesSlice';
import feesReducer from './slices/feesSlice';
import taxesReducer from './slices/taxesSlice';
import identityConfigReducer from './slices/identityConfigSlice';
import userManagementReducer from './slices/userManagementSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    onboarding: onboardingReducer,
    organizations: organizationsReducer,
    users: userReducer,
    payments: paymentsReducer,
    fees: feesReducer,
    taxes: taxesReducer,
    invoices: invoicesReducer,
    identityConfig: identityConfigReducer,
    userManagement: userManagementReducer,
    notifications: notificationsReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
