import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/userProfile/Login'
import Navbar from './components/Navbar'
import { useSelector } from 'react-redux'
import CreateLate from './components/CreateLate'
import Classes from './components/manage/Classes'
import Students from './components/manage/Students'
import Lates from './components/manage/Lates'
import ExcellentReportFilter from './components/reports/ExcellentReportFilter'
import LatesOfClassReportFilter from './components/reports/LatesOfClassReportFilter'
import LatesForMarksFilter from './components/reports/LatesForMarksFilter'
import NotFound from './components/NotFound'
import StepperNewYear from './components/manage/StepperNewYear'
import EditPassword from './components/userProfile/EditPassword'
import Footer from './components/Footer'
import JoyrideTour from './components/JoyrideTour'
import { useState } from 'react'

function App() {

   const [runTour, setRunTour] = useState(0)
   const {isUserLoggedIn} = useSelector((state)=>state.auth)

   return (<>
         {
            isUserLoggedIn ? 
            <>
               <Navbar setRunTour={setRunTour}/>
               <Routes>
                  <Route path='/' element={<CreateLate/>}/>
                  <Route path='/classes' element={<Classes/>}/>
                  <Route path='/students' element={<Students/>}/>
                  <Route path='/lates' element={<Lates/>}/>
                  <Route path='/excellentReport' element={<ExcellentReportFilter/>}/>
                  <Route path='/classReport' element={<LatesOfClassReportFilter/>}/>
                  <Route path='/marks' element={<LatesForMarksFilter/>}/>
                  <Route path='/stepsNewYear' element={<StepperNewYear/>}/>
                  <Route path='/editPassword' element={<EditPassword/>}/>
                  <Route path='*' element={<NotFound allowed={true}/>}/>
               </Routes>
               <JoyrideTour start={runTour}/>
            </>
            :  
            <Routes>
               <Route path='/' element={<Login/>}/>
               <Route path='*' element={<NotFound allowed={false}/>}/>
            </Routes>
        }
      <Footer/>
  </>)
}

export default App
