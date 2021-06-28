import React, { useRef, useState } from 'react';

// material ui
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useFirebase } from '../../../components/FirebaseProvider';

// styles
import useStyles from './styles/pengguna';

import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { useSnackbar } from 'notistack';

import isEmail from 'validator/lib/isEmail';

function Pengguna() {
    const classes = useStyles();
    const { user } = useFirebase();
    const [error, setError] = useState({
        displayName: '',
        email: '',
        password: ''
    })
    const { enqueueSnackbar } = useSnackbar();
    const [isSubmitting, setSubmitting] = useState(false);
    const displayNameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();

    const saveDisplayName = async (e) => {

        const displayName = displayNameRef.current.value;
        console.log(displayName);

        if (!displayName) {
            setError({
                displayName: 'Nama wajib diisi'
            })
        } else if (displayName !== user.displayName) {

            setError({
                displayName: ''
            })
            setSubmitting(true);
            await user.updateProfile({
                displayName
            })
            setSubmitting(false);
            enqueueSnackbar('Data Pengguna Berhasil Di Ganti', { variant: 'success' })
        }
    }

    const updateEmail = async (e) => {
        const email = emailRef.current.value;

        if (!email) {
            setError({
                email: 'Email wajib diisi'
            })
        }
        else if (!isEmail(email)) {
            setError({
                email: 'Email tidak valid'
            })
        }
        else if (email !== user.email) {
            setError({
                email: ''
            })
            setSubmitting(true)
            try {
                await user.updateEmail(email);

                enqueueSnackbar('Email berhasil diperbarui', { variant: 'success' });
            }
            catch (e) {
                let emailError = '';
                switch (e.code) {
                    case 'auth/email-already-in-use':
                        emailError = enqueueSnackbar('Email sudah digunakan oleh pengguna lain', { variant: 'error' });
                        break;
                    case 'auth/invalid-email':
                        emailError = enqueueSnackbar('Email tidak valid', { variant: 'warning' });
                        break;
                    case 'auth/requires-recent-login':
                        emailError = enqueueSnackbar("Silahkan logout, kemudian login kembali untuk memperbarui email", { variant: 'success' });
                        break;
                    default:
                        emailError = enqueueSnackbar('Terjadi kesalahan silahkan coba lagi', { variant: 'warning' });
                        break;
                }

                setError({
                    email: emailError
                })

            }

            setSubmitting(false)
        }

    }
    const sendEmailVerification = async (e) => {

        const actionCodeSettings = {
            url: `${window.location.origin}/login`
        };

        setSubmitting(true);
        await user.sendEmailVerification(actionCodeSettings);
        enqueueSnackbar(`Email verifikasi telah dikirim ke ${emailRef.current.value}`, { variant: 'success' });
        setSubmitting(false);
    }

    const updatePassword = async (e) => {

        const password = passwordRef.current.value;

        if (!password) {

            setError({
                password: 'Password wajib diisi'
            })
        } else {
            setSubmitting(true)
            try {

                await user.updatePassword(password);

                enqueueSnackbar('Password berhasil diperbarui', { variant: 'success' })
            }
            catch (e) {

                let errorPassword = '';

                switch (e.code) {

                    case 'auth/weak-password':
                        errorPassword = enqueueSnackbar('Password terlalu lemah', { variant: 'warning' });
                        break;
                    case 'auth/requires-recent-login':
                        errorPassword = enqueueSnackbar('Silahkan logout, kemudian login kembali untuk memperbarui password', { variant: 'success' });
                        break;
                    default:
                        errorPassword = enqueueSnackbar('Terjasi kesalahan silahkan coba lagi', { variant: 'warning' });
                        break;

                }

                setError({
                    password: errorPassword
                })

            }
            setSubmitting(false);
        }

    }
    return <div className={classes.pengaturanPengguna}>
        <TextField
            id="displayName"
            name="displayName"
            label="Nama"
            variant="outlined"
            margin="normal"
            defaultValue={user.displayName}
            inputProps={{
                ref: displayNameRef,
                onBlur: saveDisplayName
            }}
            disabled={isSubmitting}
            helperText={error.displayName}
            error={error.displayName ? true : false}
        />

        <TextField
            id="email"
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            margin="normal"
            defaultValue={user.email}
            inputProps={{
                ref: emailRef,
                onBlur: updateEmail
            }}
            disabled={isSubmitting}
            helperText={error.email}
            error={error.email ? true : false}

        />

        {
            user.emailVerified ?
                <Typography color="primary" variant="subtitle1">
                <Button
                    variant="contained"
                >
                Email Terverifikasi  <CheckBoxIcon/>
                </Button>
                </Typography>
                :
                <Button
                    variant="contained"
                    color="primary"
                    onClick={sendEmailVerification}
                    disabled={isSubmitting}
                >
                    Kirim Email Verifikasi
                </Button>

        }

        <TextField
            id="password"
            name="password"
            label="Password Baru"
            type="password"
            variant="outlined"
            margin="normal"
            inputProps={{
                ref: passwordRef,
                onBlur: updatePassword
            }}
            autoComplete="new-password"
            disabled={isSubmitting}
            helperText={error.password}
            error={error.password ? true : false}

        />

    </div>
}

export default Pengguna;