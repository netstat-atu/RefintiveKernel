import React, { useEffect, useState } from 'react';
import {
    Box, Button, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, TextField,
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
import { BILLER_CATEGORY, convertToTitleCase } from '../../utils';
import { billerNameRequest, billerNameStates, consumerUpdate } from '../../utils/bbps/billerServices';
import useAlertDialog from '../../hook/useAlertDialog';

const SingleConsumerEditModal = ({ data, open, onClose, clearState }) => {
    const { userId, orgId } = useSelector((state) => state.user);
    const { orgField, payTypeList } = useSelector((state) => state.extra);
    const { isLoading, showLoader, hideLoader } = useLoader();
    const dispatch = useDispatch();
    const alertDialog = useAlertDialog()

    const openAlertHandle = (type = "success", message = "Message") => {
        dispatch(openAlertSnack({ type, message }));
    };
    const validationSchema = yup.object().shape({
        ConsumerId: yup.string().required('Consumer Number is required'),
        ConsumerName: yup.string().required('Consumer Name is required'),
        payType: yup.string().required('PayType is required'),
        Value1: yup.string().required('Value1 is required'),
        Value2: yup.string().nullable().optional(),
        ConsumerType: yup.string().required('Consumer Type is required'),
        ...orgField.reduce((schema, field) => {
            if (field?.filterFlag === 1 && field?.fieldType === "char" && field.typeTable === "Consumer") {
                schema[field.fieldName] = yup.string().required(`${convertToTitleCase(field.fieldName)} is required`);
            }
            return schema;
        }, {})
    });

    const initialValues = {
        ConsumerId: data?.ConsumerId || '',
        ConsumerName: data?.ConsumerName || '',
        ConsumerType: data?.ConsumerType || '',
        payType: data?.payType || '',
        Value1: data?.Value1 || '',
        Value2: data?.Value2 || '',
        ...orgField.reduce((initialValues, field) => {
            if (field?.filterFlag === 1 && field?.fieldType === "char" && field.typeTable === "Consumer") {
                initialValues[field.fieldName] = data[field.fieldName] || '';
            }
            return initialValues;
        }, {})
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const changes = {};

            // Check for changes and populate the changes object
            Object.entries(values).forEach(([key, value]) => {
                if (initialValues[key] !== value) {
                    changes[key] = value;
                }
            });

            // If no changes, show alert and return
            if (Object.keys(changes).length === 0) {
                openAlertHandle("error", "No changes have been made to the consumer details.");
                return null;
            }

            // Generate the display string for changes
            const displayText = Object.entries(changes).map(([key, value]) => `${key}: ${value}`).join('\n');

            alertDialog({
                desc: "Are you sure you want to update the consumer?",
                children: <Box sx={{ padding: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Consumer Information - Changes
                    </Typography>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {displayText}
                    </Typography>
                </Box>,
                rightButtonText: "Okay",
                rightButtonFunction: () => submitEdit(changes, data.ID,),
            })
        }
    });


    const submitEdit = async (values, ID) => {
        showLoader()
        try {
            const body = {
                "type": "CONSUMER_UPDATE",
                "ID": ID,
                "data": values,
                "orgId": orgId
            };
            const resp = await consumerUpdate(body)
            if (resp?.statusCode === 200) {
                openAlertHandle("success", "Consumer details have been successfully updated.");
            } else {
                openAlertHandle("error", JSON.stringify(resp));
            }
        } catch (error) {
            console.log('error', error)
            openAlertHandle("error", JSON.stringify(error?.stack || error));
        }
        hideLoader()
        clearState()
    }



    return (
        <CustomModal open={open}>
            <Box sx={{ bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: '8px', minWidth: '600px' }}>
                <form onSubmit={formik.handleSubmit}>
                    <Stack spacing={3}>
                        <DividerHeading title="Consumer Details" />
                        <Grid container mt={2} columns={{ xs: 2, sm: 8, md: 16 }}>
                            <Grid item xs={2} sm={4} md={4} p={1}>
                                <FormControl>
                                    <RadioGroup
                                        sx={{ flexDirection: "row", mb: 2 }}
                                        defaultValue="LT"
                                        name="ConsumerType"
                                        value={formik.values.ConsumerType}
                                        onChange={formik.handleChange}
                                        error={formik.touched.ConsumerType && Boolean(formik.errors.ConsumerType)}
                                        helperText={formik.touched.ConsumerType && formik.errors.ConsumerType}
                                    >
                                        <FormControlLabel value="LT" control={<Radio />} label="Low Tension" />
                                        <FormControlLabel value="HT" control={<Radio />} label="High Tension" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="ConsumerId"
                                    label={convertToTitleCase("ConsumerId")}
                                    variant="outlined"
                                    disabled
                                    value={formik.values.ConsumerId}
                                    onChange={formik.handleChange}
                                    error={formik.touched.ConsumerId && Boolean(formik.errors.ConsumerId)}
                                    helperText={formik.touched.ConsumerId && formik.errors.ConsumerId}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="ConsumerName"
                                    label={convertToTitleCase("ConsumerName")}
                                    variant="outlined"
                                    value={formik.values.ConsumerName}
                                    onChange={formik.handleChange}
                                    error={formik.touched.ConsumerName && Boolean(formik.errors.ConsumerName)}
                                    helperText={formik.touched.ConsumerName && formik.errors.ConsumerName}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="Value1"
                                    label={convertToTitleCase("Value1")}
                                    variant="outlined"
                                    value={formik.values.Value1}
                                    onChange={formik.handleChange}
                                    error={formik.touched.Value1 && Boolean(formik.errors.Value1)}
                                    helperText={formik.touched.Value1 && formik.errors.Value1}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="Value2"
                                    label={convertToTitleCase("Value2")}
                                    variant="outlined"
                                    value={formik.values.Value2}
                                    onChange={formik.handleChange}
                                    error={formik.touched.Value2 && Boolean(formik.errors.Value2)}
                                    helperText={formik.touched.Value2 && formik.errors.Value2}
                                />
                            </Grid>
                            <Grid item xs={2} sm={4} md={4} p={1}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="payTypeLabel">Choose PayType</InputLabel>
                                    <Select
                                        labelId="payTypeLabel"
                                        id="payType"
                                        name="payType"
                                        label={"Choose PayType"}
                                        value={formik.values.payType}
                                        onChange={formik.handleChange}
                                        error={formik.touched.payType && Boolean(formik.errors.payType)}
                                    >
                                        {payTypeList?.length > 0 && payTypeList.map((e, i) => (
                                            <MenuItem key={i + e?.payType} value={e?.payType}>{e?.payType}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {orgField?.length > 0 && orgField.map((field, index) => (
                                field?.filterFlag === 1 && field?.fieldType === "char" && field.typeTable === "Consumer" && (
                                    <Grid key={index} item xs={2} sm={4} md={4} p={1}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={convertToTitleCase(field?.fieldName)}
                                            name={field.fieldName}
                                            variant="outlined"
                                            value={formik.values[field.fieldName]}
                                            onChange={formik.handleChange}
                                            error={formik.touched[field.fieldName] && Boolean(formik.errors[field.fieldName])}
                                            helperText={formik.touched[field.fieldName] && formik.errors[field.fieldName]}
                                        />
                                    </Grid>
                                )
                            ))}
                        </Grid>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent={'space-between'}>
                            <Button color='inherit' variant="contained" type='reset' onClick={onClose}>
                                Close
                            </Button>
                            <LoadingButton loading={isLoading} variant="contained" color="primary" type='submit'>
                                Finish
                            </LoadingButton>
                        </Stack>
                    </Stack>
                </form>
            </Box>
        </CustomModal>
    );
}

export default SingleConsumerEditModal;
