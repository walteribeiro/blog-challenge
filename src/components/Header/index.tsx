import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <img src="/images/logo.svg" alt="logo" width="239" height="27" />
        </Link>
      </div>
    </header>
  );
}
