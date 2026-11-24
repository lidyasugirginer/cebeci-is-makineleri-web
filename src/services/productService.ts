import { products as staticProducts } from '../data/products'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Product } from '../types/products'

interface DbProductRow {
  id: string
  name: string
  slug: string
  brand: string | null
  category: string
  short_description: string | null
  image: string
  featured: boolean | null
  image_scale: number | null
  image_position: string | null
  sort_order: number | null
  created_at?: string
}

export interface ProductInput {
  name: string
  brand?: string
  category: string
  shortDescription?: string
  image: string
}

let cachedProducts: Product[] | null = null

export function generateSlug(value: string): string {
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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapRowToProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand ?? undefined,
    category: row.category,
    shortDescription: row.short_description ?? undefined,
    image: row.image,
    featured: Boolean(row.featured),
    imageScale: row.image_scale ?? undefined,
    imagePosition: row.image_position ?? undefined,
  }
}

export function getCachedProducts(): Product[] | null {
  return cachedProducts
}

export function invalidateProductsCache(): void {
  cachedProducts = null
}

export async function fetchProducts(forceRefresh = false): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    return staticProducts
  }

  if (!forceRefresh && cachedProducts) {
    return cachedProducts
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Ürünler yüklenirken hata oluştu:', error)
    return cachedProducts ?? staticProducts
  }

  const rows = (data ?? []) as DbProductRow[]
  if (rows.length === 0) {
    // Veritabanı henüz boşsa mevcut statik ürünleri göster
    return staticProducts
  }

  const mapped = rows.map(mapRowToProduct)
  cachedProducts = mapped
  return mapped
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (!supabase) {
    throw new Error('Supabase bağlantısı henüz yapılmamış.')
  }

  const baseSlug = generateSlug(input.name) || 'urun'
  const uniqueSuffix = Date.now().toString(36).slice(-4)
  const slug = `${baseSlug}-${uniqueSuffix}`
  const id = slug

  const payload = {
    id,
    name: input.name.trim(),
    slug,
    brand: input.brand?.trim() || null,
    category: input.category.trim(),
    short_description: input.shortDescription?.trim() || null,
    image: input.image.trim(),
    featured: false,
    sort_order: 0,
  }

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Ürün eklenemedi: ${error.message}`)
  }

  invalidateProductsCache()
  return mapRowToProduct(data as DbProductRow)
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  if (!supabase) {
    throw new Error('Supabase bağlantısı henüz yapılmamış.')
  }

  const payload = {
    name: input.name.trim(),
    brand: input.brand?.trim() || null,
    category: input.category.trim(),
    short_description: input.shortDescription?.trim() || null,
    image: input.image.trim(),
  }

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`Ürün güncellenemedi: ${error.message}`)
  }

  invalidateProductsCache()
  return mapRowToProduct(data as DbProductRow)
}

export async function deleteProduct(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase bağlantısı henüz yapılmamış.')
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Ürün silinemedi: ${error.message}`)
  }

  invalidateProductsCache()
}
