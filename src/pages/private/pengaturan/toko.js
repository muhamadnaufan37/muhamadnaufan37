import React, { useState, useEffect }from 'react';

// material-ui
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

// styles
import useStyles from './styles/toko';

// validtor
import isURL from 'validator/lib/isURL';

//firebase hook
import { useFirebase } from '../../../components/FirebaseProvider';
import { useSnackbar } from 'notistack';

import { useDocument } from 'react-firebase-hooks/firestore';

import AppPageLoading from '../../../components/AppPageLoading';



import { Prompt } from 'react-router-dom';

function Toko(){
    const classes = useStyles();

    const { firestore, user } = useFirebase();

    const tokoDoc = firestore.doc(`toko/${user.uid}`)
    const [snapshot, loading] = useDocument(tokoDoc);
    const { enqueueSnackbar } = useSnackbar();
    const [form, setForm] = useState({
        nama: '',
        alamat: '',
        telepon: '',
        website: ''
    })
    const [error, setError] = useState({
        nama: '',
        alamat: '',
        telepon: '',
        website: ''
    })

    const [isSubmitting, setSubmitting] = useState(false);
    const [isSomethingChange, setSomethingChange] = useState(false);
    
    

    const handleChange = e => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
        setError({
            [e.target.name]: ''
        })
        
        setSomethingChange(true);
    }

    const validate = () => {

        const newError = { ...error };

        if (!form.nama) {
            newError.nama = 'Nama wajib diisi';
        }

        if (!form.alamat) {
            newError.alamat = 'Alamat wajib diisi';
        }

        if (!form.telepon) {
            newError.telepon = 'Telepon wajib diisi';
        }

        if (!form.website) {
            newError.website = 'Website wajib diisi';
        } else if (!isURL(form.website)) {
            newError.website = 'Website tidak valid';
        }
        return newError;
    }

    const handleSubmit = async e => {

        e.preventDefault();
        const findErrors = validate();

        if (Object.values(findErrors).some(err => err !== '')) {
            setError(findErrors);
        } else {

            setSubmitting(true);
            try {
                await tokoDoc.set(form, { merge: true });
                setSomethingChange(false);
                enqueueSnackbar('Data Toko berhasil di simpan', { variant: 'success' })
            }
            catch (e) {
                enqueueSnackbar(e.message, {
                    variant:'error'
                })
            }
            setSubmitting(false);
        }

    }

    if (loading) {
        return <AppPageLoading/>
    }

    return <div className={classes.pengaturanToko}>
        <form onSubmit={handleSubmit} noValidate>
            <TextField
                id="nama"
                name="nama"
                label="Nama Toko"
                margin="normal"
                variant="outlined"
                required
                fullWidth
                value={form.nama}
                onChange={handleChange}
                error={error.nama ? true : false}
                helperText={error.nama}
                disabled={isSubmitting}

            />
            <TextField
                id="alamat"
                name="alamat"
                label="Alamat Toko"
                margin="normal"
                variant="outlined"
                required
                multiline
                rowsMax={3}
                fullWidth
                value={form.alamat}
                onChange={handleChange}
                error={error.alamat ? true : false}
                helperText={error.alamat}
                disabled={isSubmitting}

            />
            <TextField
                id="telepon"
                name="telepon"
                label="No Telepon Toko"
                margin="normal"
                variant="outlined"
                required
                fullWidth
                value={form.telepon}
                onChange={handleChange}
                error={error.telepon ? true : false}
                helperText={error.telepon}
                disabled={isSubmitting}

            />


            <TextField
                id="website"
                name="website"
                label="Website Toko"
                margin="normal"
                variant="outlined"
                value={form.website}
                required
                fullWidth
                onChange={handleChange}
                error={error.website ? true : false}
                helperText={error.website}
                disabled={isSubmitting}

            />

            <Button
                type="submit"
                className={classes.actionButton}
                variant="contained"
                color="primary"
                disabled={isSubmitting || !isSomethingChange}
            >
                Simpan
            </Button>
        </form>
        <Prompt
            when={isSomethingChange}
            message="Terdapat perubahan yang belum disimpan, apakah anda yakin ingin meninggalkan halaman ini?"
        />
    </div>
}

export default Toko;