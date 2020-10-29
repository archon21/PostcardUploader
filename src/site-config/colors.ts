import theme from 'styled-theming';


const colors = {
  primary: theme('mode', {
    light: 'red',
    dark: '#000',
  }),
  secondary: theme('mode', {
    light: 'black',
    dark: '#000',
  }),
  tertiary: theme('mode', {
    light: 'gray',
    dark: '#000',
  }),
  quaternary: theme('mode', {
    light: 'yellow',
    dark: '#000',
  }),
  danger: theme('mode', {
    light: 'red',
    dark: '#000',
  }),
  safe: theme('mode', {
    light: 'forestgreen',
    dark: '#000',
  }),
  background: theme('mode', {
    light: '#fff',
    dark: '#000',
  }),
  
};

export default colors;
