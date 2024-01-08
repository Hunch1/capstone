import ReactDOM from 'react-dom/client';
import SignIn from './SignUp/SignUp.tsx'
import SignUp from './SignIn/SignIn.tsx';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './HomePage/Home.tsx';
import RxSaver from './RxSaver/RxSaver.tsx';
import RxFinder from './RxFinder/RxFinder.tsx'
import UpdateInfo from './UpdateUser/UpdateUser.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rxsaver" element={<RxSaver />} />
        <Route path="/rxfinder" element={<RxFinder />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/updateinfo" element={<UpdateInfo />} />
      </Routes>
    </BrowserRouter>
  </>
);
