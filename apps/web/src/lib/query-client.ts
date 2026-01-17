import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

const handle401Error = async () => {
  await authClient.signOut();
  window.location.href = "/auth/login";
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: async (error: any) => {
      if (error?.response?.status === 401 || error?.status === 401) {
        await handle401Error();
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: async (error: any) => {
      if (error?.response?.status === 401 || error?.status === 401) {
        await handle401Error();
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401 || error?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401 || error?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
