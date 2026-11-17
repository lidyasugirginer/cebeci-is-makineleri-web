import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MobileMenu } from '../mobileMenu/mobileMenu'
import { Navigation } from '../navigation/navigation'
import styles from './header.module.css'

const PRODUCT_CATALOG_PATHS = ['/urun-gruplari', '/urunler']

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isProductsPage = PRODUCT_CATALOG_PATHS.includes(location.pathname)
  const urlQuery = new URLSearchParams(location.search).get('q') ?? ''
  const [draftState, setDraftState] = useState({
    path: location.pathname,
    value: '',
  })

  const searchTerm = isProductsPage
    ? urlQuery
    : draftState.path === location.pathname
      ? draftState.value
      : ''

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen
      ? 'hidden'
      : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const handleSearchChange = (value: string) => {
    if (isProductsPage) {
      const nextParams = new URLSearchParams(location.search)
      if (value) {
        nextParams.set('q', value)
      } else {
        nextParams.delete('q')
      }
      const nextSearch = nextParams.toString()
      navigate(
        nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname,
        { replace: true },
      )
      return
    }

    setDraftState({ path: location.pathname, value })
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    const targetPath = isProductsPage ? location.pathname : '/urun-gruplari'

    navigate(trimmed ? `${targetPath}?q=${encodeURIComponent(trimmed)}` : targetPath)
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.topBarContainer}>
            <div className={styles.topBarLeft}>
              <a href="tel:+903224281122">
                <span aria-hidden="true">☎</span>
                0 (322) 428 11 22
              </a>
              <a href="tel:+905412326452">
                <span aria-hidden="true">📱</span>
                0 (541) 232 64 52
              </a>

              <a href="mailto:cebeciahmetfb@hotmail.com">
                <span aria-hidden="true">✉</span>
                cebeciahmetfb@hotmail.com
              </a>
            </div>
          </div>
        </div>

        <div className={styles.mainHeader}>
          <div className={styles.mainHeaderContainer}>
            <a
              href="/"
              className={styles.logo}
              aria-label="Cebeci İş Makineleri ana sayfa"
            >
              <img
                src="/images/company/cebeci-logo.png"
                alt="Cebeci İş Makineleri"
              />
            </a>

            <div className={styles.desktopNavigation}>
              <Navigation />
            </div>

            <div className={styles.headerActions}>
              <a
                 href="/iletisim#teklif-formu"
                 className={styles.quoteButton}
              >
                Teklif Al
              </a>

              <button
                type="button"
                className={styles.menuButton}
                aria-label="Mobil menüyü aç"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.searchBar}>
          <div className={styles.searchBarContainer}>
            <form
              className={styles.searchForm}
              onSubmit={handleSearchSubmit}
            >
              <label
                htmlFor="header-product-search"
                className={styles.srOnly}
              >
                Ürün veya yedek parça ara
              </label>

              <input
                id="header-product-search"
                type="search"
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Ürün, marka veya yedek parça ara..."
              />

              <button type="submit">
                Ara
              </button>
            </form>

            <div className={styles.quickContact}>
              <span>Hızlı destek hattı</span>

              <a href="tel:+905412326452">
                0 (541) 232 64 52
              </a>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  )
}