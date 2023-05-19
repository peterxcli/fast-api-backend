/* eslint-disable @next/next/no-css-tags */
import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from './index.module.scss'
import { FormEvent, ReactElement, useState } from 'react';
import { secureFetchApi } from '@/apis/utils';
import config from '@/config';
import { useAppStore } from '@/store/store';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from './_app';
import Layout from '@/layouts/default';
import { AlertModal } from '@/components/modal/alertModal';

const inter = Inter({ subsets: ['latin'] })

const Home: NextPageWithLayout = () => {
  const { user, logout, token, isAuthenticated, setUser, setAuthenticated, setToken } = useAppStore()
  // const [theme, setTheme] = useState(themes[0].value);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalCloseFunc, setModalCloseFunc] = useState<() => void>(() => { });
  const router = useRouter()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    let response = await secureFetchApi<Token>(`${config.baseUrl}/api/auth/token`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.success) {
      setModalTitle("Login Fail, please try again");
      setModalContent("username or password is incorrect");
      setModalCloseFunc(() => () => {
        setModalOpen(false);
      });
      setModalOpen(true);
      console.error('Login failed:', response.error);
      return
    }
    response = await secureFetchApi<User & { csrf_token: string }>(`${config.baseUrl}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.success) {
      setModalTitle("Login Fail, please try again");
      setModalContent("cant get your identity");
      setModalCloseFunc(() => () => {
        setModalOpen(false);
      });
      console.error('Login failed:', response.error);
      return
    }
    setAuthenticated(true)
    setUser(response.data! as User)
    setToken({ ...token, csrf_token: response.data!.csrf_token })
    console.log('Login successful');
    router.push('/profile')
  };

  return (
    <>
      <div className={styles.index}>
        <Head>
          <title>meow</title>
          <meta name="description" content="meow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="favicon.ico" />
        </Head>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <button type="submit">Log in</button>
        </form>

      </div>
      <AlertModal
        open={modalOpen}
        handleClose={modalCloseFunc}
        style={
          {
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            zIndex: 9999
          }
        }
        title={modalTitle}
        content={modalContent}
      />
    </>

  )
}

Home.getLayout = (page: ReactElement) => {
  return (
    <Layout>
      {page}
    </Layout>
  )
}

export default Home


