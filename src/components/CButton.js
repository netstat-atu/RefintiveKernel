
import { Avatar, Button } from '@mui/material'
import React from 'react'

const CButton = ({ borderColor, icon, onClick, fullWidth = false, lightColor, title }) => {
    return (
        <Button
            onClick={onClick}
            fullWidth={fullWidth}
            sx={{
                m: 1,
                borderColor: borderColor ? borderColor : 'info.main',
                borderRadius: 40,
                color: borderColor ? borderColor : "info.main",
                backgroundColor: "background.default",
                borderWidth: 2,
                pr: icon ? 2 : 1,
                p: icon ? 0 : 1,
                justifyContent: 'flex-start',
                '&:hover': {
                    borderWidth: 2,
                    backgroundColor: "background.paper",
                    borderColor: borderColor ? borderColor : 'info.main'
                }
            }} variant='outlined'>

            {icon ? <Avatar sx={{ backgroundColor: lightColor ? lightColor : "#d3eafd", mr: 2, }}>
                {icon}
            </Avatar> : null}
            {title ? title : 'Bill Verification'}
        </Button>
    )
}

export default CButton;