'use client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';

// Type Imports
import type { ChildrenType } from '@core/types';

// Store Import
import { store } from '@/store';

const ReduxProvider = (props: ChildrenType) => {
  // Props
  const { children } = props;

  //
  const queryClient = useQueryClient(
    new QueryClient({ defaultOptions: { queries: { retry: 3 }, mutations: { retry: 3 } } })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
};

export default ReduxProvider;
