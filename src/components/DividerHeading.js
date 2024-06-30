import { Divider, Typography } from '@mui/material'
import React from 'react'

const DividerHeading = ({ title, sx }) => {
    return (
        <React.Fragment>
            <Typography variant='h6'>
                {title}
            </Typography>
            <Divider sx={[{ mb: 3 }, sx]} />
        </React.Fragment>
    )
}

export default DividerHeading
