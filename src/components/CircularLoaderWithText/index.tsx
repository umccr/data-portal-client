import { ProgressSpinner } from 'primereact/progressspinner';

type Props = { text?: string; spinnerSize?: string };

export default function CircularLoaderWithText(props: Props): React.ReactElement {
  const { text, spinnerSize = '50px' } = props;

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
      <ProgressSpinner
        style={{ height: spinnerSize, width: spinnerSize }}
        strokeWidth='8'
        fill='var(--surface-ground)'
        animationDuration='.5s'
      />
      {props.text ? <div style={{ paddingTop: '1rem' }}>{text}</div> : <></>}
    </div>
  );
}
