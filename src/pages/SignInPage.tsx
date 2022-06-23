import React, { useState } from 'react';
import { Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../providers/UserProvider';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

const ImageCSS = {
  backgroundImage:
    'linear-gradient(rgba(0, 0, 0, 0.527),rgba(0, 0, 0, 0.5)), url(https://source.unsplash.com/user/umccr/likes)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

function Copyright() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>{'©'}&nbsp;</p>
      <a href='https://umccr.org'>{'UMCCR'}</a>
      &nbsp;
      <p>{new Date().getFullYear()}</p>
    </div>
  );
}

function SignInContainer() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loggingIn = () => {
    setIsLoading(true);

    // Auth.federatedSignIn will redirect out from page (Not expecting to setIsLoading(false))
    Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });
  };

  const header = (
    <div className='flex justify-content-center align-items-center' style={{ padding: '20px' }}>
      <img src='/uomlogo.png' style={{ width: '20%', height: 'auto' }} alt='uomlogo.png' />
    </div>
  );

  const footer = (
    <span>
      <Button
        onClick={() => loggingIn()}
        style={{ width: '100%', background: '#0E297A' }}
        label='Sign In'
        icon='pi pi-sign-in'
        className='p-button-info'
        loading={isLoading}
      />
      <Copyright />
    </span>
  );

  return (
    <div className='flex justify-content-center align-items-center' style={{ height: '100%' }}>
      <Card
        title='UMCCR Data Portal'
        style={{ width: '25em', boxShadow: 'none', backgroundColor: 'white', padding: '20px' }}
        header={header}
        footer={footer}>
        <p className='m-0' style={{ lineHeight: '1.5' }}>
          Led by Professor Sean Grimmond, the UMCCR aims to foster innovation and integration in
          cancer care, research, education and training to achieve a world-leading cancer centre and
          workforce.
        </p>
      </Card>
    </div>
  );
}

function SignInPage() {
  // Already signedIn, redirect to HomePage
  if (useUserContext().isAuth) {
    return <Navigate replace to='/' />;
  }

  return (
    <div className='relative overflow-hidden' style={{ height: '100%', width: '100%' }}>
      <div
        className='absolute'
        style={{
          backgroundColor: 'grey',
          height: '100%',
          width: '100%',
          zIndex: -1,
          ...ImageCSS,
        }}
      />
      <div
        className='z-1 flex justify-content-center align-items-center'
        style={{ height: '100%' }}>
        <SignInContainer />
      </div>
    </div>
  );
}

export default SignInPage;
