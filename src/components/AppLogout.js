
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Router from "next/router";
import { setIsSignIn, setReduxReset } from '../redux/slice/userSlice';
import { theodore_api } from '../services/configHandle';

const AppLogout = ({ children }) => {
    
    const events = [
        "load",
        "mousemove",
        "mousedown",
        "click",
        "scroll",
        "keypress",
    ];
    const { token } = useSelector((state) => state.user);
    const dispatch = useDispatch()

    const removeSessionManage = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    };

    const logOut = async () => {
        if (token) {
            const headers = {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Authorization": `Bearer ${token}`
            }
            let requestOptions = {
                method: 'POST',
                headers: headers
            };
            await fetch(theodore_api + '/logout', requestOptions)
                .then(response => {

                    if (response.status == 200) {
                        dispatch(setReduxReset());
                        dispatch(setIsSignIn(false));
                        removeSessionManage()
                        Router.push("/")

                    } else {
                        dispatch(setReduxReset());
                        dispatch(setIsSignIn(false));
                        removeSessionManage()
                        Router.push("/")
                    }
                })
                .catch(error => {
                    dispatch(setReduxReset());
                    removeSessionManage()
                    dispatch(setIsSignIn(false));
                    Router.push("/")

                });
        } else {
            dispatch(setReduxReset());
            dispatch(setIsSignIn(false));
            removeSessionManage()

            Router.push("/")


        }
    }
    let timer;

    // this function sets the timer that logs out the user after 10 secs
    const handleLogoutTimer = () => {
        timer = setTimeout(() => {
            // clears any pending timer.
            resetTimer();
            // Listener clean up. Removes the existing event listener from the window
            Object.values(events).forEach((item) => {
                window.removeEventListener(item, resetTimer);
            });
            // logs out user
            logOut();
        }, 1000 * 60 * 15); // 10000ms = 10secs. You can change the time.
    };

    // this resets the timer if it exists.
    const resetTimer = () => {
        if (timer) clearTimeout(timer);
    };

    // when component mounts, it adds an event listeners to the window
    // each time any of the event is triggered, i.e on mouse move, click, scroll, keypress etc, the timer to logout user after 10 secs of inactivity resets.
    // However, if none of the event is triggered within 10 secs, that is app is inactive, the app automatically logs out.
    React.useEffect(() => {
        Object.values(events).forEach((item) => {
            window.addEventListener(item, () => {
                resetTimer();
                handleLogoutTimer();
            });
        });
    }, []);

    // logs out user by clearing out auth token in localStorage and redirecting url to /signin page.


    return children;
};

export default AppLogout;