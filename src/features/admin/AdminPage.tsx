import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../../components/common/seo/SEO'
import { categoryLabels } from '../../data/products'
import { useProducts } from '../../hooks/useProducts'
import { isCloudinaryConfigured, uploadProductImage } from '../../lib/cloudinary'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { createProduct, deleteProduct, updateProduct } from '../../services/productService'
import type { Product } from '../../types/products'
import styles from './adminPage.module.css'

const CUSTOM_OPTION = '__custom__'

const DEFAULT_BRANDS = ['CAT', 'Komatsu', 'Cummins', 'Isuzu', 'JCB', 'Çeşitli']

export function AdminPage() {
  const { products, loading: productsLoading, reload } = useProducts()

  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState<boolean>(isSupabaseConfigured)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  // Product form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categoryLabels)[2] || 'Piston-Gömlek-Segman')
  const [customCategory, setCustomCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('CAT')
  const [customBrand, setCustomBrand] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [submitBusy, setSubmitBusy] = useState(false)
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // List filter state
  const [listSearch, setListSearch] = useState('')
  const [listCategory, setListCategory] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSessionEmail(data.session?.user?.email ?? null)
        setAuthChecking(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const categoryOptions = useMemo(() => {
    const keys = new Set<string>(Object.keys(categoryLabels))
    products.forEach((p) => {
      if (p.category) keys.add(p.category)
    })
    return Array.from(keys)
  }, [products])

  const brandOptions = useMemo(() => {
    const brands = new Set<string>(DEFAULT_BRANDS)
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand)
    })
    return Array.from(brands).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = listSearch.trim().toLocaleLowerCase('tr-TR')
    return products.filter((p) => {
      if (listCategory && p.category !== listCategory) return false
      if (!q) return true
      const catLabel = (categoryLabels[p.category] || p.category).toLocaleLowerCase('tr-TR')
      return (
        p.name.toLocaleLowerCase('tr-TR').includes(q) ||
        (p.brand ?? '').toLocaleLowerCase('tr-TR').includes(q) ||
        catLabel.includes(q)
      )
    })
  }, [products, listSearch, listCategory])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setLoginError('')
    setLoginBusy(true)

    const rawIdentifier = loginEmail.trim().toLowerCase()
    const resolvedEmail = rawIdentifier.includes('@')
      ? rawIdentifier
      : `${rawIdentifier}@cebeciismakinalari.com`

    const { error } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password: loginPassword,
    })

    setLoginBusy(false)

    if (error) {
      setLoginError('Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.')
    }
  }

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const resetForm = () => {
    setEditingProductId(null)
    setName('')
    setSelectedCategory(categoryOptions[0] || 'Piston-Gömlek-Segman')
    setCustomCategory('')
    setSelectedBrand('CAT')
    setCustomBrand('')
    setShortDescription('')
    setExistingImageUrl('')
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setFormStatus(null)
  }

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id)
    setName(product.name)

    if (categoryOptions.includes(product.category)) {
      setSelectedCategory(product.category)
      setCustomCategory('')
    } else {
      setSelectedCategory(CUSTOM_OPTION)
      setCustomCategory(product.category)
    }

    if (product.brand && brandOptions.includes(product.brand)) {
      setSelectedBrand(product.brand)
      setCustomBrand('')
    } else if (product.brand) {
      setSelectedBrand(CUSTOM_OPTION)
      setCustomBrand(product.brand)
    } else {
      setSelectedBrand(brandOptions[0] || 'CAT')
      setCustomBrand('')
    }

    setShortDescription(product.shortDescription ?? '')
    setExistingImageUrl(product.image)
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setFormStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormStatus(null)

    const finalName = name.trim()
    const finalCategory =
      selectedCategory === CUSTOM_OPTION ? customCategory.trim() : selectedCategory
    const finalBrand =
      selectedBrand === CUSTOM_OPTION ? customBrand.trim() : selectedBrand

    if (!finalName) {
      setFormStatus({ type: 'error', text: 'Lütfen ürün adını yazın.' })
      return
    }
    if (!finalCategory) {
      setFormStatus({ type: 'error', text: 'Lütfen bir kategori seçin veya yazın.' })
      return
    }
    if (!finalBrand) {
      setFormStatus({ type: 'error', text: 'Lütfen marka belirtin.' })
      return
    }
    if (!selectedFile && !existingImageUrl) {
      setFormStatus({ type: 'error', text: 'Lütfen bir ürün fotoğrafı seçin.' })
      return
    }

    try {
      setSubmitBusy(true)
      let imageUrl = existingImageUrl

      if (selectedFile) {
        imageUrl = await uploadProductImage(selectedFile)
      }

      if (editingProductId) {
        await updateProduct(editingProductId, {
          name: finalName,
          category: finalCategory,
          brand: finalBrand,
          shortDescription,
          image: imageUrl,
        })
        setFormStatus({ type: 'success', text: 'Ürün başarıyla güncellendi!' })
      } else {
        await createProduct({
          name: finalName,
          category: finalCategory,
          brand: finalBrand,
          shortDescription,
          image: imageUrl,
        })
        setFormStatus({ type: 'success', text: 'Yeni ürün kataloğa başarıyla eklendi!' })
      }

      resetForm()
      await reload()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'İşlem sırasında bir hata oluştu.'
      setFormStatus({ type: 'error', text: msg })
    } finally {
      setSubmitBusy(false)
    }
  }

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `"${product.name}" ürününü silmek istediğinize emin misiniz?`,
    )
    if (!confirmed) return

    try {
      setDeletingId(product.id)
      await deleteProduct(product.id)
      if (editingProductId === product.id) {
        resetForm()
      }
      await reload()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ürün silinemedi.'
      setFormStatus({ type: 'error', text: msg })
    } finally {
      setDeletingId(null)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className={styles.pageWrapper}>
        <SEO title="Yönetim Paneli | Cebeci İş Makinaları" />
        <div className={styles.loginCard}>
          <h1>Yönetim Paneli Kurulumu Bekleniyor</h1>
          <p className={styles.helperText}>
            Admin panelinin çalışması için Supabase ve Cloudinary bağlantı bilgilerinin
            <code>.env</code> dosyasına (ve Vercel ortam değişkenlerine) eklenmesi gerekiyor.
          </p>
          <ul className={styles.setupChecklist}>
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
            <li>VITE_CLOUDINARY_CLOUD_NAME</li>
            <li>VITE_CLOUDINARY_UPLOAD_PRESET</li>
          </ul>
          <Link to="/" className={styles.backHomeLink}>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  if (authChecking) {
    return (
      <div className={styles.pageWrapper}>
        <SEO title="Yönetim Paneli | Cebeci İş Makinaları" />
        <div className={styles.loginCard}>
          <p className={styles.helperText}>Oturum kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (!sessionEmail) {
    return (
      <div className={styles.pageWrapper}>
        <SEO title="Admin Girişi | Cebeci İş Makinaları" />
        <div className={styles.loginCard}>
          <span className={styles.badge}>Yönetim Paneli</span>
          <h1>Ürün Yönetimi Girişi</h1>
          <p className={styles.helperText}>
            Yeni ürün eklemek veya mevcut ürünleri düzenlemek için giriş yapın.
          </p>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="admin-email">Kullanıcı Adı</label>
              <input
                id="admin-email"
                type="text"
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-password">Şifre</label>
              <input
                id="admin-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && <div className={styles.errorAlert}>{loginError}</div>}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loginBusy}
            >
              {loginBusy ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <Link to="/" className={styles.backHomeLink}>
            ← Siteye Dön
          </Link>
        </div>
      </div>
    )
  }

  const activePreview = previewUrl || existingImageUrl

  return (
    <div className={styles.dashboardWrapper}>
      <SEO title="Ürün Yönetim Paneli | Cebeci İş Makinaları" />

      <div className={styles.topBar}>
        <div>
          <span className={styles.badge}>Admin Paneli</span>
          <h1>Ürün Yönetim Merkezi</h1>
        </div>
        <div className={styles.topBarActions}>
          <span className={styles.userEmail}>
            {sessionEmail.replace('@cebeciismakinalari.com', '')}
          </span>
          <Link to="/urun-gruplari" className={styles.secondaryButton}>
            Kataloğu Gör
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {!isCloudinaryConfigured && (
        <div className={styles.warningBanner}>
          Uyarı: Cloudinary ayarları henüz eksik. Fotoğraf yükleyebilmek için
          <code> VITE_CLOUDINARY_CLOUD_NAME </code> ve
          <code> VITE_CLOUDINARY_UPLOAD_PRESET </code> eklenmelidir.
        </div>
      )}

      <div className={styles.grid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h2>{editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
            {editingProductId && (
              <button
                type="button"
                onClick={resetForm}
                className={styles.cancelEditButton}
              >
                İptal Et
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="product-name">Ürün Adı *</label>
              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: CAT 320D Yakıt Filtresi"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="product-category">Kategori *</label>
              <select
                id="product-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
                <option value={CUSTOM_OPTION}>+ Yeni Kategori Yaz...</option>
              </select>

              {selectedCategory === CUSTOM_OPTION && (
                <input
                  type="text"
                  className={styles.subInput}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Yeni kategori adını yazın"
                  required
                />
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="product-brand">Marka *</label>
              <select
                id="product-brand"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value={CUSTOM_OPTION}>+ Farklı Marka Yaz...</option>
              </select>

              {selectedBrand === CUSTOM_OPTION && (
                <input
                  type="text"
                  className={styles.subInput}
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Örn: Volvo, Hitachi, Perkins"
                  required
                />
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="product-description">
                Açıklama <span className={styles.optionalTag}>(İsteğe Bağlı)</span>
              </label>
              <textarea
                id="product-description"
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Uyumlu modeller, parça numarası veya kısa bilgi ekleyebilirsiniz..."
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="product-image">
                Ürün Fotoğrafı *{' '}
                <span className={styles.optionalTag}>(JPG, PNG, WEBP, HEIC vb.)</span>
              </label>
              <input
                id="product-image"
                type="file"
                accept="image/*,.heic,.heif,.webp,.png,.jpg,.jpeg,.avif,.bmp"
                onChange={handleFileChange}
                className={styles.fileInput}
              />

              {activePreview && (
                <div className={styles.previewBox}>
                  <img src={activePreview} alt="Ürün önizleme" />
                  <span>{selectedFile ? selectedFile.name : 'Mevcut görsel'}</span>
                </div>
              )}
            </div>

            {formStatus && (
              <div
                className={
                  formStatus.type === 'success'
                    ? styles.successAlert
                    : styles.errorAlert
                }
              >
                {formStatus.text}
              </div>
            )}

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={submitBusy}
            >
              {submitBusy
                ? 'Kaydediliyor...'
                : editingProductId
                  ? 'Değişiklikleri Kaydet'
                  : 'Ürünü Ekle'}
            </button>
          </form>
        </section>

        <section className={styles.listCard}>
          <div className={styles.listHeader}>
            <h2>Mevcut Ürünler ({filteredProducts.length})</h2>
            <div className={styles.listFilters}>
              <input
                type="search"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Ürün veya marka ara..."
                className={styles.searchInput}
              />
              <select
                value={listCategory}
                onChange={(e) => setListCategory(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Tüm Kategoriler</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {productsLoading ? (
            <p className={styles.emptyText}>Ürünler yükleniyor...</p>
          ) : filteredProducts.length === 0 ? (
            <p className={styles.emptyText}>Aramanıza uygun ürün bulunamadı.</p>
          ) : (
            <div className={styles.productList}>
              {filteredProducts.map((product) => (
                <div key={product.id} className={styles.productRow}>
                  <div className={styles.thumb}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>⚙️</span>
                    )}
                  </div>

                  <div className={styles.rowInfo}>
                    <strong>{product.name}</strong>
                    <div className={styles.rowMeta}>
                      {product.brand && <span className={styles.brandBadge}>{product.brand}</span>}
                      <span>{categoryLabels[product.category] || product.category}</span>
                    </div>
                  </div>

                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(product)}
                      className={styles.editButton}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className={styles.deleteButton}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
