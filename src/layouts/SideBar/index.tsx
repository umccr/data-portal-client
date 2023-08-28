import React, { useState } from 'react';
import { Button } from 'primereact/button';
import './index.css';

type sideBarProps = {
  sideBarElement: React.ReactNode;
  mainPageElement: React.ReactNode;
};
function SideBar({ sideBarElement, mainPageElement }: sideBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const handleIsDrawerOpenChange = () => setIsDrawerOpen((prev) => !prev);

  const wrapperClassString = `layout-wrapper layout-static ${
    isDrawerOpen ? `` : 'layout-static-sidebar-inactive'
  }`;
  const openCloseIcon = isDrawerOpen ? 'pi pi-angle-left' : 'pi pi-angle-right';

  return (
    <div className={wrapperClassString}>
      <div className='layout-sidebar'>
        {isDrawerOpen ? (
          <>
            <Button
              text
              rounded
              size='large'
              severity='secondary'
              onClick={handleIsDrawerOpenChange}
              icon={openCloseIcon}
              className='absolute'
              style={{ top: '1.5rem', right: '1rem' }}
              aria-label='Cancel'
            />
            {sideBarElement}
          </>
        ) : (
          <Button
            text
            rounded
            size='large'
            severity='secondary'
            onClick={handleIsDrawerOpenChange}
            icon={openCloseIcon}
            className='right-0 absolute'
            style={{ top: '1.5rem' }}
            aria-label='Cancel'
          />
        )}
      </div>
      <div className='layout-main-container'>
        <div className='px-5 py-3'>{mainPageElement}</div>
      </div>
    </div>
  );
}

export default SideBar;
