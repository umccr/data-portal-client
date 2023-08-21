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
              onClick={handleIsDrawerOpenChange}
              icon={openCloseIcon}
              className='p-button-rounded p-button-secondary p-button-text absolute'
              style={{ top: '1rem', right: '1rem' }}
              aria-label='Cancel'
            />
            {sideBarElement}
          </>
        ) : (
          <>
            <Button
              onClick={handleIsDrawerOpenChange}
              icon={openCloseIcon}
              className='top-0 right-0 p-button-rounded p-button-secondary p-button-text absolute'
              aria-label='Cancel'
            />
            {sideBarElement}
          </>
        )}
      </div>
      <div className='layout-main-container'>
        <div className='px-5 py-3'>{mainPageElement}</div>
      </div>
    </div>
  );
}

export default SideBar;
