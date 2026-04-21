import React , { useEffect } from 'react'
import { Route , Routes } from 'react-router-dom'
import Home from './Components/Home/Home'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import ProtectedRoutes from './features/authentication/ProtectedRoutes'
import Dashboard from './Components/Dashboard/Dashboard'
import { useAppDispatch } from './services/hook'
import { autoLogin } from './features/authentication/authThunk'
import Room from './Components/Room/Room'
import Profile from './Components/Profile/Profile'

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(autoLogin());
  },[dispatch]);

  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />

      <Route element={<ProtectedRoutes/>}>
        <Route path='/main' element={<Dashboard/>} />
        <Route path='/room' element={<Room/>} />
        <Route path='/profile' element={<Profile/>} />
      </Route>
    </Routes>
  )
}

export default App