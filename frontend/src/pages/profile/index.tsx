import { useState, useEffect, Component, ReactElement, useRef } from 'react';
import styles from './Profile.module.scss';
import { useAppStore } from '@/store/store';
import Layout from '@/layouts/default';
import type { NextPageWithLayout } from '../_app';
import { secureFetchApi } from '@/apis/utils';
import config from '@/config';
import { formatDate } from './util';


const Profile: NextPageWithLayout = () =>  {
    const { user, logout, token, isAuthenticated, setUser, setAuthenticated } = useAppStore()
    const [userUpdate, setUserUpdate] = useState({ password: "", birthday: user?.birthday });
    const [editing, setEditing] = useState({ password: false, birthday: false });
    const dateInputRef = useRef(null);

    useEffect(() => {
        setUserUpdate({ password: "", birthday: user?.birthday });
    }, [user]);

    const handleUpdate = () => {
        // Make a PUT request to update the user's data
        secureFetchApi<User>(`${config.baseUrl}/api/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...userUpdate}),
        }, token?.csrf_token)
    };

    const handleLogout = () => {
        // fetch('/api/logout').then(() => {
        //     setUserUpdate({ password: '', birthday: new Date() });
        //     // window.location.href = '/login';
        // });
        setUserUpdate({ password: '', birthday: ''});
    };

    return (
        <div className={styles.container}>
            {user && (
                <>
                    <h1 className={styles.title}>{user.username}</h1>
                    <div className={styles.field}>
                        <label>
                            Password:
                            {editing.password ? (
                                <input type="password" value={userUpdate.password} onChange={e => setUserUpdate({ ...userUpdate, password: e.target.value })} />
                            ) : (
                                <span>{userUpdate.password}</span>
                            )}
                        </label>
                        <button onClick={() => setEditing({ ...editing, password: !editing.password })}>
                            {editing.password ? 'Save' : 'Edit'}
                        </button>
                    </div>
                    <div className={styles.field}>
                        <label>
                            Birthday:
                            {editing.birthday ? (
                                <input type="date" ref={dateInputRef} onChange={e => {setUserUpdate({ ...userUpdate, birthday: formatDate(e.target.value) }); console.log(e)}} />
                            ) : (
                                <span>{userUpdate.birthday}</span>
                            )}
                        </label>
                        <button onClick={() => setEditing({ ...editing, birthday: !editing.birthday })}>
                            {editing.birthday ? 'Save' : 'Edit'}
                        </button>
                    </div>
                    <button className={styles.button} onClick={handleUpdate}>Update</button>
                    <button className={styles.button} onClick={handleLogout}>Logout</button>
                </>
            )}
        </div>
    );
}

Profile.getLayout = (page: ReactElement) => {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default Profile;