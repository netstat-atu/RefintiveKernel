import { Link, Stack, Typography } from '@mui/material'
import React from 'react'
import NextLink from 'next/link';

const TermAndCondition = () => {
    return (
        <Stack p={2} direction={{ xs: 'row', sm: 'row' }} color="GrayText" alignItems={'center'} justifyContent={'center'}  >
            Copyright {new Date().getFullYear()}  All Rights Reserved.
        </Stack>
    )
}

export default TermAndCondition