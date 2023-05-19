import { useState, useEffect, Component, ReactElement, useRef } from 'react';
import styles from './profile.module.scss';
import { useAppStore } from '@/store/store';
import Layout from '@/layouts/default';
import type { NextPageWithLayout } from '../_app';
import { secureFetchApi } from '@/apis/utils';
import config from '@/config';
import { formatDate } from '@/lib/date';
import omitEmpty from 'omit-empty';
import { useRouter } from 'next/router';
import { AlertModal } from '@/components/modal/alertModal';
import { json } from 'stream/consumers';


const Profile: NextPageWithLayout = () => {
    const { user, logout, token, isAuthenticated, setUser, setAuthenticated } = useAppStore()
    const [userUpdate, setUserUpdate] = useState({ password: "", birthday: user?.birthday });
    const [editing, setEditing] = useState({ password: false, birthday: false });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [modalCloseFunc, setModalCloseFunc] = useState<() => void>(() => { });
    const dateInputRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        setUserUpdate({ password: "", birthday: user?.birthday });
    }, [user]);

    const handleUpdate = async () => {
        // Make a PUT request to update the user's data
        const updateData = omitEmpty({ ...userUpdate })
        const response = await secureFetchApi<User>(`${config.baseUrl}/api/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        }, token?.csrf_token)
        setModalTitle(response.success ? "Update Success" : "Update Fail");
        setModalContent(response.success ? `you have updated your: ${Object.keys(updateData).map(field => `"${field}"`).join(' and ')} field` : "please refresh or try to login again");
        setModalCloseFunc(() => () => {
            setModalOpen(false);
        });
        setModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        setUserUpdate({ password: '', birthday: '' });
        router.push('/')
    };

    return (
        <>
            <div className={styles.container}>
                {user && (
                    <>
                        <h1 className={styles.title}>{user.username}</h1>
                        <div className={styles.field}>
                            <label>
                                Password:
                                {editing.password ? (
                                    <input required type="password" value={userUpdate.password} onChange={e => setUserUpdate({ ...userUpdate, password: e.target.value })} />
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
                                    <input type="date" ref={dateInputRef} onChange={e => { setUserUpdate({ ...userUpdate, birthday: formatDate(e.target.value) }); console.log(e) }} />
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