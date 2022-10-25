import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { useLocation } from 'react-router-dom';

import './index.css';

function Breadcrumbs() {
  let currentPath = useLocation().pathname;
  let lastSlashIndex = currentPath.lastIndexOf('/');
  // Remove trailing slash ('/')
  if (lastSlashIndex == currentPath.length - 1) {
    currentPath = currentPath.substring(0, lastSlashIndex);
    lastSlashIndex = currentPath.lastIndexOf('/');
  }

  const breadcrumbItems = [];
  // Creating breadcrumbs
  while (lastSlashIndex != 0) {
    const breadcrumbItem = {
      label: currentPath.substring(lastSlashIndex + 1),
      url: currentPath,
      className: 'uppercase font-medium',
    };
    breadcrumbItems.unshift(breadcrumbItem);
    currentPath = currentPath.substring(0, lastSlashIndex);
    lastSlashIndex = currentPath.lastIndexOf('/');
  }

  // Last for base URL
  const breadcrumbItem = {
    label: currentPath.substring(lastSlashIndex + 1),
    url: currentPath,
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
