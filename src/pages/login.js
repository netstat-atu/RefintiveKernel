
import React from 'react'
import Head from 'next/head'

//** mui */
import { Alert, Box, Card, CardContent, FormControl, Grid, IconButton, InputAdornment, InputLabel, Link, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab';

import axios from 'axios';

import { pathNameBaseOnStage, theodore_api } from '../services/configHandle';


import TermAndCondition from '../components/TermAndCondition';

const Login = () => {

    const [loader, setLoader] = React.useState(false);
    const [alert, setAlert] = React.useState(null);
 
    const openAlertHandle = (type = "success", message = "Message") => setAlert({ type: type, message: message });
    const setSessionManage = (token) => typeof window !== 'undefined' ? localStorage.setItem('token', token) : null

    const loginHandle = async (event) => {
        setLoader(true);
        event.preventDefault();
        const loginData = new FormData(event.currentTarget);
        const email = loginData.get("email");
        const pass = loginData.get('pass');
        const body = {
            "handle": email,
            "handleType": "email",
            "password": pass,
            "tokenDurationInMins": 120
        }
        await axios.post(theodore_api + '/authtokens', body)
            .then(response => {
                if (response.status == 200) {
                    const userDataAPI = response?.data?.data;
                    if (userDataAPI.associatedOrgs.length > 0) {
                        setSessionManage(userDataAPI.token);
                        setOrgList(userDataAPI.associatedOrgs);
                        setUserData(userDataAPI);
                        openAlertHandle("success", "Login successful please choose organization");
                    } else {
                        openAlertHandle("error", "Please register organization");
                    }
                } else {
                    openAlertHandle("error", JSON.stringify(response?.data?.error?.message));
                }
            })
            .catch(error => {
                console.log('There was an error while SignIn!', error);
                openAlertHandle("error", JSON.stringify(error?.response?.data?.error?.message))
            }).finally(() => {
                setLoader(false)
            });
    };

    
    const clickSubmit = (event) => {
        event.preventDefault();
        setLoader(true);
        // Simulate a delay or async operation
        setTimeout(() => {
          setLoader(false);
          router.push("/signup");
        }, 2000);
      };

    return (
        <>
            <Head> <title>Vishal Profile</title></Head>
            <Box style={{ height: '100vh', padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card component={"form"} onSubmit={loginHandle}>
                    <CardContent spacing={3}>
                        <Stack>
                            {alert && <Alert onClose={() => setAlert(null)} severity={alert?.type}>
                                {alert?.message}
                            </Alert>}
                            <Stack spacing={3} justify={'center'} alignItems={'center'}>
                                <Box>
                                    <img alt='logo' height={"200"} src={"/static/dc-batman-png.png"} />
                                </Box>
                                <Grid item xs={12}>
                                    <Typography m={2} variant="h6" >
                                        Hey there, click to continue
                                    </Typography>
                                </Grid>
                        
                        
                                <Grid item xs={12}>
                                    <form onSubmit={clickSubmit}>
                                    <LoadingButton
                                        type="submit"
                                        loading={loader}
                                        variant="contained"
                                        fullWidth
                                    >
                                        Click Here
                                    </LoadingButton>
                                    </form>
                                </Grid>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
            <TermAndCondition />
        </>
    )
}

export default Login