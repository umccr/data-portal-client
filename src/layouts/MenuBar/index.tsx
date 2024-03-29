import React, { useRef, useState } from 'react';
import { signOut } from 'aws-amplify/auth';
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
      command: () => signOut(),
    },
  ];

  return (
    <>
      {isTokenDialogOpen && (
        <TokenDialog isOpen={isTokenDialogOpen} handleIsOpen={handleIsTokenDialogChange} />
      )}
      <Menu model={accountMenuItems} popup ref={accountMenuRef} id='accountMenuPopup' />
      <Button
        className='p-button-secondary p-button-text shadow-none text-white'
        label={userInformation.email}
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
      className: 'text-xl text-white font-semibold p-button-secondary p-button-text shadow-none',
    },
    // TODO: let's hide these for now ~victor
    // {
    //   label: 'Subjects',
    //   command: () => {
    //     navigate('/subjects');
    //   },
    // },
    // {
    //   label: 'Metadata',
    //   command: () => {
    //     navigate('/metadata');
    //   },
    // },
    // {
    //   label: 'LIMS',
    //   command: () => {
    //     navigate('/lims');
    //   },
    // },
    // {
    //   label: 'Runs',
    //   command: () => {
    //     navigate('/runs');
    //   },
    // },
    // {
    //   label: 'Search',
    //   command: () => {
    //     navigate('/search');
    //   },
    // },
  ];
  return (
    <Menubar
      className='fixed p-0 w-full border-noround border-none bg-primary-800 h-3rem top-0'
      style={{ zIndex: 2 }}
      model={items}
      end={<AccountMenu />}
      menuIcon={<i className='pi pi-bars' />}
    />
  );
}

export default MenuBar;
