import React from 'react';
import { useCart } from '../../stores/CartContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import styles from './ToastList.module.scss';

const ToastList: React.FC = () => {
  const { toasts, removeToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          role="alert"
        >
          <div className={styles.icon}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          <div className={styles.message}>{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className={styles.closeBtn}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastList;
