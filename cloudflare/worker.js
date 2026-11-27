/**
 * aboutbuzz.com – usmerjanje med novo stranjo in WordPressom
 * ---------------------------------------------------------------------------
 * Ta Worker teče SAMO na naštetih poteh (Workers Routes, glej PREKLOP.md):
 *   aboutbuzz.com/            aboutbuzz.com/pricing*      aboutbuzz.com/howitworks*
 *   aboutbuzz.com/about*      aboutbuzz.com/video-reviews*  aboutbuzz.com/assets/*
 *   aboutbuzz.com/eu-funding*
 * Vse ostalo (wp-json, wp-content, checkout, my-account, pripomoček pri strankah …)
 * Workerja sploh ne doseže in gre naravnost v WordPress kot danes.
 *
 * Varnostna pravila – v WordPress gre (nespremenjeno), če:
 *   - zahteva ni GET/HEAD (obrazci, AJAX, košarica),
 *   - ima parameter, ki ga potrebuje WordPress (?add-to-cart=, ?s=, ?p=, ?preview= …),
 *   - je pot, ki je nova stran nima (npr. /about-something/).
 *
 * IZKLOP V SILI: v Cloudflare → Worker → Settings → Variables nastavi ENABLED = false
 * (ali izbriši Routes). Takoj je spet vse na WordPressu.
 */

const PAGES_ORIGIN = 'https://aboutbuzz-site.pages.dev';

// Strani nove strani (z in brez končne poševnice)
const NEW_PAGES = new Set(['/', '/pricing/', '/howitworks/', '/about/', '/video-reviews/', '/eu-funding/']);
const NEW_PREFIXES = ['/assets/'];

// Parametri, ki ne spremenijo strani (oglaševanje, analitika) – ti smejo na novo stran
const HARMLESS_PARAMS = /^(utm_[a-z]+|gclid|gbraid|wbraid|fbclid|msclkid|ttclid|mc_cid|mc_eid|ref|_gl|v)$/i;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (String(env.ENABLED).toLowerCase() === 'false') return fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD') return fetch(request);

    let path = url.pathname;
    const isAsset = NEW_PREFIXES.some((p) => path.startsWith(p));
    if (!isAsset && path !== '/' && !path.endsWith('/') && NEW_PAGES.has(path + '/')) path += '/';
    const isPage = NEW_PAGES.has(path);
    if (!isPage && !isAsset) return fetch(request);

    // Parametri, ki jih potrebuje WordPress → WordPress
    for (const key of url.searchParams.keys()) {
      if (!HARMLESS_PARAMS.test(key) && !(path === '/video-reviews/' && key.startsWith('_'))) return fetch(request);
    }

    // Z nove strani: brez piškotkov WordPressa (zasebnost), brez avtorizacije
    const target = new URL(path + url.search, PAGES_ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete('cookie');
    headers.delete('authorization');
    let res = await fetch(target.toString(), { method: request.method, headers, redirect: 'manual' });

    // Če nova stran ne vrne strani (napaka), raje pokaži WordPress
    if (res.status >= 500) return fetch(request);

    const out = new Response(res.body, res);
    out.headers.delete('x-robots-tag');            // noindex velja samo za testne naslove
    out.headers.set('x-aboutbuzz-origin', 'site'); // za preverjanje: kdo je stregel stran
    const loc = out.headers.get('location');
    if (loc) out.headers.set('location', loc.replace(PAGES_ORIGIN, url.origin));
    return out;
  },
};
