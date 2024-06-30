import { LoadingButton } from '@mui/lab'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import React from 'react'

const DynamicFieldDialog = ({ open, label, name, handleClose, inputType, value, onChange, onSubmit, loading }) => {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle> Please Enter {label}</DialogTitle>
            <DialogContent>
                <TextField
                    type={inputType}
                    autoFocus
                    margin="dense"
                    label={label}
                    value={value}
                    name={name}
                    onChange={onChange}
                    fullWidth
                    variant="outlined"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton loading={loading} onClick={onSubmit}>Submit</LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export default DynamicFieldDialog