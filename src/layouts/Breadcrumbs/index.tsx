import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';

import { showDisplayText } from '../../utils/util';
import './index.css';

function Breadcrumbs() {
  const navigate = useNavigate();

  let currentPath = useLocation().pathname;
  let lastSlashIndex = currentPath.lastIndexOf('/');
  // Remove trailing slash ('/')
  if (lastSlashIndex == currentPath.length - 1) {
    currentPath = currentPath.substring(0, lastSlashIndex);
    lastSlashIndex = currentPath.lastIndexOf('/');
  }

  const breadcrumbItems = [];
  // Creating breadcrums
  while (lastSlashIndex != 0) {
    const breadcrumbItem = {
      label: showDisplayText(currentPath.substring(lastSlashIndex + 1)),
      url: currentPath,
      command: () => {
        navigate(currentPath);
      },
      className: 'capitalize font-medium',
    };
    breadcrumbItems.unshift(breadcrumbItem);
    currentPath = currentPath.substring(0, lastSlashIndex);
    lastSlashIndex = currentPath.lastIndexOf('/');
  }

  // Last for base URL
  const breadcrumbItem = {
    label: showDisplayText(currentPath.substring(lastSlashIndex + 1)),
    url: currentPath,
    command: () => {
      navigate(currentPath);
    },
    className: 'uppercase font-medium',
  };
  breadcrumbItems.unshift(breadcrumbItem);

  return (
    <BreadCrumb
      className='py-1 px-0 mb-3'
      style={{ background: 'none' }}
      id='breadcrumb'
      model={breadcrumbItems}
    />
  );
}

export default Breadcrumbs;
