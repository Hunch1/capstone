import ButtonAppBar from '../Nav/Nav';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import './Home.css';

const Home = () => {
  return (
    <>
      <ButtonAppBar />

      <div className="center-text">
        <div style={{ textAlign: 'center', color: 'black' }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/843/843169.png"
            alt="rx"
            style={{ width: '150px', height: '150px' }}
          />
          <h1 style={{ margin: '10px 0', fontSize: '36px', fontWeight: 'bold', textShadow: '2px 2px 4px white', fontFamily: 'cursive' }}>
            Welcome to the Rx Tracker
          </h1>
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px white',
              fontFamily: 'cursive',
            }}
            >
            Track your prescriptions effortlessly with Rx Tracker!
          </p>
        </div>

        <Link to="/RxSaver" style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            style={{
              color: 'black',
              backgroundColor: 'white',
              marginTop: '20px',
              fontFamily: 'cursive',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              background: 'linear-gradient(0deg, rgba(16,167,149,0.15449929971988796) 53%, rgba(0,212,255,0) 100%)',
            }}
          >
            Start Tracking Your Prescriptions
          </Button>
        </Link>
      </div>
    </>
  );
};

export default Home;
