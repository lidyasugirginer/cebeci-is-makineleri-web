import { Container } from '../../../components/common/container/container'
import { ProductCard } from '../../products/productCard/productCard'
import { useProducts } from '../../../hooks/useProducts'
import styles from './featuredProducts.module.css'

export function FeaturedProducts() {
  const { products } = useProducts()
  const featuredProducts = products.filter(
    (product) => product.featured,
  )

  return (
    <section
      id="urunler"
      className={styles.featuredProducts}
    >
      <Container>
        <div className={styles.heading}>
          <h2>Öne Çıkan Ürünler</h2>
        </div>

        <div className={styles.productGrid}>
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}