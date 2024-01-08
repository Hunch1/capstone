import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link, useNavigate} from "react-router-dom"
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from "react";
import ButtonAppBar from '../Nav/Nav';

function Copyright(props: any) {
  return (
    
    <Typography variant="body2" color="text.secondary" align="center"  {...props}>
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
  

  interface User {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }

const SignUp = () => {
    const [user, setUser] = useState<User>({
      first_name: "",
      last_name: "",  
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
    createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        navigate('/signup');
        alert(`Sign-up successful!`);
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
    <ButtonAppBar/>

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
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="first_name"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={user.first_name}
                  onChange={handleChange}
                  sx={{ fontFamily: 'cursive' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="last_name"
                  autoComplete="family-name"
                  value={user.last_name}
                  onChange={handleChange}
                  sx={{ fontFamily: 'cursive' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                onChange={(event) => {
                  setUser({ ...user, email: event.target.value });
                }}/>
                
              </Grid>
              <Grid item xs={12}>
                <TextField
                required
                fullWidth
                id="password"
                label="Password"
                name="Password"
                autoComplete="password"
                onChange={(event) => {
                  setUser({ ...user, password: event.target.value });
                }}/>
              </Grid>
              <Grid item xs={12}>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to= '/signup' style={{ textDecoration: 'none', fontSize: '15px', color: 'black', fontFamily: 'cursive' }}>
                  Already have an account?
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
    </>
  );
}

export default SignUp