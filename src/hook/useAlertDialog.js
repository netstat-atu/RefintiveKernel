import React from 'react';
import { alertDialogContext } from '../Provider/AlertDialogProvider';
const useAlertDialog = () => React.useContext(alertDialogContext).alertDialog;
export default useAlertDialog;