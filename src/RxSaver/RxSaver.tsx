import { ChangeEvent, useState, useEffect } from 'react';
import ButtonAppBar from '../Nav/Nav';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { doc, deleteDoc, addDoc, collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


interface FormData {
  drugName: string;
  amount: string;
  frequency: string;
  strength: string;
  lastTaken?: number;
  nextDose?: Timestamp;
}

const RxSaver = () => {
  const initialFormData: FormData = {
    drugName: '',
    amount: '',
    frequency: '',
    strength: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [medicationsFromDb, setMedicationsFromDb] = useState<FormData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [nextDose, setNextDose] = useState<string>('');
  const [medicationUpdateTrigger, setMedicationUpdateTrigger] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, [])

  const checkAuthentication = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not authenticated, redirect to the login page
        navigate('/signup');
      }
    });
  };



  useEffect(() => {
    // Fetch medications from Firestore for the current user
    const fetchMedications = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const medicationsSnapshot = await getDocs(query(collection(db, 'drugs'), where('userId', '==', user.uid)));
          const medicationsData = medicationsSnapshot.docs.map((doc) => doc.data() as FormData);
          
          setMedicationsFromDb(medicationsData);
        } else {
          console.error('User not authenticated.');
          setErrorMessage('Please log in.');
        }
      } catch (error) {
        console.error('Error fetching medications: ', error);
        setErrorMessage('Error fetching medications. Please try again.');
      }
    };

    fetchMedications();
  }, [medicationUpdateTrigger]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };
  const calculateFrequencyInMinutes = (frequency: string): number => {
    const frequencyPatterns: Record<string, number> = {
      'once a day': 24 * 60, // Once a day
      'twice a day': 12 * 60, // Twice a day
      'three times a day': 8 * 60, // Three times a day
    };

    // Convert frequency string to lowercase 
    const lowercaseFrequency = frequency.toLowerCase();

    // Check if the provided frequency is in the mapping, else return a default value
    return frequencyPatterns[lowercaseFrequency] || 24 * 60; // Default to once a day
  };


  const handleSubmit = async () => {
    if (formData.drugName && formData.amount && formData.frequency && formData.strength) {
      try {
        const user = auth.currentUser;
        if (user) {
          const medicationDataWithUser = { ...formData, userId: user.uid };
          await addDoc(collection(db, 'drugs'), medicationDataWithUser);

          setFormData(initialFormData);
          setErrorMessage('');

          // Trigger medication update by changing the state
          setMedicationUpdateTrigger(prevState => !prevState);
        } else {
          console.error('User not authenticated.');
          setErrorMessage('User not authenticated. Please log in.');
        }
      } catch (error) {
        console.error('Error writing document: ', error);
        setErrorMessage('Error writing document. Please try again.');
      }
    } else {
      setErrorMessage('Please fully fill out the form.');
    }
  };


  const handleRemove = async (index: number) => {
    // Get the current authenticated user
    const user = auth.currentUser;
  
    if (user) {
      try {
        // Fetch medications data for the user
        const medicationsSnapshot = await getDocs(query(collection(db, 'drugs'), where('userId', '==', user.uid)));
        const medicationsData = medicationsSnapshot.docs.map((doc) => doc.data() as FormData);
        // Identify the medication to remove based on the provided index
        const medicationToRemove = medicationsData[index];
        // Find the document ID of the medication to remove
        const medicationDocId = medicationsSnapshot.docs.find(doc => doc.data().drugName === medicationToRemove.drugName)?.id;
  
        if (medicationDocId) {
          // Delete the medication document from the database
          await deleteDoc(doc(db, 'drugs', medicationDocId));
          console.log('Medication successfully removed!');
          // Update state to remove the medication locally
          setMedicationsFromDb((prevMedications) => prevMedications.filter((med) => med.drugName !== medicationToRemove.drugName));
          // Trigger medication update by changing the state
          setMedicationUpdateTrigger(prevState => !prevState);
        } else {
          // Medication document not found
          logErrorAndSetMessage('Medication not found. Please try again.');
        }
      } catch (error:any) {
        // Handle errors during the removal process
        logErrorAndSetMessage(`Error deleting medication: ${error.message}`);
      }
    } else {
      // User not authenticated
      logErrorAndSetMessage('User not authenticated. Please log in.');
    }
  };
  
  // Helper function for logging errors and setting error messages
  const logErrorAndSetMessage = (errorMessage: string) => {
    console.error(errorMessage);
    setErrorMessage(errorMessage);
  };
  

  const handleTakeDose = async (index: number) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const medicationsSnapshot = await getDocs(query(collection(db, 'drugs'), where('userId', '==', user.uid)));
        const medicationsData = medicationsSnapshot.docs.map((doc) => doc.data() as FormData);
        const medicationToTake = medicationsData[index];
        const medicationDocSnapshot = await getDocs(query(collection(db, 'drugs'), where('userId', '==', user.uid)));
        const medicationDocId = medicationDocSnapshot.docs.find((doc) => doc.data().drugName === medicationToTake.drugName)?.id;

        if (medicationDocId) {
          const frequencyInMinutes = calculateFrequencyInMinutes(medicationToTake.frequency);

          // Calculate the next dose time
          const nextDoseTime = new Date(Timestamp.now().toMillis() + frequencyInMinutes * 60 * 1000);

          // Update the medication document in the database
          await updateDoc(doc(db, 'drugs', medicationDocId), {
            amount: (parseInt(medicationToTake.amount) - 1).toString(),
            lastTaken: Timestamp.now().toMillis(),
            nextDose: Timestamp.fromMillis(nextDoseTime.getTime()), // Store next dose time in the 'nextDose' field
          });

          console.log('Dose taken successfully!');

          // Update the next dose information in the state
          setNextDose(`Next dose due at: ${nextDoseTime.toLocaleString()}`);

          // Force a re-render after the state update
          setMedicationsFromDb((prevMedications) => {
            const updatedMedications = [...prevMedications];
            updatedMedications[index].amount = (parseInt(medicationToTake.amount) - 1).toString();
            updatedMedications[index].lastTaken = Timestamp.now().toMillis();
            updatedMedications[index].nextDose = Timestamp.fromMillis(nextDoseTime.getTime()); // Update nextDose in state
            return updatedMedications;
          });
        } else {
          console.error('Medication document not found.');
          setErrorMessage('Medication document not found. Please try again.');
        }
      } catch (error) {
        console.error('Error updating document: ', error);
        setErrorMessage('Error updating document. Please try again.');
      }
    } else {
      console.error('User not authenticated.');
      setErrorMessage('User not authenticated. Please log in.');
    }
  };


  return (
    <>
      <ButtonAppBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
        }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4320/4320365.png"
          alt="more_drug"
          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 2,
            textAlign: 'center',
            width: '260px',
            display: 'inline-block',
            background: 'linear-gradient(0deg, rgba(16,167,149,0.15449929971988796) 53%, rgba(0,212,255,0) 100%)',
          }}
        >
          <TextField
            id="drugName"
            label="Drug name"
            variant="outlined"
            sx={{ mb: 2, width: '100%', display: 'block' }}
            InputLabelProps={{
              shrink: false,
              style: { position: 'relative', top: '-13px', fontWeight: 'bold', fontFamily: 'cursive' }, 
            }}
            onChange={handleInputChange}
            value={formData.drugName}
            inputProps={{ style: { padding: '12px', fontWeight: 'bold', fontFamily: 'cursive' } }} 
          />

          <TextField
            id="strength"
            label="Strength( mg, mls, etc)"
            variant="outlined"
            sx={{ mb: 2, width: '100%', display: 'block' }}
            InputLabelProps={{
              shrink: false,
              style: { position: 'relative', top: '-13px', fontWeight: 'bold', fontFamily: 'cursive' },
            }}
            onChange={handleInputChange}
            value={formData.strength}
            inputProps={{ style: { padding: '12px', fontWeight: 'bold', fontFamily: 'cursive' } }}
          />

          <TextField
            id="amount"
            label="Amount? (tablets, liquid, etc)"
            variant="outlined"
            sx={{ mb: 2, width: '100%', display: 'block' }}
            InputLabelProps={{
              shrink: false,
              style: { position: 'relative', top: '-13px', fontWeight: 'bold', fontFamily: 'cursive' },
            }}
            onChange={handleInputChange}
            value={formData.amount}
            inputProps={{ style: { padding: '12px', fontWeight: 'bold', fontFamily: 'cursive' } }}
          />

          <TextField
            id="frequency"
            label="Frequency: once a day, etc"
            variant="outlined"
            sx={{ mb: 2, width: '100%', display: 'block' }}
            InputLabelProps={{
              shrink: false,
              style: { position: 'relative', top: '-13px', fontWeight: 'bold', fontFamily: 'cursive' },
            }}
            onChange={handleInputChange}
            value={formData.frequency}
            inputProps={{ style: { padding: '12px', fontWeight: 'bold', fontFamily: 'cursive' } }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2, width: '70%', height: '40px' }}
            className="custom-font"
          >
            Add Medication
          </Button>
          {errorMessage && <p style={{ color: 'red', marginTop: '8px' }}>{errorMessage}</p>}
        </Paper>

        {medicationsFromDb.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ marginBottom: '10px', fontFamily: 'cursive' }}>
              Medication List
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center' }}>

              {medicationsFromDb.map((medication, index) => (
                <div key={index} style={{ margin: '8px', width: '260px' }}>
                  <Card elevation={3} sx={{
                    p: 3, textAlign: 'center', background: 'linear-gradient(0deg, rgba(16,167,149,0.15449929971988796) 53%, rgba(0,212,255,0) 100%) '
                    , fontFamily: 'cursive', textTransform: 'uppercase'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/13179/13179163.png"
                        alt="Drug Image"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    </div>
                    <p>
                      {/*  ugly bold lettering gone */}
                      <strong></strong> {medication.drugName} <br />
                      <strong></strong> {medication.strength} <br />
                      <strong></strong> {medication.amount} <br />
                      <strong></strong> {medication.frequency} <br />
                      {medication.lastTaken && (
                        <>
                          <strong>Last Taken:</strong> {new Date(medication.lastTaken).toLocaleString()} <br />
                        </>
                      )}
                    </p>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => handleRemove(index)}
                      >
                        Remove
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleTakeDose(index)}
                        sx={{ marginLeft: 1 }}
                      >
                        Take Dose
                      </Button>
                    </Box>
                  </Card>
                  {medication.nextDose && (
                    <Typography variant="body2" sx={{ marginTop: '10px', fontFamily: 'cursive' }}>
                      <strong>Next Dose:</strong> {new Date(medication.nextDose.toMillis()).toLocaleString()} <br />
                    </Typography>
                  )}
                </div>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default RxSaver;
