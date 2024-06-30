import React, { useState } from 'react';
import AlertDialog from '../components/AlertDialog';

export const alertDialogContext = React.createContext({
    alertDialog: () => { }
});

const { Provider } = alertDialogContext;

const AlertDialogProvider = props => {

    const initialState = {
        isOpen: false,
        leftButtonFunction: undefined,
        rightButtonFunction: undefined,
        title: '',
        desc: '',
        leftButtonText: '',
        rightButtonText: '',
        children: undefined
    };

    const [alertState, setAlertState] = useState(initialState);

    const alertDialog = ({ title, desc, leftButtonFunction, rightButtonFunction, leftButtonText, rightButtonText, children }) => {
        setAlertState({
            isOpen: true,
            leftButtonFunction,
            rightButtonFunction,
            title,
            desc,
            leftButtonText,
            rightButtonText,
            children
        });
    };

    const close = () => {
        setAlertState(initialState);
    };

    return (
        <Provider value={{ alertDialog }}>
            {props?.children}
            <AlertDialog {...alertState} close={close} />
        </Provider>
    );
};

export default AlertDialogProvider;
