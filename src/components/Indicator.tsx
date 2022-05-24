import styles from "../styles/Loading.module.css";

export interface indicatorProps {
  msg: string;
  isLoading?: boolean;
  closeable?: boolean;
  onClose?: () => void;
}

const defaultProps: indicatorProps = {
  msg: "Loading",
  isLoading: false,
  closeable: false,
  onClose: () => {},
};
const Indicator = (props: indicatorProps) => {
  const { msg, isLoading, closeable, onClose } = { ...defaultProps, ...props };

  return (
    <div className={styles.loading}>
      {msg}
      {isLoading ? <span className={styles.spinner}></span> : null}
      {closeable ? (
        <a className={styles.close} onClick={onClose}>
          X
        </a>
      ) : null}
    </div>
  );
};

export default Indicator;
