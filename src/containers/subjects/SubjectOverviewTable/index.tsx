import React, { useState, useEffect } from 'react';
import API from '@aws-amplify/api';

// Custom component
import CircularLoaderWithText from '../../../components/CircularLoaderWithText';
import { useToastContext } from '../../../providers/ToastProvider';
import JSONToTable from '../../../components/JSONToTable';

const OVERVIEW_COLUMN = [
  'subject_id',
  'external_subject_id',
  'illumina_id',
  'project_name',
  'project_owner',
  'workflow',
  'timestamp',
];

type JsonOfArrayType = { [key: string]: (string | number)[] };
type Props = { subjectId: string };

function SubjectOverviewTable(props: Props) {
  const { subjectId } = props;
  const [subjectOverview, setSubjectOverview] = useState<JsonOfArrayType>({});

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToastContext();

  useEffect(() => {
    let isComponentUnmount = false;
    setIsLoading(true);
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const subjectApiResponse = await API.get('portal', `/subjects/${subjectId}/`, {});
        const summarizeLims = convertArrayOfJsonToJsonOfArray(subjectApiResponse.lims);
        if (isComponentUnmount) return;
        setSubjectOverview(summarizeLims);
      } catch (err) {
        toast?.show({
          severity: 'error',
          summary: 'Something went wrong!',
          detail: 'Unable to fetch data from Portal API',
          life: 3000,
        });
      }
      setIsLoading(false);
    };
    fetchData();

    return () => {
      isComponentUnmount = true;
    };
  }, []);
  return (
    <div>{isLoading ? <CircularLoaderWithText /> : <JSONToTable objData={subjectOverview} />}</div>
  );
}

export default SubjectOverviewTable;

/**
 * This function will convert from array of JSON object to JSON of array. (See example)
 * Example: [{'name':'John'}, {'name':'Doe'}] to {'name':['John','Doe']}
 * @param jsonArray Array of JSON
 */
function convertArrayOfJsonToJsonOfArray(jsonArray: { [key: string]: string | number }[]) {
  const JsonOfArray: { [key: string]: (string | number)[] } = {};

  for (const object of jsonArray) {
    for (const column of OVERVIEW_COLUMN) {
      const objectVal = object[column];
      if (JsonOfArray[column]) {
        JsonOfArray[column].push(objectVal);
      } else {
        JsonOfArray[column] = [objectVal];
      }
    }
  }

  // Removing any duplicates in the JSON
  for (const column of OVERVIEW_COLUMN) {
    if (JsonOfArray[column]) {
      JsonOfArray[column] = [...new Set(JsonOfArray[column])];
    }
  }

  return JsonOfArray;
}
