import { NextPage } from 'next';
import './globals.css'
import type { AppProps } from 'next/app'
import { ReactElement, ReactNode, useEffect } from 'react';
import { secureFetchApi } from '@/apis/utils';
import config from '@/config';
import { useAppStore } from '@/store/store';


export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const { user, token, logout, isAuthenticated, setUser, setAuthenticated, setToken } = useAppStore()
  useEffect(() => {
    const fetchUser = async () => {
      const response = await secureFetchApi<User & { csrf_token: string }>(`${config.baseUrl}/api/auth/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.success) {
        const data = response.data;
        setUser(data!)
        setAuthenticated(true)
        setToken({ ...token, csrf_token: response.data!.csrf_token })
      }
      else {
        // use refresh token to get new csrf token
        const response = await secureFetchApi<User & { csrf_token: string }>(`${config.baseUrl}/api/auth/token/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }, token?.refresh_token)
        if (response.success) {
          const data = response.data;
          setUser(data!)
          setAuthenticated(true)
          setToken({ ...token, csrf_token: response.data!.csrf_token })
        }
        else {
          logout();
        }
      }

    };
    fetchUser();
  }, [setAuthenticated, setUser, setToken]);

  const getLayout = Component.getLayout ?? ((page: any) => page);
  return getLayout(<Component {...pageProps} />);
}
