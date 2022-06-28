import { ProgressSpinner } from 'primereact/progressspinner';

type Props = { text?: string };

export default function CircularLoaderWithText(props: Props): React.ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ProgressSpinner style={{ height: '50px', width: '50px' }} />
      {props.text ? <div style={{ paddingTop: '1rem' }}>{props.text}</div> : <></>}
    </div>
  );
}
