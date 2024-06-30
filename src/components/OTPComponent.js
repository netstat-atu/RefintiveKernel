import { Button, TextField, Typography } from "@mui/material";
import React from 'react'

const OTPComponent = ({ getOtp, handleOTPValueChange, otpValue }) => {
    const [minutes, setMinutes] = React.useState(1);
    const [timerValue, setTimerValue] = React.useState(30);
    const [resend, setResend] = React.useState(false);
    //useRef
    const timerRef = React.useRef();

    //Functions
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimerValue((prevTimerValue) => prevTimerValue - 1);
        }, 1000);
    };

    const resendOtp = () => {
        getOtp();
        setMinutes(1);
        setTimerValue(30);
        startTimer();
        setResend(false);
        return () => {
            clearInterval(timerRef.current);
        };
    };
    //UseEffect
    React.useEffect(() => {
        startTimer()
        return () => {
            clearInterval(timerRef.current);
        };
    }, []);

    React.useEffect(() => {

        if (timerValue === 0) {
            if (minutes > 0) {
                setTimerValue(59);
                setMinutes(0);
            } else {
                setResend(true);
                clearInterval(timerRef.current);
            }
        }
    }, [timerValue, resend, minutes]);
    return <>
        <Typography m={2} variant="h5" >Verify OTP</Typography>
        <TextField onChange={handleOTPValueChange} value={otpValue} size="small" inputProps={{ maxLength: 6 }} id='otp' name='otp' label="OTP" required />
        {resend ? (<Button size='small' variant="text" onClick={resendOtp}>Resend code</Button>) : (<Typography variant="body">  {minutes}:{timerValue} min left  </Typography>)}
    </>

}

export default OTPComponent