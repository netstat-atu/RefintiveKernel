// eslint-disable-next-line react/display-name 
import React from 'react';
import Head from 'next/head';

//** MUI */ 
import { CacheProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createEmotionCache } from '../utils/create-emotion-cache';
import { theme } from '../theme';

//** redux */
import { store, persistor } from "./../redux/store/index";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

//** component */
import AppLogout from '../components/AppLogout';
import AlertSnack from '../components/AlertSnack';
import DownloadManager from '../components/download-manager';

//** provider */
import AlertDialogProvider from '../Provider/AlertDialogProvider';
import { LoaderProvider } from '../Provider/LoaderContext';
import { DownloadMangerModalProvider } from '../Provider/DownloadMangerModalContext';
import '../theme/index.css'
const clientSideEmotionCache = createEmotionCache();

const App = (props) => {

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>Bill To Pay</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
          </Head>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider theme={theme}>
              <DownloadMangerModalProvider>
                <AlertDialogProvider>
                  <LoaderProvider>
                    <AppLogout>
                      <CssBaseline />
                      {getLayout(<Component {...pageProps} />)}
                      <AlertSnack />
                      <DownloadManager />
                    </AppLogout>
                  </LoaderProvider>
                </AlertDialogProvider>
              </DownloadMangerModalProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </CacheProvider>
      </PersistGate>
    </Provider >
  );
};

export default App;
