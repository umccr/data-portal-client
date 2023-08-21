import React, { useRef, createContext, useContext, useCallback } from 'react';
import { Toast, ToastMessage } from 'primereact/toast';

/**
 * Create ToastContext
 */
const ToastContext = createContext<{
  toastShow: (m: ToastMessage) => void;
}>({
  toastShow: () => undefined,
});

type Props = { children: React.ReactNode };
function ToastProvider(props: Props) {
  const toastRef = useRef<Toast>(null);

  const toastShow = useCallback((m: ToastMessage) => toastRef.current?.show(m), []);
  return (
    <>
      <Toast ref={toastRef} position='bottom-left' className='w-6' style={{ maxWidth: '1000px' }} />
      <ToastContext.Provider value={{ toastShow: toastShow }}>
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
