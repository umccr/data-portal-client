import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';

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
      label: currentPath.substring(lastSlashIndex + 1),
      url: currentPath,
      command: () => {
        navigate(currentPath);
      },
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
    command: () => {
      navigate(currentPath);
    },
    className: 'uppercase font-medium',
  };
  breadcrumbItems.unshift(breadcrumbItem);

  return <BreadCrumb style={{ background: 'none' }} id='breadcrumb' model={breadcrumbItems} />;
}

export default Breadcrumbs;
