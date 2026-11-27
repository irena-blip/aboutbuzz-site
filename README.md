# aboutbuzz.com — spletna stran (frontend)

Statična spletna stran (HTML + CSS + malo JS), ki jo urejaš prek Claude.
Prodaja, plačila, uporabniški računi in podatki ostanejo v WordPressu.

## Struktura

| Datoteka | Kaj je |
|---|---|
| `index.html` | Domača stran |
| `pricing.html` | Cenik (gumbi vodijo na WordPress/WooCommerce checkout) |
| `how-it-works.html` | Kako deluje |
| `about.html` | O nas + kontaktni obrazec (pošlje v WordPress) |
| `video-reviews.html` | Video ocene (bere iz WordPress REST API ali `assets/data/reviews.json`) |
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
