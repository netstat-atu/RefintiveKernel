import { Modal } from '@mui/material'
import React from 'react'

const CustomModal = ({ open, onClose, children }) => {
    return (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', justifyContent: 'center' }} >
            <div style={{
                position: 'relative',
                width: '90%',
                top: '10%',
                maxHeight: '80%',
                overflowY: 'auto',
            }}>
                {children}
            </div>
        </Modal>
    )
}

export default CustomModal