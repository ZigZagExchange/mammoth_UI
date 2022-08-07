import Image from 'next/image';

import styles from '../styles/Header.module.css';
const Header = () => {
  return (
    <div className={styles.header}>
      <Image
        src="/mammoth.svg"
        width="50"
        height="50"
        alt="mammoth pool logo"
      />
    </div>
  );
};

export default Header;
