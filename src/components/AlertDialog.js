import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React from 'react'

const AlertDialog = ({ isOpen, close, children, leftButtonFunction, rightButtonFunction, title = "Alert !", desc, leftButtonText = "Cancel", rightButtonText = "Ok" }) => {
    return (
        <Dialog  maxWidth={'xs'} open={isOpen} onClose={close}>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {desc ? <DialogContent>{desc}</DialogContent> : null}
            {children ? children : null}
            <DialogActions>
                {leftButtonText ? <Button variant="contained" color='inherit' onClick={() => {
                    close()
                    if (leftButtonFunction)
                        leftButtonFunction();
                }}>{leftButtonText}</Button> : null}

                {rightButtonText ? <Button variant="contained" onClick={() => {
                    close()
                    if (rightButtonFunction)
                        rightButtonFunction()
                }}>{rightButtonText}</Button> : null}
            </DialogActions>
        </Dialog>
    )
}

export default AlertDialog