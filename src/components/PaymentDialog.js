import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import React from 'react'
import { amountFormat } from '../utils'

const PaymentDialog = ({ isModal, handlePay, handlePayClose, desc, }) => {
    return (
        <Dialog open={isModal}>
            <DialogTitle>Payment</DialogTitle>
            <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        {desc}
                    </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color='inherit' onClick={handlePayClose}>
                    Close
                </Button>
                <Button variant='contained' onClick={() => {
                    handlePay()
                    handlePayClose()
                }}>
                    Pay
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default PaymentDialog
