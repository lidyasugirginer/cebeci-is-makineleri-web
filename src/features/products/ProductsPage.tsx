import { useSearchParams } from 'react-router-dom'
import { categoryLabels } from '../../data/products'
import { useProducts } from '../../hooks/useProducts'
import { PageHeader } from '../../components/common/pageHeader/pageHeader'
import { SEO } from '../../components/common/seo/SEO'
import styles from './productsPage.module.css'

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function ProductsPage() {
  const { products } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedCategory = searchParams.get('kategori')
  const selectedBrand = searchParams.get('marka')
  const searchQuery = (searchParams.get('q') ?? '').trim()
  const searchTokens = normalizeSearchText(searchQuery)
    .split(/\s+/)
    .filter(Boolean)

  const phoneNumber = '905412326452'

  // Benzersiz kategorileri ve markaları çıkar
  const categories = Array.from(new Set(products.map(p => p.category))).sort()
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[]
  brands.sort()

  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false
    if (selectedBrand && p.brand !== selectedBrand) return false

    if (searchTokens.length > 0) {
      const categoryLabel = categoryLabels[p.category] || p.category
      const searchable = normalizeSearchText(
        [p.name, p.brand ?? '', p.shortDescription ?? '', p.category, categoryLabel].join(' '),
      )
      if (!searchTokens.every(token => searchable.includes(token))) {
        return false
      }
    }

    return true
  })

  const updateFilterParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }
    setSearchParams(nextParams, { replace: true })
  }

  const setSelectedCategory = (cat: string | null) => updateFilterParam('kategori', cat)
  const setSelectedBrand = (brand: string | null) => updateFilterParam('marka', brand)
  const clearSearch = () => updateFilterParam('q', null)
  const clearAllFilters = () => setSearchParams({}, { replace: true })

  const hasActiveFilters = Boolean(selectedCategory || selectedBrand || searchQuery)

  const getWhatsAppLink = (productName: string) => {
    const encodedMessage = encodeURIComponent(`Merhaba, ${productName} hakkında bilgi almak istiyorum.`)
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  }

  return (
    <div>
      <SEO 
        title="Ürün Grupları | İş Makinesi Yedek Parçaları" 
        description="CAT piston kit çeşitleri, Cummins gömlek seti, Komatsu civata, eksantrik metal, conta takımı ve iş makinesi seal kit parçaları Adana'da stoktan teslim."
      />
      <PageHeader
        title="Yedek Parça Kataloğu"
        breadcrumbs={[{ label: 'Anasayfa', href: '/' }, { label: 'Ürünler' }]}
      />

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>Kategoriler</h3>
            <ul className={styles.filterList}>
              <li>
                <button 
                  className={`${styles.filterButton} ${selectedCategory === null ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  Tüm Kategoriler
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={`${styles.filterButton} ${selectedCategory === cat ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {categoryLabels[cat] || cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {brands.length > 0 && (
            <div className={styles.filterGroup}>
              <h3>Markalar</h3>
              <ul className={styles.filterList}>
                <li>
                  <button 
                    className={`${styles.filterButton} ${selectedBrand === null ? styles.active : ''}`}
                    onClick={() => setSelectedBrand(null)}
                  >
                    Tüm Markalar
                  </button>
                </li>
                {brands.map(brand => (
                  <li key={brand}>
                    <button 
                      className={`${styles.filterButton} ${selectedBrand === brand ? styles.active : ''}`}
                      onClick={() => setSelectedBrand(brand)}
                    >
                      {brand}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className={styles.content}>
          <div className={styles.resultsToolbar}>
            <span className={styles.resultsCount}>
              {searchQuery
                ? `"${searchQuery}" için ${filteredProducts.length} ürün bulundu`
                : `${filteredProducts.length} ürün listeleniyor`}
            </span>

            {hasActiveFilters && (
              <div className={styles.activeFilters}>
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.filterChip}
                    onClick={clearSearch}
                  >
                    Arama: {searchQuery} ×
                  </button>
                )}
                {selectedCategory && (
                  <button
                    type="button"
                    className={styles.filterChip}
                    onClick={() => setSelectedCategory(null)}
                  >
                    {categoryLabels[selectedCategory] || selectedCategory} ×
                  </button>
                )}
                {selectedBrand && (
                  <button
                    type="button"
                    className={styles.filterChip}
                    onClick={() => setSelectedBrand(null)}
                  >
                    {selectedBrand} ×
                  </button>
                )}
                <button
                  type="button"
                  className={styles.clearFiltersButton}
                  onClick={clearAllFilters}
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </div>

          <div className={styles.productsGrid}>
            {filteredProducts.map(product => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImage}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className={styles.placeholderImage}>⚙️</div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  {product.brand && <div className={styles.productBrand}>{product.brand}</div>}
                  <h3 className={styles.productName}>{product.name}</h3>
                  <div className={styles.productCategory}>{categoryLabels[product.category] || product.category}</div>
                  
                  <a 
                    href={getWhatsAppLink(product.name)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.whatsappButton}
                  >
                    WhatsApp'tan Sor
                  </a>
                </div>
              </div>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <p>Aramanıza veya seçilen filtrelere uygun ürün bulunamadı.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={clearAllFilters}
                >
                  Tüm Filtreleri Temizle
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
