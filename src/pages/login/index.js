import React, { useState } from 'react';

// import komponen material-ui
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

// import styles
import useStyles from './styles';

// react router dom
import { Link, Redirect } from 'react-router-dom';

import isEmail from 'validator/lib/isEmail';

// firebase hook
import { useFirebase } from '../../components/FirebaseProvider';

// app components
import AppLoading from '../../components/AppLoading';

import { useSnackbar } from 'notistack';

function Login(props) {
    const { enqueueSnackbar } = useSnackbar();
    const {location} = props;
    const classes = useStyles();

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState({
        email: '',
        password: ''
    })
    const [isSubmitting, setSubmitting] = useState(false);

    const { auth, user, loading } = useFirebase();

    const handleChange = e => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
        setError({
            ...error,
            [e.target.name]: ''
        })
    }

    const validate = () => {

        const newError = { ...error };

        if (!form.email) {
            newError.email = 'Email wajib diisi';
        } else if (!isEmail(form.email)) {
            newError.email = 'Email tidak valid';
        }

        if (!form.password) {
            newError.password = 'Password wajib diisi';
        }
        return newError;
    }

    const handleSubmit = async e => {
        e.preventDefault();
        const findErrors = validate();

        if (Object.values(findErrors).some(err => err !== '')) {
            setError(findErrors);

        } else {
            try {
                setSubmitting(true);
                await auth.signInWithEmailAndPassword(form.email, form.password)
                enqueueSnackbar('Berhasil Login', { variant: 'success' })
            } catch (e) {

                const newError = {};

                switch (e.code) {

                    case 'auth/user-not-found':
                        newError.email = enqueueSnackbar('Email Tidak Terdaftar', { variant: 'error' });
                        break;
                    case 'auth/invalid-email':
                        newError.email = enqueueSnackbar('Email Tidak Valid, Harap Cek Kembali', { variant: 'warning' });
                        break;
                    case 'auth/wrong-password':
                        newError.password = enqueueSnackbar('Password Salah, Harap Cek Kembali', { variant: 'warning' });
                        break;
                    case 'auth/user-disabled':
                        newError.email = enqueueSnackbar('Selamat, Akun Pengguna Telah Di Blokir, Karena Menyalahi Aturan Layanan Kami', { variant: 'error' });
                        break;
                    default:
                        newError.email = enqueueSnackbar('Terjadi kesalahan silahkan coba lagi', { variant: 'error' });
                        break;
                }

                setError(newError);
                setSubmitting(false);

            }

        }
    }

    if (loading) {

        return <AppLoading />
    }
    if (user) {
        const redirecTo = location.state && location.state.from && location.state.from.pathname ?
        location.state.from.pathname : '/';
        return <Redirect to={redirecTo} />
    }

    console.log(user)
    return <Container maxWidth="xs">
        <Paper className={classes.paper}>
            <Typography
                variant="h5"
                component="h1"
                className={classes.title}>Login</Typography>

            <form onSubmit={handleSubmit} noValidate>
                <TextField
                    id="email"
                    type="email"
                    name="email"
                    margin="normal"
                    label="Masukan Email"
                    variant="outlined"
                    fullWidth
                    required
                    value={form.email}
                    onChange={handleChange}
                    helperText={error.email}
                    error={error.email ? true : false}
                    disabled={isSubmitting}
                />
                <TextField
                    id="password"
                    type="password"
                    name="password"
                    margin="normal"
                    label="Masukan Password"
                    variant="outlined"
                    fullWidth
                    required
                    value={form.password}
                    onChange={handleChange}
                    helperText={error.password}
                    error={error.password ? true : false}
                    disabled={isSubmitting}
                />
                
                <Grid container className={classes.buttons}>
                    <Grid item xs>
                        <Button
                            disabled={isSubmitting}
                            type="submit" color="primary" variant="contained"
                            size="large"
                        >Login</Button>
                    </Grid>
                    <Grid item>
                        <Button
                            disabled={isSubmitting}
                            component={Link}
                            variant="contained"
                            size="large"
                            to="/registrasi"
                        >Daftar Akun</Button>
                    </Grid>
                </Grid>
            <div className={classes.forgotPassword}>
            <Typography>

                Lupa Password? <Link to="/lupa-password">Click Here</Link>

            </Typography>
            </div>

            </form>

        </Paper>
    </Container>
}

export default Login;