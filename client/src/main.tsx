import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { AuthProvider } from "./context/AuthContext.js"; 
import "./index.css";
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <MantineProvider defaultColorScheme="auto" >
          <App />
        </MantineProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);