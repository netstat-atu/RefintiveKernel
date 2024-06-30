import { Alert, Box, Button, Card, CardContent, Checkbox, Container, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, Link, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material'
import Head from 'next/head'
import React from 'react'
import { Visibility, ArrowBack, Refresh, VisibilityOff } from '@mui/icons-material';

import { pathNameBaseOnStage, theodore_api } from '../services/configHandle';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import Router from 'next/router';
import TermAndCondition from '../components/TermAndCondition';
import { useFormik } from 'formik';
import * as yup from 'yup';
import OTPComponent from '../components/OTPComponent';
const SignUp = () => {
    const validationSchema = yup.object({
        givenName: yup.string()
            .min(2, 'First Name should contain only characters. Max length- 50 characters')
            .max(50, 'First name must be at most 50 characters')
            .matches(/^[a-zA-Z\s]*$/, 'First name can only contain letters')
            .required('Required'),
        lastName: yup.string()
            .min(2, 'Last Name should contain only characters. Max length- 50 characters')
            .max(50, 'Last name must be at most 50 characters')
            .matches(/^[a-zA-Z\s]*$/, 'Last name can only contain letters')
            .required('Required'),
        email: yup
            .string('Enter your email')
            .email('Enter a valid email')
            .required('Email is required'),
        password: yup
            .string('Enter your password')
            .min(8, 'Password should be of minimum 8 characters length')
            .required('Password is required'),
        confirmPassword: yup.string()
            .oneOf([yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
        mobile: yup.string().matches(/^\d{10}$/, 'Invalid phone number').required('Phone number is required'),
    });

    const [isOTP, setIsOTP] = React.useState(false);
    const [loader, setLoader] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPass, setShowConfirmPass] = React.useState(false);
    const [alert, setAlert] = React.useState(null);
    const [errorMessageEmail, setErrorMessageEmail] = React.useState("");
    const [checked, setChecked] = React.useState(false);
    const [otpValue, setOTPValue] = React.useState("");
    const handleOTPValueChange = (e) => setOTPValue(e.target.value);

    const handleCheckBoxChange = (event) => {
        setChecked(event.target.checked);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };


    const handleClickShowConfirmPass = () => {
        setShowConfirmPass(!showConfirmPass);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const formik = useFormik({
        initialValues: {
            "email": "",
            "givenName": "",
            "lastName": "",
            "password": "",
            "confirmPassword": "",
            "mobile": "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            if (errorMessageEmail) {
                return setAlert({
                    type: "error",
                    message: "Email already exists"
                })
            }
            if (checked) {
                if (isOTP) {
                    verifyOtp()
                } else {
                    getOtp()
                }
            } else {
                setAlert({
                    type: "error",
                    message: "Please Checked the our Terms and conditions checked box"
                })
            }

        },
    });


    const getOtp = async () => {
        setLoader(true)
        const body = {
            "email": formik.values.email,
            "otpPurposeType": "SignupOTP"
        }
        await axios.post(theodore_api + '/users/email/otps', body)
            .then(response => {
                if (response.status == 200) {
                    setAlert({
                        type: "success",
                        message: "OTP Sent For SignUp"
                    });
                    setIsOTP(true)
                } else {
                    setAlert({
                        type: "error",
                        message: response?.data?.error?.message
                    });
                }
            })
            .catch(error => {
                console.log('There was an error while SignUp!', error.message);
                setAlert({
                    type: "error",
                    message: error?.response?.data?.error?.message
                });

            });
        setLoader(false)
    }

    const verifyOtp = async () => {
        setLoader(true)
        try {
            const body = {
                "email": formik.values.email,
                "givenName": formik.values.givenName,
                "mobile": "+91-" + formik.values.mobile,
                "lastName": formik.values.lastName,
                "password": formik.values.confirmPassword,
                "emailOtp": otpValue,
                "timezone": "Asia/Calcutta",
                "locale": "en-GB",
                "waoptin": false
            }
            const headers = {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            };
            const response = await fetch(theodore_api + '/users', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            const responseData = await response.json();

            if (response.status == 200) {
                setAlert({
                    type: "success",
                    message: responseData?.error?.message
                });
                Router.replace(pathNameBaseOnStage('/login'))
            } else {
                setAlert({
                    type: "error",
                    message: responseData?.error?.message
                });
            }
        } catch (err) {
            setAlert({
                type: "error",
                message: err?.response?.data?.error?.message
            });
            console.log(err);

        }
        setLoader(false)

    }

    const handleBlurEmail = e => {
        formik.handleBlur(e);
        checkEmail(e.target.value)
    };

    const checkEmail = async (email) => {
        if (email) {
            setLoader(true);
            try {
                const response = await fetch(theodore_api + `/userexistence/email/${email}`);
                const responseData = await response.json();
                if (responseData?.data?.userPresent === true) {
                    setErrorMessageEmail('Email already exists');
                } else {
                    setErrorMessageEmail("")
                }
            } catch (error) {
                console.log("🚀 ~ file: signup.js:193 ~ checkEmail ~ error:", error);
                setErrorMessageEmail("")
            }
            setLoader(false)
        }
    }

    const handleBackBtn = () => {
        if (isOTP) {
            setIsOTP(false);
            setOTPValue("")
        } else {
            setOTPValue("")
            Router.replace(pathNameBaseOnStage('/login'))
        }

    }
    const handleSuccess = () => alert('Captcha matched!');
    const handleFailure = () => alert('Captcha does not match');
    return (
        <>
            <Head>
                <title>
                    Sign Up
                </title>
            </Head>
            <Box style={{ height: '100vh', padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card component={"form"} onSubmit={formik.handleSubmit}  >
                    <CardContent>
                        <IconButton onClick={handleBackBtn}>
                            <ArrowBack />
                        </IconButton>
                        <Stack spacing={3}>
                            <Box>
                                <img alt='logo' height={"100"} src={"/static/B2P Logo-Final.png"} />
                            </Box>
                            {isOTP ? <OTPComponent getOtp={getOtp} handleOTPValueChange={handleOTPValueChange} otpValue={otpValue} /> :
                                <Stack spacing={3}>
                                    <Typography m={2} variant="h5" >
                                        Welcome, Sign up here
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            id="givenName"
                                            name="givenName"
                                            label="First Name"
                                            value={formik.values.givenName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.givenName && Boolean(formik.errors.givenName)}
                                            helperText={formik.touched.givenName && formik.errors.givenName}
                                        />
                                        <TextField
                                            size="small"
                                            fullWidth
                                            id="lastName"
                                            name="lastName"
                                            label="Last Name"
                                            value={formik.values.lastName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                            helperText={formik.touched.lastName && formik.errors.lastName}
                                        />
                                    </Stack>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={handleBlurEmail}
                                        error={!!errorMessageEmail || formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={errorMessageEmail || formik.touched.email && formik.errors.email}
                                    />
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <TextField
                                            error={formik.touched.password && formik.errors.password}
                                            required
                                            fullWidth
                                            autoComplete='of'
                                            size="small"
                                            id='password'
                                            name='password'
                                            type={showPassword ? 'text' : 'password'}
                                            label="Password"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>,
                                            }}
                                            helperText={formik.touched.password && formik.errors.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password}
                                        />
                                        <TextField
                                            error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                            required
                                            fullWidth
                                            autoComplete='of'
                                            size="small"
                                            id='confirm-password'
                                            name='confirmPassword'
                                            type={showConfirmPass ? 'text' : 'password'}
                                            label="Confirm Password"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowConfirmPass}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                    >
                                                        {showConfirmPass ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>,
                                            }}
                                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.confirmPassword}
                                        />
                                    </Stack>
                                    <TextField
                                        required
                                        size="small"
                                        fullWidth
                                        id="mobile"
                                        name="mobile"
                                        label="Mobile"
                                        type='tel'
                                        value={formik.values.mobile}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        inputProps={{ maxLength: 10 }}
                                        error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                                        helperText={formik.touched.mobile && formik.errors.mobile}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={checked}
                                                onChange={handleCheckBoxChange}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                            />
                                        }

                                        label={
                                            <Typography variant="body2">
                                                I Agree to the{' '}
                                                <Link href={"https://www.vendortopay.com/Home/terms-and-conditions.html"}>Terms and Conditions</Link>
                                            </Typography>
                                        }
                                    />
                                </Stack>
                            }
                            <Grid item xs={12}>
                                <LoadingButton loading={loader} variant="contained" type='submit' >{isOTP ? "Submit" : "Next"}</LoadingButton>
                            </Grid>
                            <Typography variant="body2" gutterBottom> Already have and account?, Login <Link href={pathNameBaseOnStage("/login")}>here.</Link></Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Box >
            <Snackbar autoHideDuration={15000} open={alert} onClose={() => setAlert(null)} >
                {alert &&
                    <Alert onClose={() => setAlert(null)} severity={alert?.type}>
                        <Typography>{alert?.message}</Typography>
                    </Alert>}
            </Snackbar>
            <TermAndCondition />
        </>
    )
}

export default SignUp