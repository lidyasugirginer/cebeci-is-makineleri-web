import { useCallback, useEffect, useState } from 'react'
import { products as staticProducts } from '../data/products'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchProducts, getCachedProducts } from '../services/productService'
import type { Product } from '../types/products'

interface UseProductsResult {
  products: Product[]
  loading: boolean
  reload: () => Promise<void>
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>(() => {
    if (!isSupabaseConfigured) {
      return staticProducts
    }
    return getCachedProducts() ?? staticProducts
  })
  const [loading, setLoading] = useState<boolean>(
    () => isSupabaseConfigured && !getCachedProducts(),
  )

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts(staticProducts)
      setLoading(false)
      return
    }
    setLoading(true)
    const fresh = await fetchProducts(true)
    setProducts(fresh)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelled = false
    fetchProducts().then((data) => {
      if (!cancelled) {
        setProducts(data)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading, reload }
}
