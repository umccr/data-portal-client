import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

type ObjectType = Record<
  string,
  (string | number | boolean | null) | (string | number)[] | JSX.Element
>;

type Props = {
  objData: ObjectType;
};

// Type for Data Table show
type rowDataType = {
  key: string;
  value: string | number | (string | number)[] | JSX.Element;
};

function JSONToTable(props: Props) {
  const { objData } = props;

  const fieldArray = convertObjToKeyValueArray(objData);

  // Template for object printed in table
  const keyTemplate = (rowData: rowDataType) => {
    return <div className='font-semibold uppercase white-space-nowrap'>{rowData.key}</div>;
  };
  const valTemplate = (rowData: rowDataType) => {
    if (Array.isArray(rowData.value)) {
      return (
        <>
          {rowData.value.map((item, index) => {
            return (
              <div key={index} id={index.toString()}>
                {item}
              </div>
            );
          })}
        </>
      );
    } else if (typeof rowData.value === 'string' || typeof rowData.value === 'number') {
      return <div>{rowData.value}</div>;
    } else {
      return rowData.value;
    }
  };

  return (
    <DataTable className='w-full' value={fieldArray} responsiveLayout='scroll'>
      <Column
        headerStyle={{ display: 'none' }}
        style={{ padding: '0.5rem 1rem' }}
        field='key'
        body={keyTemplate}
      />
      <Column
        headerStyle={{ display: 'none' }}
        style={{ padding: '0.5rem 1rem' }}
        field='value'
        body={valTemplate}
      />
    </DataTable>
  );
}

export default JSONToTable;

/**
 * This conversion is needed in order to use DataTable PrimeReact.
 * Values are accepted in a form of array instead of JSON
 * @param objData the Object passed in to the function
 * @returns The value needed for the DataTable value field
 */
function convertObjToKeyValueArray(objData: ObjectType) {
  const keyList = Object.keys(objData);

  const keyValue = [];

  for (const keyString of keyList) {
    const value = objData[keyString];
    keyValue.push({
      key: keyString,
      value: value,
    });
  }
  return keyValue;
}
