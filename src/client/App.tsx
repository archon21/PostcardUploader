import React from 'react';
import { Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Nav, Footer } from './components';
import history from './history';
import { WindoW } from './layout-components';
import Routes from './Routes';

function App() {
  return (
    <ThemeProvider theme={{ mode: 'light' }}>
      <WindoW init column>
        <Nav></Nav>
        <Routes></Routes>
        <Footer></Footer>
      </WindoW>
    </ThemeProvider>
  );
}

export default App;
