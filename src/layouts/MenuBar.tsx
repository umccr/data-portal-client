import React, { useRef, useState, useEffect } from 'react';
import { Auth } from '@aws-amplify/auth';
import { Menubar } from 'primereact/menubar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { Navigate, useNavigate } from 'react-router-dom';

import { useUserContext } from '../providers/UserProvider';
import TokenDialog from '../containers/TokenDialog/TokenDialog';
const DataPortalLogo = () => {
  const navigate = useNavigate();

  return (
    <div className='flex align-items-center surface-border w-full'>
      <Button
        className='text-xl text-color font-semibold p-button-secondary p-button-text shadow-none'
        label='UMCCR Data Portal'
        onClick={() => {
          navigate('/');
        }}
      />
    </div>
  );
};

const AccountMenu = () => {
  // User Information
  const userInformation = useUserContext().user;
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState<boolean>(false);
  function handleIsTokenDialogChange(val: boolean) {
    setIsTokenDialogOpen(val);
  }

  // Menu Account Button
  const accountMenuRef = useRef<Menu>(null);
  const handleAccountMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    if (accountMenuRef.current) {
      accountMenuRef.current.toggle(event);
    }
  };
  const accountMenuItems = [
    {
      label: 'JWT Token',
      command: () => setIsTokenDialogOpen(true),
    },
    {
      label: 'Sign Out',
      command: () => Auth.signOut(),
    },
  ];

  return (
    <>
      <TokenDialog isOpen={isTokenDialogOpen} handleIsOpen={handleIsTokenDialogChange} />
      <Menu model={accountMenuItems} popup ref={accountMenuRef} id='accountMenuPopup' />
      <Button
        className='p-button-secondary p-button-text shadow-none'
        label={userInformation.attributes.email}
        onClick={(event) => handleAccountMenuClick(event)}
      />
    </>
  );
};

function MenuBar() {
  const navigate = useNavigate();
  const items = [
    {
      label: 'Subjects',
      command: () => {
        navigate('/subject');
      },
    },
    {
      label: 'Metadata',
      command: () => {
        navigate('/metadata');
      },
    },
    {
      label: 'LIMS',
      command: () => {
        navigate('/lims');
      },
    },
    {
      label: 'S3',
      command: () => {
        navigate('/s3');
      },
    },
    {
      label: 'GDS',
      command: () => {
        navigate('/gds');
      },
    },
  ];
  return <Menubar className='p-2' start={<DataPortalLogo />} model={items} end={<AccountMenu />} />;
}

export default MenuBar;
