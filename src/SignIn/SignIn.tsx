import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { Link, useNavigate } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import ButtonAppBar from '../Nav/Nav';

function Copyright(props: any) {
  return (
    <Typography variant="body2" text = 'Bold' color="text.secondary" align="center" {...props}>
      {'Copyright © '}
        Rx Tracker
    </Typography>
  );
}

const customFontTheme = createTheme({
  typography: {
    fontFamily: 'cursive',
  },
});

const defaultTheme = createTheme({
  ...customFontTheme,
    palette: {
      primary: {
        main: "#48aab6",
      },
    },
  });
  

const SignIn = () => {
    const [user, setUser] = useState({
      email: "",
      password: "",
    });
    const navigate = useNavigate()

  
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUser((prevUser) => ({
          ...prevUser,
          [name]: value,
        }));
      };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, user.email, user.password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      navigate('/')
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`${errorCode}: ${errorMessage}`);
    });
};
  return (
    <>
    <ButtonAppBar />

    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          
          <img src="https://cdn-icons-png.flaticon.com/512/4320/4320344.png" alt="drugs" style={{ width: '120px', height: '120px'}} />
          <Typography component="h1" variant="h5" style={{ fontFamily: 'cursive' }}>
            Login in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={user.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={user.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                {/* <Link href="#" variant="body2" underline="none">
                  Forgot password?
                </Link> */}
              </Grid>
              <Grid item>
                <Link to= "/signin" style={{ textDecoration: 'none', fontSize: '15px', color: 'black', fontFamily: 'cursive' }}>
                  {"Don't have an account?"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
    </>
  );
}

export default SignIn