import React, { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom';



const PublicRouteWrapper = ({children}) => {
    const { isAuthenticated } = useAuthStore();
    console.log(isAuthenticated);
    const navigate = useNavigate() ;

    useEffect(() => {

        
    if (localStorage.getItem('isAuthenticated') === 'true' || isAuthenticated) {
        navigate('/chat');
    }

}, [isAuthenticated]);

    return (
    <div>
        {children}
    </div>
  )
}

export default PublicRouteWrapper