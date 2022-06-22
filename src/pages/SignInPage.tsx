import React, { useState } from 'react';
import { Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Navigate } from 'react-router-dom';
import { useUserContext } from '../providers/UserProvider';
import { Container, Col, Row, Hidden } from 'react-grid-system';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

const ImageCSS = {
  backgroundImage: 'url(https://source.unsplash.com/user/umccr/likes)',
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

  const loggingIn = async () => {
    setIsLoading(true);
    await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });
    setIsLoading(false);
  };

  const header = (
    <Container>
      <Row justify='center'>
        <img
          src='../../public/uomlogo.png'
          style={{ width: '20%', height: 'auto' }}
          alt='uomlogo.png'
        />
      </Row>
    </Container>
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
    <div
      style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card
        title='UMCCR Data Portal'
        style={{ width: '25em', boxShadow: 'none' }}
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
  if (!useUserContext().isAuth) {
    return <Navigate replace to='/' />;
  }

  return (
    <Container fluid style={{ height: '100%' }}>
      <Row style={{ height: '100%', alignItems: 'center' }} direction='row'>
        <Hidden xs>
          <Col sm={4} md={8} style={{ ...ImageCSS, alignItems: 'center', height: '100%' }} />
        </Hidden>
        <Col xs={12} sm={8} md={4} style={{ alignItems: 'center', height: '100%' }}>
          <SignInContainer />
        </Col>
      </Row>
    </Container>
  );
}

export default SignInPage;
