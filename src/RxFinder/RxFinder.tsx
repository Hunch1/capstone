import { useState, useEffect } from 'react';
import ButtonAppBar from "../Nav/Nav";
import './RxFinder.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';




interface DrugInfo {
  results: {
    indications_and_usage: string[];
    spl_medguide: { spl_medguide: string }[];
  }[];
}

const RxFinder = () => {
  const [drugName, setDrugName] = useState<string>('');
  const [indicationsAndUsage, setIndicationsAndUsage] = useState<string[]>([]);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, [])

  const checkAuthentication = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not authenticated, redirect to the login page or show a login prompt
        navigate('/signup');
      }
    });
  };

  // Custom function to limit words
  const limitWords = (text: string, limit: number): string => {
    const words = text.split(/\s+/);
    return words.slice(0, limit).join(' ');
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://api.fda.gov/drug/label.json?search=instructions_for_use:${drugName}&limit=5`);
      const data: DrugInfo = await response.json();

      if (data.results && data.results.length > 0) {
        const indicationsAndUsageData = data.results[0].indications_and_usage;
        const splMedguideData = data.results.map(result => result.spl_medguide).flat();

        if (indicationsAndUsageData && indicationsAndUsageData.length > 0) {
          setIndicationsAndUsage(indicationsAndUsageData);
        } else {
          setIndicationsAndUsage(['No information found!']);
        }

        if (splMedguideData && splMedguideData.length > 0) {
          const sideEffectsData = splMedguideData
            .join('\n')
            .split('\n')
            .filter(effect => effect.trim() !== '');

          // Limiting side effects to a maximum of 200 words
          const limitedSideEffectsData = limitWords(sideEffectsData.join(' '), 200).split('\n');

          setSideEffects(limitedSideEffectsData.length > 0 ? limitedSideEffectsData : ['No side effects information found!!']);
        } else {
          setSideEffects(['No side effects information!!']);
        }

        setHasSearched(true);
      } else {
        setIndicationsAndUsage(['No information found for the specified drug.']);
        setSideEffects(['No information found for the specified drug.']);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Error fetching drug info', error);
    }
  };



  return (
    <div>
      <ButtonAppBar />
      <div className="rxFinderContainer">
        <div className="searchContainer">
          <label htmlFor="drugName" style={{ fontFamily: 'cursive' }}>
            Enter Drug Please!
          </label>
          <input
            type="text"
            id="drugName"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
          />
          <button onClick={handleSearch} style={{ fontFamily: 'cursive' }}>
            Search
          </button>
        </div>
        {hasSearched && (
          <div className="contentContainer">
            <div className="infoContainer">
              <div className="infoBox">
                <h2 style={{ fontFamily: 'cursive' }}>Indications and Usage</h2>
                {indicationsAndUsage.map((paragraph, index) => (
                  <p key={index} style={{ fontFamily: 'cursive' }}>{paragraph}</p>
                ))}
              </div>
              <div className="infoBox">
                <h2 style={{ fontFamily: 'cursive' }}>Side Effects</h2>
                {sideEffects.map((effect, index) => (
                  <p key={index} style={{ fontFamily: 'cursive' }}>{effect}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RxFinder;
