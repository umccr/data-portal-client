import React, { useRef, useState, useEffect, createContext, useContext } from 'react';
import { Toast } from 'primereact/toast';

/**
 * Create ToastContext
 */
const ToastContext = createContext<Toast | null>(null);

type Props = { children: React.ReactNode };
function ToastProvider(props: Props) {
  const toastRef = useRef<Toast>(null);

  // To refresh when toastRef change
  // Ref: https://stackoverflow.com/questions/57573148/how-correctly-pass-a-node-from-a-ref-to-a-context
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [toastRefState, setToastRefState] = useState<Toast | null>(null);
  useEffect(() => {
    if (!toastRef.current) {
      return;
    }
    setToastRefState(toastRef.current);
  }, []);

  return (
    <>
      <Toast
        ref={toastRef}
        position='top-center'
        className='opacity-100 w-6'
        style={{ maxWidth: '1000px' }}
      />
      <ToastContext.Provider value={toastRef.current}>{props.children}</ToastContext.Provider>
    </>
  );
}

export default ToastProvider;

/**
 * Helper Function
 */
export function useToastContext() {
  return useContext(ToastContext);
}
