import React from 'react';
import {
    Box, Button, Grid, Stack, TextField,
    Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import CustomModal from '../CustomModal';
import { useDispatch, useSelector } from 'react-redux';
import { useLoader } from '../../Provider/LoaderContext';
import { LoadingButton } from '@mui/lab';
import DividerHeading from '../DividerHeading';
import { openAlertSnack } from '../../redux/slice/alertSnackSlice';
import { convertToTitleCase } from '../../utils';
import useAlertDialog from '../../hook/useAlertDialog';
import { DatePicker } from '@mui/x-date-pickers';
import { checkUnderFifteenDay, formatDate } from '../../utils/dateFormat';
import { billVerificationAddComment } from '../../utils/bbps/billerServices';

const SingleUTREditModal = ({ data, open, onClose, clearState }) => {
    const { userId, orgId } = useSelector((state) => state.user);
    const { isLoading, showLoader, hideLoader } = useLoader();
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog();

    const openAlertHandle = (type = "success", message = "Message") => {
        dispatch(openAlertSnack({ type, message }));
    };

    const validationSchema = yup.object().shape({
        txnReferenceId: yup
            .string()
            .matches(/^[a-zA-Z0-9]+$/, 'txnReferenceId should contain only letters and numbers')
            .required('txnReferenceId is required'),
        adminPaidAmount: yup
            .string()
            .matches(/^[0-9]+$/, 'adminPaidAmount should contain only numbers')
            .required('adminPaidAmount is required'),
        TransactionDate: yup
            .string()
            .nullable()
            .required('TransactionDate is required'),
    });

    const initialValues = {
        txnReferenceId: data?.txnReferenceId || '',
        adminPaidAmount: Number(data?.adminPaidAmount) / 100 || '',
        TransactionDate: data?.TransactionDate || null,
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const changes = {};

            Object.entries(values).forEach(([key, value]) => {
                if (initialValues[key] !== value) {
                    changes[key] = value;
                }
            });

            if (Object.keys(changes).length === 0) {
                openAlertHandle("error", "No changes have been made to the UTR details.");
                return null;
            }

            if (userId != "854108bc-da0d-41b9-b9f2-917234597329") {
                if (changes?.TransactionDate) {
                    const resp = checkUnderFifteenDay(changes?.TransactionDate);
                    if (resp.statusCode !== 200) {
                        openAlertHandle("error", resp.message);
                        return null;
                    }
                }
            }

            const displayText = Object.entries(changes)
                .map(([key, value]) => `${convertToTitleCase(key)}: ${value}`)
                .join('\n');

            alertDialog({
                desc: "Are you sure you want to update the Payment details?",
                children: (
                    <Box sx={{ padding: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Bill Payment Information - Changes
                        </Typography>
                        <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                            {displayText}
                        </Typography>
                    </Box>
                ),
                rightButtonText: "Okay",
                rightButtonFunction: () => submitEdit(changes, data.ID),
            });
        }
    });

    const submitEdit = async (values, ID) => {
        showLoader();
        try {
            const body = {
                type: "UTR_UPDATE",
                ID: ID,
                data: values,
                orgId: orgId
            };
            // Uncomment the line below when the API is available
            const resp = await billVerificationAddComment(body);
            if (resp.statusCode === 200) {
                openAlertHandle("success", "Payment details have been successfully updated.");
            } else {
                openAlertHandle("error", JSON.stringify(resp));
            }
        } catch (error) {
            console.log('error', error);
            openAlertHandle("error", error.message || "An error occurred");
        }
        hideLoader();
        formik.resetForm()
        clearState();
    };

    const onChangeDate = (name, value) => formik.setFieldValue(name, formatDate(value));

    return (
        <CustomModal open={open} onClose={onClose}>
            <Box sx={{ bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px', minWidth: '600px' }}>
                <form onSubmit={formik.handleSubmit}>
                    <Stack spacing={3}>
                        <DividerHeading title="UTR Details" />
                        <Grid container mt={2} spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="txnRefeConsumerIdrenceId"
                                    label={convertToTitleCase("ConsumerId")}
                                    variant="outlined"
                                    value={data.ConsumerId}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="txnReferenceId"
                                    label={convertToTitleCase("txnReferenceId")}
                                    variant="outlined"
                                    value={formik.values.txnReferenceId}
                                    onChange={formik.handleChange}
                                    error={formik.touched.txnReferenceId && Boolean(formik.errors.txnReferenceId)}
                                    helperText={formik.touched.txnReferenceId && formik.errors.txnReferenceId}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="adminPaidAmount"
                                    label={convertToTitleCase("adminPaidAmount")}
                                    variant="outlined"
                                    value={formik.values.adminPaidAmount}
                                    onChange={formik.handleChange}
                                    error={formik.touched.adminPaidAmount && Boolean(formik.errors.adminPaidAmount)}
                                    helperText={formik.touched.adminPaidAmount && formik.errors.adminPaidAmount}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <DatePicker
                                    inputFormat="dd/MM/yyyy"
                                    size="small"
                                    fullWidth
                                    id="TransactionDate"
                                    name="TransactionDate"
                                    label={convertToTitleCase("TransactionDate")}
                                    value={formik.values.TransactionDate}
                                    onChange={(value) => onChangeDate("TransactionDate", value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            size="small"
                                            error={formik.touched.TransactionDate && Boolean(formik.errors.TransactionDate)}
                                            helperText={formik.touched.TransactionDate && formik.errors.TransactionDate}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Stack direction="row" spacing={3} justifyContent="space-between">
                            <Button color="inherit" variant="contained" onClick={onClose}>
                                Close
                            </Button>
                            <LoadingButton loading={isLoading} variant="contained" color="primary" type="submit">
                                Finish
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </form>
            </Box>
        </CustomModal>
    );
};

export default SingleUTREditModal;
