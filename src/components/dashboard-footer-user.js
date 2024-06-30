import PropTypes from 'prop-types';
import { Card, Stack, Typography } from '@mui/material';
import React from 'react';
import NextLink from 'next/link';
import TermAndCondition from './TermAndCondition';


export const DashboardFooterUser = (props) => {
    const { onSidebarOpen, ...other } = props;
    return (
        <>
            <Card
                sx={{
                    mt: 1,
                    bottom: {
                        lg: 0
                    },
                    position: 'relative',
                    left: {
                        lg: 280,
                    },
                    width: {
                        lg: 'calc(100% - 280px)'
                    }

                }}
                {...other}>
                <TermAndCondition />
            </Card>
        </>
    );
};

DashboardFooterUser.propTypes = {
    onSidebarOpen: PropTypes.func
};
