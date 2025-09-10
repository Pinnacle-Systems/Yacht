import React from 'react';
import ReactDOM from 'react-dom/client';
import Routing from './Route';
import "./index.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import store from './redux/store';
import { Provider } from 'react-redux';
import { Font } from '@react-pdf/renderer'
import { Toaster } from 'react-hot-toast';

Font.register({
  family: 'Segoe-UI',
  src: '/fonts/SegoeUI.ttf', // Regular
});

Font.register({
  family: 'Segoe-UI-Bold',
  src: '/fonts/SegoeUI-Bold.ttf', // Bold
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <Provider store={store}>
      <Routing />
    </Provider>

    <ToastContainer
      position="top-right"
      autoClose={100}
      hideProgressBar
      newestOnTop={false}
      closeOnClick={false}
    />
  </>
);
