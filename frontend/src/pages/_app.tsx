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
  const { user, logout, token, isAuthenticated, setUser, setAuthenticated, setToken } = useAppStore()
  useEffect(() => {
    const fetchUser = async () => {
      const response = await secureFetchApi<User & {csrf_token: string}>(`${config.baseUrl}/api/auth/user`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      })
      if (response.success) {
          const data = response.data;
          setUser(data!)
          setAuthenticated(true)
          setToken({...token, csrf_token: response.data!.csrf_token})
      }
  };
  fetchUser();
  }, [setAuthenticated, setUser, setToken]);

  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(<Component {...pageProps} />);
}
