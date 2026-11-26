import { PageHeader } from '../../components/common/pageHeader/pageHeader'
import { SEO } from '../../components/common/seo/SEO'
import styles from './contactPage.module.css'

export function ContactPage() {
  const phoneNumber = '905412326452'
  const encodedMessage = encodeURIComponent('Merhaba, Cebeci İş Makineleri ile iletişime geçmek istiyorum.')
  const waLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

  return (
    <div>
      <SEO
        title="İletişim | Cebeci İş Makinaları Adana"
        description="Adana Seyhan Yeşiloba Sanayi Sitesi iş makinesi yedek parça mağazamızın adres ve telefon numaraları. WhatsApp'tan hızlıca fiyat ve stok bilgisi alın."
      />
      <PageHeader
        title="İletişim"
        breadcrumbs={[{ label: 'Anasayfa', href: '/' }, { label: 'İletişim' }]}
      />

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.infoSection}>
            <h2>Bizimle İletişime Geçin</h2>

            <div className={styles.infoItem}>
              <h3>📍 Adres</h3>
              <p>
                <a
                  href="https://maps.app.goo.gl/BgADofXqW6oNsWj88"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Yeşiloba, 46117. Sk. Metal Sanayi Sitesi NO:53 D:5. BLOK, 01100 Seyhan/Adana
                </a>
              </p>
            </div>

            <div className={styles.infoItem}>
              <h3>📞 Telefon</h3>
              <p>
                <a href="tel:+903224281122">0 322 428 11 22</a>
                <br />
                <a href="tel:+905412326452">0 541 232 64 52</a>
              </p>
            </div>

            <div className={styles.infoItem}>
              <h3>✉️ E-posta</h3>
              <p>
                <a href="mailto:info@cebeciismakinalari.com">info@cebeciismakinalari.com</a>
                <br />
                <a href="mailto:cebeciahmetfb@hotmail.com">cebeciahmetfb@hotmail.com</a>
              </p>
            </div>

            <div className={styles.infoItem}>
              <h3>🕒 Çalışma Saatleri</h3>
              <p>
                Pazartesi: Cuma: 07:30 – 18:30
                <br />
                Cumartesi: 08:00 – 15:30
                <br />
                Pazar: Kapalı
              </p>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              WhatsApp&apos;tan Yaz
            </a>
          </div>

          <div className={styles.mapSection}>
            <iframe
              title="Cebeci İş Makineleri Konum"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3187.1276926700248!2d35.2519963!3d36.9828851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1528873a73973735%3A0x428afc3ea45fcc00!2zQ0VCRUPEsCDEsMWfIE1ha2luYWxhcsSx!5e0!3m2!1str!2str!4v1794950144815!5m2!1str!2str"
              className={styles.map}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}
