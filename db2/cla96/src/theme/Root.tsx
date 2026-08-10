import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import {rememberLocation} from '../utils/learningState';

export default function Root({children}: {children: React.ReactNode}) {
  const location = useLocation();

  useEffect(() => {
    rememberLocation(location.pathname);
  }, [location.pathname]);

  return <>{children}</>;
}
