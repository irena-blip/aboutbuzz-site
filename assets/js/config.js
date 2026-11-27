/*
 * aboutbuzz.com — POVEZAVE Z WORDPRESSOM
 * ------------------------------------------------------------------
 * To je EDINA datoteka, kjer so naslovi do WordPressa (prodaja, plačila,
 * uporabniški računi, podatki). Spletna stran sama ne hrani nobenih
 * osebnih podatkov ali plačil – vse gre neposredno v WordPress.
 *
 * Vsak gumb na strani ima atribut data-link="ime". Skripta site.js
 * zamenja njegov href z naslovom spodaj. Če je vrednost prazna, ostane
 * privzeti href, zapisan v HTML.
 */
window.ABOUTBUZZ = {
  // Kje teče WordPress (WooCommerce, računi, nadzorna plošča strank).
  // Ko se frontend preseli na aboutbuzz.com, WordPress prestavimo npr. na app.aboutbuzz.com.
  wordpress: 'https://app.aboutbuzz.com',

  links: {
    // Registracija / brezplačni paket (4 videi)
    freeSignup:     'https://upload.aboutbuzz.com',
    // Nakup paketov – WooCommerce: /checkout/?add-to-cart=<ID izdelka>
    planDisplay:    'https://upload.aboutbuzz.com',   // Display & Trust 29 €/mesec
    planGrowth:     'https://upload.aboutbuzz.com',   // Growth 149 €/mesec
    // Prijava v nadzorno ploščo stranke
    login:          'https://upload.aboutbuzz.com',
    // Prijava testerjev
    becomeTester:   'https://upload.aboutbuzz.com'
  },

  // Kontaktni obrazec: POST JSON {name, company, email, message} na WordPress.
  // Prazno = obrazec odpre e-poštni program z izpolnjenim sporočilom.
  contactEndpoint: '',
  contactEmail: 'info@aboutbuzz.com',

  // Video ocene: GET JSON seznam ocen iz WordPressa (REST API).
  // Prazno = uporabijo se vzorčne ocene iz assets/data/reviews.json.
  reviewsEndpoint: ''
};
