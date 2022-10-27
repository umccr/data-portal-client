import React, { useRef, createContext, useContext, useCallback } from 'react';
import { Toast, ToastMessageType } from 'primereact/toast';

/**
 * Create ToastContext
 */
const ToastContext = createContext<{
  toastShow: (m: ToastMessageType) => void;
  toastReplace: (m: ToastMessageType) => void;
}>({
  toastShow: () => undefined,
  toastReplace: () => undefined,
});

type Props = { children: React.ReactNode };
function ToastProvider(props: Props) {
  const toastRef = useRef<Toast>(null);

  const toastShow = useCallback((m: ToastMessageType) => toastRef.current?.show(m), []);
  const toastReplace = useCallback((m: ToastMessageType) => toastRef.current?.replace(m), []);
  return (
    <>
      <Toast
        ref={toastRef}
        position='top-center'
        className='opacity-100 w-6'
        style={{ maxWidth: '1000px' }}
      />
      <ToastContext.Provider value={{ toastShow: toastShow, toastReplace: toastReplace }}>
        {props.children}
      </ToastContext.Provider>
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
