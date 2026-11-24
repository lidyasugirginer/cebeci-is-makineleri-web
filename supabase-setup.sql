-- Cebeci İş Makinaları - Supabase Veritabanı Kurulumu ve Mevcut Ürün Aktarımı
-- Bu dosyanın tamamını Supabase panelinizde "SQL Editor" -> "New query" içine yapıştırıp "Run" butonuna basın.

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT,
  category TEXT NOT NULL,
  short_description TEXT,
  image TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_scale DOUBLE PRECISION,
  image_position TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (Güvenlik Kuralları)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Herkes ürünleri görüntüleyebilir" ON public.products;
CREATE POLICY "Herkes ürünleri görüntüleyebilir"
  ON public.products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Sadece yetkili admin ürün ekleyebilir" ON public.products;
CREATE POLICY "Sadece yetkili admin ürün ekleyebilir"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sadece yetkili admin ürün güncelleyebilir" ON public.products;
CREATE POLICY "Sadece yetkili admin ürün güncelleyebilir"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sadece yetkili admin ürün silebilir" ON public.products;
CREATE POLICY "Sadece yetkili admin ürün silebilir"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- Mevcut 43 Ürünü Veritabanına Aktar (Tekrar çalıştırılırsa hata vermez)
INSERT INTO public.products (id, name, slug, brand, category, short_description, image, featured, image_scale, image_position, sort_order)
VALUES
  ('1', 'Motor Bloğu', 'motor-blogu', NULL, 'Motor Parçaları', 'CAT, Komatsu ve diğer iş makineleri için yüksek kaliteli motor blokları.', '/images/products/motor-blogu.png', true, 1.32, 'center', 1),
  ('2', 'Piston • Gömlek • Segman', 'piston-gomlek-segman', NULL, 'Motor Parçaları', 'Motor revizyonlarında kullanılan piston, gömlek ve segman setleri.', '/images/products/piston-gomlek-segman.png', true, 1.3, 'center', 2),
  ('3', 'Filtre Sistemleri', 'filtre-sistemleri', NULL, 'Filtre Sistemleri', 'Yağ, hava ve yakıt filtreleri ile motorunuzu güvenle koruyun.', '/images/products/cat-filtreleri.png', true, 1.12, 'center', 3),
  ('4', 'Egzoz Manifoldu', 'egzoz-manifoldu', NULL, 'Motor Parçaları', 'Dayanıklı döküm egzoz manifoldları ve motor yedek parçaları.', '/images/products/egzoz-manifoldu.png', true, 1.42, 'center', 4),
  ('cat-piston-kit-339-8176', 'Piston Kit Çeşitleri (339-8176)', 'cat-piston-kit-339-8176', 'CAT', 'Piston-Gömlek-Segman', NULL, '/images/products/ctp-piston-parcalari-kutu.jpg', false, NULL, NULL, 5),
  ('cat-piston-cesitleri', 'Piston Çeşitleri', 'cat-piston-cesitleri', 'CAT', 'Piston-Gömlek-Segman', NULL, '/images/products/tek-piston-render.jpg', false, NULL, NULL, 6),
  ('cummins-gomlek-cesitleri', 'Gömlek Çeşitleri', 'cummins-gomlek-cesitleri', 'Cummins', 'Piston-Gömlek-Segman', NULL, '/images/products/cummins-gomlek.jpg', false, NULL, NULL, 7),
  ('cummins-piston-kit-4bt-6bt', 'Piston Kit Çeşitleri (4BT / 6BT)', 'cummins-piston-kit-4bt-6bt', 'Cummins', 'Piston-Gömlek-Segman', NULL, '/images/products/cummins-piston-kit4BT-6BT.jpg', false, NULL, NULL, 8),
  ('cummins-piston-gomlek', 'Piston ve Gömlek Çeşitleri', 'cummins-piston-gomlek', 'Cummins', 'Piston-Gömlek-Segman', NULL, '/images/products/piston-gomlek-segman-kiti.jpg', false, NULL, NULL, 9),
  ('cummins-silindir-gomlek', 'Motor Silindir Gömlek', 'cummins-silindir-gomlek', 'Cummins', 'Piston-Gömlek-Segman', NULL, '/images/products/cummins-silindir-gomlek.jpg', false, NULL, NULL, 10),
  ('cummins-piston-set', 'Piston Set', 'cummins-piston-set', 'Cummins', 'Piston-Gömlek-Segman', NULL, '/images/products/cummins-piston-set.jpg', false, NULL, NULL, 11),
  ('isuzu-gomlek-set-4hk1-6hk1', 'Gömlek Set (4HK1 / 6HK1)', 'isuzu-gomlek-set-4hk1-6hk1', 'Isuzu', 'Piston-Gömlek-Segman', NULL, '/images/products/isuzu-gomlek-set.png', false, NULL, NULL, 12),
  ('cat-3304-mazot-pompasi', '3304 Motor Mazot Pompası', 'cat-3304-mazot-pompasi', 'CAT', 'Pompa-Devirdaim', NULL, '/images/products/su-pompasi-water-pump.jpg', false, NULL, NULL, 13),
  ('cat-pompa-devirdaim', 'Pompa - Devirdaim Çeşitleri', 'cat-pompa-devirdaim', 'CAT', 'Pompa-Devirdaim', NULL, '/images/products/cat-pompa-devirdaim-cesitleri.png', false, NULL, NULL, 14),
  ('cat-motor-yag-pompalari', 'Motor Yağ Pompaları', 'cat-motor-yag-pompalari', 'CAT', 'Pompa-Devirdaim', NULL, '/images/products/cat-motor-yag-pompalari.png', false, NULL, NULL, 15),
  ('jcb-devirdaim', 'Devirdaim', 'jcb-devirdaim', 'JCB', 'Pompa-Devirdaim', NULL, '/images/products/jcb-devirdaim.png', false, NULL, NULL, 16),
  ('mazot-otomatigi', 'Mazot Otomatiği', 'mazot-otomatigi', 'Çeşitli', 'Pompa-Devirdaim', NULL, '/images/products/mazot-otomatigi.png', false, NULL, NULL, 17),
  ('cat-emme-egzoz-subap', 'Emme ve Egzoz Supap', 'cat-emme-egzoz-subap', 'CAT', 'Supap', NULL, '/images/products/cat-emme-subab-ve-egzoz-subab.png', false, NULL, NULL, 18),
  ('cummins-kol-ana-yatak', 'Kol ve Ana Yatak', 'cummins-kol-ana-yatak', 'Cummins', 'Ana-Kol-Yatak', NULL, '/images/products/komple-motor-revizyon-kiti.jpg', false, NULL, NULL, 19),
  ('isuzu-eksantrik-metal-6hk1-4hk1', 'Eksantrik Metal (6HK1 / 4HK1)', 'isuzu-eksantrik-metal-6hk1-4hk1', 'Isuzu', 'Ana-Kol-Yatak', NULL, '/images/products/isuzu-eksantrik-metal.png', false, NULL, NULL, 20),
  ('cat-takim-conta', 'Takım Conta', 'cat-takim-conta', 'CAT', 'Takim-Conta', NULL, '/images/products/silindir-gomlek-piston-conta-seti.jpg', false, NULL, NULL, 21),
  ('cat-yag-sogutucu-sanziman', 'Yağ Soğutucu - Şanzıman Soğutucu', 'cat-yag-sogutucu-sanziman', 'CAT', 'Yag-Sogutucu', NULL, '/images/products/cat-175-7453-oil-cooler.jpg', false, NULL, NULL, 22),
  ('cat-orj-filtreler-1r0716-1r1808', 'Orijinal Filtreler (1R 0716 / 1R 1808)', 'cat-orj-filtreler-1r0716-1r1808', 'CAT', 'Filtre', NULL, '/images/products/cat-yakit-filtreleri-seti.jpg', false, NULL, NULL, 23),
  ('cat-orijinal-filtreler', 'Orijinal Filtreler', 'cat-orijinal-filtreler', 'CAT', 'Filtre', NULL, '/images/products/cat-yag-ve-yakit-filtreleri.jpg', false, NULL, NULL, 24),
  ('cat-seal-kit-cesitleri', 'Seal Kit Çeşitleri', 'cat-seal-kit-cesitleri', 'CAT', 'Seal-Kit', NULL, '/images/products/cat-orijinal-o-ring-seti.jpg', false, NULL, NULL, 25),
  ('cat-orijinal-kayis', 'Orijinal Kayış Çeşitleri', 'cat-orijinal-kayis', 'CAT', 'Kayis-Zincir', NULL, '/images/products/cat-orijinal-kayis-cesitleri.png', false, NULL, NULL, 26),
  ('cat-tahrik-zincir-562-8112', 'Orijinal Tahrik Zincir Çeşitleri (562-8112)', 'cat-tahrik-zincir-562-8112', 'CAT', 'Kayis-Zincir', NULL, '/images/products/cat-orijinal-tahrik-zincir-cesitleri.png', false, NULL, NULL, 27),
  ('cat-tahrik-zincir-562-8115', 'Orijinal Tahrik Zincir Çeşitleri (562-8115)', 'cat-tahrik-zincir-562-8115', 'CAT', 'Kayis-Zincir', NULL, '/images/products/cat-orijinal-tahrik-zincir-cesitleri.png', false, NULL, NULL, 28),
  ('cat-saft-pinyon-disli', 'Şaft, Pinyon, Dişli Çeşitleri', 'cat-saft-pinyon-disli', 'CAT', 'Pinyon-Disli-Saft', NULL, '/images/products/volan-flywheel.jpg', false, NULL, NULL, 29),
  ('komatsu-perno-mili', 'Perno Mili', 'komatsu-perno-mili', 'Komatsu', 'Pinyon-Disli-Saft', NULL, '/images/products/komatsu-perno-milipng.png', false, NULL, NULL, 30),
  ('cat-greyder-kece-cesitleri', 'Greyder Keçe Çeşitleri', 'cat-greyder-kece-cesitleri', 'CAT', 'Kece-Asinma', NULL, '/images/products/cat-greyder-kece-cesitleri.png', false, NULL, NULL, 31),
  ('cat-daire-asinma-seridi', 'Daire Aşınma Şeridi', 'cat-daire-asinma-seridi', 'CAT', 'Kece-Asinma', NULL, '/images/products/cat-daire-asinma-seridi.png', false, NULL, NULL, 32),
  ('cat-greyder-ring-wear', 'Greyder Ring-Wear (Aşınma Halkası)', 'cat-greyder-ring-wear', 'CAT', 'Kece-Asinma', NULL, '/images/products/cat-greyder-ring-wear-asinma-halkasi.png', false, NULL, NULL, 33),
  ('cat-gosterge-yag-hararet-yakit', 'Motor Yağ / Hararet / Yakıt Göstergesi', 'cat-gosterge-yag-hararet-yakit', 'CAT', 'Gosterge', NULL, '/images/products/cat-motor-yag-gostergesi-hararet-gostergesi-yakit-gostergesi.png', false, NULL, NULL, 34),
  ('komatsu-civata-m26x200', 'Civata (M26x200)', 'komatsu-civata-m26x200', 'Komatsu', 'Civata', NULL, '/images/products/komatsu-civata-m26x200.png', false, NULL, NULL, 35),
  ('komatsu-civata-m30x200', 'Civata (M30x200)', 'komatsu-civata-m30x200', 'Komatsu', 'Civata', NULL, '/images/products/komatsu-civata-m30x200.png', false, NULL, NULL, 36),
  ('komatsu-civata-m30x215', 'Civata (M30x215)', 'komatsu-civata-m30x215', 'Komatsu', 'Civata', NULL, '/images/products/komatsu-civata-m30x215.png', false, NULL, NULL, 37),
  ('komatsu-civata-m30x220', 'Civata (M30x220)', 'komatsu-civata-m30x220', 'Komatsu', 'Civata', NULL, '/images/products/komatsu-civatasi-m30x220.png', false, NULL, NULL, 38),
  ('komatsu-muhtelif-sifir-lift', 'Muhtelif Sıfır Lift Çeşitleri', 'komatsu-muhtelif-sifir-lift', 'Komatsu', 'Civata', NULL, '/images/products/cat-yedek-parca-koleksiyonu.jpg', false, NULL, NULL, 39),
  ('cat-3304-motor-blok', '3304 Motor Blok', 'cat-3304-motor-blok', 'CAT', 'Ekipman-Motor', NULL, '/images/products/6-silindirli-motor-blogu.jpg', false, NULL, NULL, 40),
  ('cat-3306-motor', '3306 Motor', 'cat-3306-motor', 'CAT', 'Ekipman-Motor', NULL, '/images/products/cat-3306-motor.png', false, NULL, NULL, 41),
  ('cat-966h-loder', '966H Loder (Yükleyici)', 'cat-966h-loder', 'CAT', 'Ekipman-Motor', NULL, '/images/products/cat-loder-yukleyici-966h.png', false, NULL, NULL, 42),
  ('cat-d7g-sase-komple', 'D7G Şase Komple (4 Adet)', 'cat-d7g-sase-komple', 'CAT', 'Ekipman-Motor', NULL, '/images/products/cat-d7g-sase-komple-4adet.png', false, NULL, NULL, 43)
ON CONFLICT (id) DO NOTHING;
