import React from 'react'
import Login from './login'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { pathNameBaseOnStage } from '../services/configHandle';
import jwt from "jsonwebtoken";

const Index = () => {

    const router = useRouter();
    const { token, role } = useSelector((state) => state.user);
    const isAuthenticated = token ? true : false
    const isAdmin = role == "admin" ? true : false

    const authorizer = () => {
        const decoded = jwt.decode(token, { complete: true });
        let isValidTokenAndNotExpired = false;

        if (!decoded) {
            isValidTokenAndNotExpired = false;
        } else {
            const { payload } = decoded;
            if (payload.exp) {
                const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
                if (currentTime <= payload.exp) {
                    //"JWT token is valid and not expired"
                    isValidTokenAndNotExpired = true;
                } else {
                    //"JWT token has expired"
                    isValidTokenAndNotExpired = false;
                }
            } else {
                //"JWT token does not have an expiration time"
                isValidTokenAndNotExpired = false;
            }
        }
        return isValidTokenAndNotExpired
    };

    useEffect(() => {
        const isAuth = authorizer()
        if (isAuthenticated && isAuth) {
            if (isAdmin) {
                router.push(pathNameBaseOnStage("/admin/dashboardAdmin"));
            } else {
                router.push(pathNameBaseOnStage("/user/dashboardUser"));
            }
        }
    }, [isAuthenticated, router]);

    return <Login />
}

export default Index;