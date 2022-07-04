import React, { useRef, useState } from 'react';
import { Auth } from '@aws-amplify/auth';
import { Menubar } from 'primereact/menubar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

import { useUserContext } from '../../providers/UserProvider';
import TokenDialog from '../../containers/utils/TokenDialog';

import './index.css';

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
        className='p-button-secondary p-button-text shadow-none text-white'
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
      label: 'UMCCR Data Portal',
      command: () => {
        navigate('/');
      },
      className:
        'text-xl text-black-alpha-90 font-semibold p-button-secondary p-button-text shadow-none',
    },
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
      label: 'Search',
      command: () => {
        navigate('/search');
      },
    },
  ];
  return (
    <Menubar
      className='p-0 border-noround border-none bg-blue-800 h-3rem'
      model={items}
      end={<AccountMenu />}
    />
  );
}

export default MenuBar;
