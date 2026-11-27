# aboutbuzz.com — spletna stran (frontend)

Statična spletna stran (HTML + CSS + malo JS), ki jo urejaš prek Claude.
Prodaja, plačila, uporabniški računi in podatki ostanejo v WordPressu.

## Struktura

| Datoteka | Kaj je |
|---|---|
| `index.html` | Domača stran (`/`) |
| `pricing/index.html` | Cenik (`/pricing/`), gumbi vodijo v WooCommerce checkout |
| `howitworks/index.html` | Kako deluje (`/howitworks/`) |
| `about/index.html` | O nas + kontaktni obrazec → Gravity Forms (`/about/`) |
| `video-reviews/index.html` | Video ocene iz WordPressa (`/video-reviews/`) |
| `assets/js/consent.js` | Obvestilo o piškotkih, GA4 in Meta Pixel po soglasju |
| `wordpress/abz-public-stories.php` | WPCode odrezek: javni seznam odobrenih video ocen |
| `cloudflare/worker.js` | Usmerjanje aboutbuzz.com (nova stran / WordPress) |
| `PREKLOP.md` | Kontrolni seznam za preklop domene |
| `assets/css/style.css` | Barve, pisave, vsi slogi |
| `assets/js/config.js` | **Edino mesto s povezavami na WordPress** |
| `assets/js/site.js` | Meni, obrazec, filtri video ocen |
| `assets/data/reviews.json` | Vzorčne video ocene (rezerva) |

## Delitev odgovornosti

```
aboutbuzz.com  (ta stran, statični hosting)      app.aboutbuzz.com  (WordPress + Bricks)
  - vsebina, besedila, oblika             --->     - WooCommerce: košarica, checkout, Stripe/PayPal
  - gumbi "Get started", "Log in"         --->     - računi strank, nadzorna plošča
  - kontaktni obrazec  (POST JSON)        --->     - shranjevanje povpraševanj, GDPR
  - seznam video ocen  (GET JSON)         <---     - video ocene (CPT) prek REST API
```

Na frontendu ni gesel, ključev API, plačil ali osebnih podatkov.
