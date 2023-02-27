import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

// MUI
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import NativeSelect from '@material-ui/core/NativeSelect';
import Container from '@material-ui/core/Container';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';

// MUI icon
import CircularProgress from '@material-ui/core/CircularProgress';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

// Colors
import { red, green } from '@mui/material/colors';

// Customs
import {
  PRIMARY_DATASETS_OPTION,
  EXTENDED_DATASETS_OPTION,
  PAN_CANCER_DATASETS_OPTION,
} from '../utils/rnasum';
import { LAMBDA_PREFIX, REGION } from '../config';

const ALL_DATASETS_OPTION = [
  ...PRIMARY_DATASETS_OPTION,
  ...EXTENDED_DATASETS_OPTION,
  ...PAN_CANCER_DATASETS_OPTION,
];

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right';
}
const RNASUM_TABLE_COLUMN: Column[] = [
  { id: 'project', label: 'Project' },
  {
    id: 'tissue_code',
    label: 'Tissue Code',

    align: 'right',
  },
  {
    id: 'samples_no',
    label: 'Samples No',

    align: 'right',
  },
];
const RNAsumTable = () => {
  return (
    <TableContainer style={{ maxHeight: '400px' }}>
      <Table stickyHeader aria-label='sticky table'>
        <TableHead>
          <TableRow>
            {RNASUM_TABLE_COLUMN.map((column) => (
              <TableCell
                key={`head-` + column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {ALL_DATASETS_OPTION.map((row: Record<string, string>, index: number) => {
            return (
              <TableRow hover role='checkbox' tabIndex={-1} key={`dataset-row-` + index}>
                {RNASUM_TABLE_COLUMN.map((column: Column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={`row-cell-` + column.id} align={column.align}>
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function groupSubjectData(subject: any) {
  // This is only what is needed for RNAsum report
  return {
    wtsBamsIca: subject.results_gds.filter(
      (r: any) => r.path.includes('wts_tumor_only') && r.path.endsWith('bam')
    ),
    wgsCancer: subject.results_gds.filter(
      (r: any) => r.path.includes('umccrise') && r.path.endsWith('cancer_report.html')
    ),
  };
}

type Props = {
  subject_id: string;
  subject: any;
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  handleIsOpenState: (val: boolean) => void;
};
function LaunchRNAsumReport(props: Props) {
  const { subject, subject_id, isOpen, handleIsOpenState } = props;
  const [datasetSelected, setDatasetSelected] = useState();
  const [isRNAsumTableOpen, setIsRNAsumTableOpen] = useState(false);

  const rnasumInputData = groupSubjectData(subject);
  const [triggerStatus, setTriggerStatus] = useState({
    isError: false,
    isLoading: false,
    isSuccess: false,
  });

  const handleCloseDialog = () => {
    handleIsOpenState(false);
    setTriggerStatus({
      isError: false,
      isLoading: false,
      isSuccess: false,
    });
  };

  const handleRNAsumTrigger = async () => {
    const RNASUM_WF_LAMBDA_NAME = 'rnasum';

    try {
      setTriggerStatus((prevState) => {
        return {
          ...prevState,
          isLoading: true,
        };
      });
      const currentCredentials = await Auth.currentCredentials();
      const lambdaClient = new LambdaClient({
        region: REGION,
        credentials: currentCredentials,
      });

      const command = new InvokeCommand({
        InvocationType: 'Event',
        FunctionName: `${LAMBDA_PREFIX}${RNASUM_WF_LAMBDA_NAME}`,
        Payload: Buffer.from(
          JSON.stringify({
            subject_id: subject_id,
            dataset: datasetSelected,
          })
        ),
      });

      await lambdaClient.send(command);
      setTriggerStatus((prevState) => {
        return {
          ...prevState,
          isLoading: false,
          isSuccess: true,
        };
      });
    } catch (e) {
      setTriggerStatus((prevState) => {
        return {
          ...prevState,
          isLoading: false,
          isError: true,
        };
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => handleCloseDialog()}
      maxWidth={'lg'}
      PaperProps={{ style: { overflow: 'unset' } }}>
      <Container>
        <DialogTitle>{`RNAsum Report`}</DialogTitle>
        <DialogContent style={{ overflow: 'unset' }}>
          <Grid
            container
            direction='column'
            justifyContent='center'
            alignItems='center'
            spacing={3}>
            {triggerStatus.isLoading ? (
              <Grid item>
                <CircularProgress />
              </Grid>
            ) : triggerStatus.isError ? (
              <Grid item container direction='column' justifyContent='center' alignItems='center'>
                <Grid item>
                  <CancelIcon style={{ fontSize: 40, color: red[400] }} />
                </Grid>
                <Grid item>
                  <Typography>Something went wrong to triggering RNAsum report</Typography>
                </Grid>
              </Grid>
            ) : triggerStatus.isSuccess ? (
              <Grid item container direction='column' justifyContent='center' alignItems='center'>
                <Grid item>
                  <CheckCircleIcon style={{ fontSize: 40, color: green[400] }} />
                </Grid>
                <Grid item>
                  <Typography>{`Generating '${datasetSelected}' dataset RNAsum report for ${subject_id}. Check Slack for updates!`}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Grid item xs={12} style={{ width: '100%' }}>
                <Table size='small' aria-label='a dense table'>
                  <TableBody>
                    {/* Subject ID row */}
                    <TableRow>
                      <TableCell>
                        <Typography variant='body2' display='block' gutterBottom>
                          SUBJECT_ID
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' display='block' gutterBottom>
                          {subject_id}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {rnasumInputData.wtsBamsIca.length != 1 ||
                    rnasumInputData.wgsCancer.length < 1 ? (
                      <TableRow>
                        <TableCell>
                          <Typography color='error'>ERROR</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color='error' align='right'>
                            {rnasumInputData.wtsBamsIca.length < 1
                              ? `No transcriptome workflow output found for the Subject`
                              : rnasumInputData.wtsBamsIca.length > 1
                              ? `Multiple transcriptome workflow output found for the Subject`
                              : rnasumInputData.wgsCancer.length < 1
                              ? `No umccrise workflow output found for the Subject`
                              : `ERROR`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : rnasumInputData.wgsCancer.length < 1 ? (
                      <TableRow>
                        <TableCell>
                          <Typography color='error' align='justify'></Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        <TableRow>
                          <TableCell>
                            <Typography variant='body2' display='block' gutterBottom>
                              Dataset Project
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <NativeSelect
                              value={datasetSelected}
                              onChange={(event: any) => setDatasetSelected(event.target.value)}
                              inputProps={{
                                name: 'age',
                                id: 'age-native-label-placeholder',
                              }}>
                              <option value={undefined}></option>

                              {ALL_DATASETS_OPTION.map((col: any, index: number) => {
                                const label = col.project;
                                return (
                                  <option key={index} value={label}>
                                    {label}
                                  </option>
                                );
                              })}
                            </NativeSelect>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ borderBottom: 0 }} colSpan={2}>
                            <>
                              <Grid
                                container
                                direction='row'
                                justifyContent='space-between'
                                alignItems='center'>
                                <Grid item>
                                  <Typography variant='body2' display='block' gutterBottom>
                                    Show RNAsum Table
                                  </Typography>
                                </Grid>
                                <Grid item>
                                  <Switch
                                    checked={isRNAsumTableOpen}
                                    onChange={() => setIsRNAsumTableOpen((prev: any) => !prev)}
                                    color='primary'
                                    name='checked'
                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                  />
                                </Grid>
                              </Grid>
                              {isRNAsumTableOpen ? <RNAsumTable /> : <></>}
                            </>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell align='right' style={{ borderBottom: 0 }} colSpan={2}>
                            {/* Triggering button */}
                            <Button
                              disabled={
                                !datasetSelected ||
                                triggerStatus.isLoading ||
                                rnasumInputData.wgsCancer.length < 1 ||
                                rnasumInputData.wtsBamsIca.length < 1
                              }
                              variant='contained'
                              color='primary'
                              onClick={handleRNAsumTrigger}>
                              Generate
                            </Button>
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      </Container>
    </Dialog>
  );
}

export default LaunchRNAsumReport;
