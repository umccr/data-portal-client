import React, { useEffect, useState } from 'react';
import { Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../../providers/UserProvider';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { createApi } from 'unsplash-js';
import { Random } from 'unsplash-js/dist/methods/photos/types';
import { ProgressBar } from 'primereact/progressbar';

const clientId = import.meta.env.VITE_UNSPLASH_CLIENT_ID;

function Copyright() {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <p>{'©'}&nbsp;</p>
      <a
        style={{ color: 'white', textDecoration: 'underline', fontSize: 'small' }}
        href='https://umccr.org'>
        {'UMCCR'}
      </a>
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
      <img src='/uomlogo.png' style={{ width: '30%', height: 'auto' }} alt='uomlogo.png' />
    </div>
  );

  const footer = (
    <span>
      <Button
        onClick={() => loggingIn()}
        style={{ width: '100%', background: '#0E297A' }}
        label='SIGN IN'
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
        style={{
          width: '40em',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(2.2px)',
        }}
        header={header}
        footer={footer}>
        <div style={{ textAlign: 'justify', color: 'white' }}>
          <h1 style={{ fontSize: '2em', textAlign: 'center' }}>UMCCR Data Portal</h1>
          <p className='m-0' style={{ lineHeight: '1.5' }}>
            Led by Professor Sean Grimmond, UMCCR aims to foster innovation and integration in
            cancer care, research, education and training to achieve a world-leading cancer centre
            and workforce.
          </p>
        </div>
      </Card>
    </div>
  );
}

function SignInPage() {
  // Already signedIn, redirect to HomePage
  if (useUserContext().isAuth) {
    return <Navigate replace to='/' />;
  }

  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLink, setImageLink] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userLink, setUserLink] = useState<string>('');

  useEffect(() => {
    const unsplashApi = createApi({
      apiUrl: 'https://api.unsplash.com',
      headers: { Authorization: 'Client-ID ' + clientId },
    });

    unsplashApi.photos
      .getRandom({
        collectionIds: ['ce-IsXyySA4'],
        count: 1,
      })
      .then((result) => {
        if (result.errors) {
          // console.log('error occurred: ', result.errors[0]);
          setImageUrl('iStock-529081597-2.jpg');
        } else {
          const randoms: Random[] = result.response as Random[];
          setImageUrl(randoms[0].urls.regular);
          setImageLink(randoms[0].links.html);
          setUserName(randoms[0].user.username);
          setUserLink(randoms[0].user.links.html);
        }
      })
      .catch(() => {
        // console.log('fetch error occurred: ', err);
        setImageUrl('iStock-529081597-2.jpg');
      });
  }, []);

  return (
    <div className='relative overflow-hidden' style={{ height: '100%', width: '100%' }}>
      {!imageUrl && <ProgressBar mode='indeterminate' style={{ height: '6px' }} />}
      <div
        className='absolute'
        style={{
          backgroundColor: 'grey',
          height: '100%',
          width: '100%',
          zIndex: -1,
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.527),rgba(0, 0, 0, 0.5)), url(' + imageUrl + ')',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className='z-1 flex justify-content-center align-items-center'
        style={{ height: '100%' }}>
        <SignInContainer />
      </div>
      {userLink && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            padding: '20px',
            fontSize: 'small',
            color: 'lightgrey',
          }}>
          Photo by&nbsp;
          <a
            style={{ fontSize: 'small', color: 'lightgrey', textDecoration: 'underline' }}
            href={userLink + '?utm_source=umccr_data_portal&utm_medium=referral'}
            target={'_blank'}
            rel='noreferrer'>
            {userName}
          </a>
          &nbsp;on&nbsp;
          <a
            style={{ fontSize: 'small', color: 'lightgrey', textDecoration: 'underline' }}
            href={imageLink + '?utm_source=umccr_data_portal&utm_medium=referral'}
            target={'_blank'}
            rel='noreferrer'>
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
}

export default SignInPage;
