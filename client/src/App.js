import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import Navbar from './components/Navbar'
import { useSelector } from 'react-redux'
import CreateLate from './components/CreateLate'
import Classes from './components/Classes'
import Students from './components/Students'
import Lates from './components/Lates'
import ExcellentReportFilter from './components/ExcellentReportFilter'
import LatesOfClassReportFilter from './components/LatesOfClassReportFilter'
import LatesForMarksFilter from './components/LatesForMarksFilter'
import NotFound from './components/NotFound'
import StepperNewYear from './components/StepperNewYear'
import EditPassword from './components/EditPassword'

function App() {

   const {isUserLoggedIn} = useSelector((state)=>state.auth)

   return (<>
         {
            // isUserLoggedIn ? 
            <>
               <Navbar/>
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
            </>
            // :  
            // <Routes>
            //    <Route path='/' element={<Login/>}/>
            //    <Route path='*' element={<NotFound allowed={false}/>}/>
            // </Routes>
        }
  </>)
}

export default App
