# Preklop aboutbuzz.com na novo stran

Cilj: na **aboutbuzz.com** se marketinške strani strežejo iz nove strani (Cloudflare Pages),
vse ostalo ostane na WordPressu. WordPressa se pri tem **ne spreminja**.

| Pot | Streže |
|---|---|
| `/`, `/pricing/`, `/howitworks/`, `/about/`, `/video-reviews/`, `/eu-funding/`, `/assets/*` | nova stran (`aboutbuzz-site.pages.dev`) |
| vse ostalo (`/wp-json`, `/wp-content`, `/checkout`, `/cart`, `/my-account`, `/product`, `/brands`, `/get-in-touch`, `/wp-admin` …) | WordPress, kot zdaj |
| `/` z WordPress parametri (`?add-to-cart=`, `?s=`, `?p=` …), vse POST zahteve | WordPress |

Usmerja Worker `cloudflare/worker.js`. Teče samo na zgoraj naštetih poteh, zato pripomočka
pri strankah (WordPress/Shopify), povezave z Lovable in plačil sploh ne doseže.

---

## A. Pred dnevom preklopa (Irena)

- [ ] Številke na strani preverjene (»300+«, »+46 %«, »15 %«, »92 %«) ali popravljene
- [ ] Podstran /eu-funding/ izpolnjena (naziv, opis, cilji, rezultati, znesek EU / skupna vrednost)
- [ ] Vtičnik za piškotke na WordPressu (Complianz / Cookiebot) + integracija v PixelYourSite
- [ ] Testni nakup prek new.aboutbuzz.com: Free, Display & Trust, Growth (do konca, z registracijo)
- [ ] Kontaktni obrazec na new.aboutbuzz.com/about/#contact → vnos v Gravity Forms in e-mail
- [ ] Popravki podatkov v WordPressu (videi brez žiga, jeziki, znamke)

## B. Na dan preklopa (Nejc, v Cloudflare računu, kjer je domena aboutbuzz.com)

Čas: ob uri z malo prometa. Trajanje: ~15 minut.

1. **Varnostna kopija:** WordPress → UpdraftPlus → *Backup Now* (baza + datoteke).
2. **Ustvari Worker:** Workers & Pages → *Create* → *Start with Hello World* → ime `aboutbuzz-router` → *Deploy*.
3. **Koda:** *Edit code* → vso vsebino zamenjaj s kodo iz `cloudflare/worker.js` (GitHub: irena-blip/aboutbuzz-site) → *Deploy*.
4. **Spremenljivka:** Worker → *Settings* → *Variables and Secrets* → *Add* → ime `ENABLED`, vrednost `true` (Text) → *Deploy*.
5. **Poti (Routes):** Worker → *Settings* → *Domains & Routes* → *Add* → *Route*, zona `aboutbuzz.com`, po vrsti dodaj:
   - `aboutbuzz.com/`
   - `aboutbuzz.com/pricing*`
   - `aboutbuzz.com/howitworks*`
   - `aboutbuzz.com/about*`
   - `aboutbuzz.com/video-reviews*`
   - `aboutbuzz.com/assets/*`
   - `aboutbuzz.com/eu-funding*`

   (Če uporabljate tudi `www.aboutbuzz.com`, ponovi iste poti z `www.`.)
6. **Počisti predpomnilnik:** Caching → Configuration → *Purge Everything*. WordPress: *Delete Cache* v zgornji vrstici.

## C. Preverjanje takoj po preklopu (5 minut)

V zasebnem oknu brskalnika:

- [ ] aboutbuzz.com, /pricing/, /howitworks/, /about/, /video-reviews/ → nova stran
      (v orodjih za razvijalce → Network → glava `x-aboutbuzz-origin: site`)
- [ ] /video-reviews/ prikaže ocene in »Load more«
- [ ] gumb »Get started« (Display & Trust) → WooCommerce checkout s pravim izdelkom
- [ ] »Log in« → /my-account/ deluje, prijava uspe
- [ ] /checkout/, /cart/, /my-account/ → WordPress kot prej
- [ ] pripomoček pri eni stranki (npr. smartninja.si) se predvaja
- [ ] tester na upload.aboutbuzz.com naloži testni video; po odobritvi pride v WordPress
- [ ] kontaktni obrazec pošlje sporočilo
- [ ] obvestilo o piškotkih se pokaže; po »Accept all« Google Analytics → Realtime pokaže obisk

## D. Izklop v sili (vrnitev na star WordPress v ~10 sekundah)

Worker `aboutbuzz-router` → *Settings* → *Variables* → `ENABLED` = `false` → *Deploy*.
(ali: *Domains & Routes* → izbriši poti). WordPress strani so ves čas ostale nespremenjene.

## E. Po preklopu (prvi teden)

- [ ] Google Search Console: pregled pokritosti, ponovno pošlji sitemap (Rank Math `sitemap_index.xml`)
- [ ] Google Analytics: primerjava obiska pred/po
- [ ] WordPress strani /, /pricing/, /howitworks/, /about/, /video-reviews/ **ne briši** (rezerva za izklop v sili)
- [ ] Spremembe besedil odslej v Claude → GitHub → samodejna objava
