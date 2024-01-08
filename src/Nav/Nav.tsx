import { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

interface IUser {
  uid: string;
  email: string;
}

export default function ButtonAppBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser>({
    uid: '',
    email: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid,
          email: authUser.email || '',
        });
      } else {
        setUser({
          uid: '',
          email: '',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginClick = () => {
    navigate('/signup');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLogoutClick = async () => {
    try {
      await signOut(auth);
      setUser({
        uid: '',
        email: '',
      });
      navigate('/signup');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const handleUpdateInfoClick = () => {
    navigate('/updateinfo');
  };


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#48aab6' }}>
        <Toolbar>
          <Tooltip title="Home" arrow>
            <div>
              <Link to="/" onClick={handleHomeClick}>
                <img
                  src={'https://cdn-icons-png.flaticon.com/512/4320/4320344.png'}
                  alt="Home"
                  style={{ height: '50px', cursor: 'pointer', marginRight: '20px' }}
                />
              </Link>
            </div>
          </Tooltip>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontFamily: 'cursive' }}>
            <Link to="/rxsaver" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
              Rx Tracker
            </Link>
            <Link to="/rxfinder" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
              Drug Information
            </Link>
          </Typography>
          {user.uid ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
               <Typography
                variant="body1"
                sx={{ marginRight: '20px', fontFamily: 'cursive', cursor: 'pointer' }}
                onClick={handleUpdateInfoClick}
              >
                {user.email}
              </Typography>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <IconButton color="inherit" onClick={handleLogoutClick}>
                  <ExitToAppIcon />
                </IconButton>
                <Button color="inherit" onClick={handleLogoutClick}>
                  <Typography fontFamily="cursive">Logout</Typography>
                </Button>
              </div>
            </div>
          ) : (
            <Button color="inherit" onClick={handleLoginClick}>
              <Typography variant="body1" fontFamily="cursive">
                Login
              </Typography>
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
