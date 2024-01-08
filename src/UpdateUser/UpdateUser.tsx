import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import ButtonAppBar from '../Nav/Nav';
import Box from '@mui/material/Box';

// currently not working need to fix in firestore
const customFontTheme = createTheme({
  typography: {
    fontFamily: 'cursive',
  },
});

const defaultTheme = createTheme({
  ...customFontTheme,
  palette: {
    primary: {
      main: '#48aab6',
    },
  },
});

interface User {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const UpdateInfo = () => {
  const [userInfo, setUserInfo] = React.useState<User>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Update the email using the updateEmail method
        await updateEmail(currentUser, userInfo.email);

        // Update the password using the updatePassword method
        await updatePassword(currentUser, userInfo.password);

        // Update other profile information if needed
        await updateProfile(currentUser, {
          displayName: `${userInfo.first_name} ${userInfo.last_name}`,
        });

        navigate('/');
      } else {
        // Handle the case when the user is not authenticated
        console.error('User not authenticated.');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  return (
    <>
      <ButtonAppBar />

      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box sx={{ textAlign: 'center' }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/4320/4320344.png"
              alt="drugs"
              style={{ width: '120px', height: '120px', marginBottom: '20px' }}
            />
          </Box>
          <Typography component="h1" variant="h5" style={{ fontFamily: 'cursive', textAlign: 'center' }}>
            Update Your Information
          </Typography>
          <form onSubmit={handleSubmit} noValidate style={{ marginTop: '20px' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="first_name"
              label="First Name"
              name="first_name"
              autoComplete="given-name"
              autoFocus
              value={userInfo.first_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="last_name"
              label="Last Name"
              name="last_name"
              autoComplete="family-name"
              value={userInfo.last_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={userInfo.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              autoComplete="new-password"
              type="password"
              value={userInfo.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Update Information
            </Button>
          </form>
        </Container>
      </ThemeProvider>
    </>
  );
};

export default UpdateInfo;
