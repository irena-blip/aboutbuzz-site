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
  wordpress: 'https://aboutbuzz.com',

  links: {
    // Brezplačni paket (WooCommerce izdelek "Free plan", ID 4438) – doda v košarico in odpre checkout
    freeSignup:     'https://aboutbuzz.com/?add-to-cart=4438',
    // Naročnine (Subscriptions for WooCommerce)
    planDisplay:    'https://aboutbuzz.com/?add-to-cart=7349',   // Display & Trust 29 €/mesec
    planGrowth:     'https://aboutbuzz.com/?add-to-cart=7339',   // Growth 149 €/mesec
    // Prijava v nadzorno ploščo stranke (WordPress / WooCommerce)
    login:          'https://aboutbuzz.com/my-account/',
    // Prijava testerjev (aplikacija Lovable)
    becomeTester:   'https://upload.aboutbuzz.com'
  },

  // Kontaktni obrazec → Gravity Forms (obrazec ID 3 na aboutbuzz.com/get-in-touch/).
  // Pošiljanje je javno (brez ključev API); vnosi se shranijo v WordPress → Forms → Entries.
  // Pogoj: v WordPressu Forms → Settings → REST API → "Enable access to the API".
  contactEndpoint: 'https://aboutbuzz.com/wp-json/gf/v2/forms/3/submissions',
  // Katero polje v Gravity Forms ustreza kateremu polju na strani
  contactFields: { name: 'input_4', company: 'input_8', email: 'input_1', message: 'input_6' },
  contactEmail: 'info@aboutbuzz.com',

  // Video ocene: GET JSON seznam ocen iz WordPressa (REST API).
  // Prazno = uporabijo se vzorčne ocene iz assets/data/reviews.json.
  // Vir: WPCode odrezek wordpress/abz-public-stories.php
  reviewsEndpoint: 'https://aboutbuzz.com/wp-json/aboutbuzz-public/v1/stories?per_page=100'
};
