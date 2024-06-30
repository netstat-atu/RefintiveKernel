import { Alert, Snackbar, Typography } from '@mui/material'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { closeAlertSnack } from '../redux/slice/alertSnackSlice';

const AlertSnack = props => {
    const alertOption = useSelector(state => state.alertSnack);
    const dispatch = useDispatch();
    const closeAlertHandle = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(closeAlertSnack())
    }
    return (
        <Snackbar autoHideDuration={15000} open={alertOption?.isOpen} onClose={closeAlertHandle}>
            <Alert onClose={closeAlertHandle} severity={alertOption?.type ? alertOption?.type : "success"}>
                <Typography>{alertOption?.message}</Typography>
            </Alert>
        </Snackbar>
    )
}

export default AlertSnack