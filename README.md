# Gulášová Kalkulačka — Deployment Guide

Produkčne pripravený dual-domain projekt pre **gulasovakalkulacka.sk** a **gulasovakalkulacka.cz**.

## Čo je v balíku

```
gulasovakalkulacka/
├── index.html              Hlavná aplikácia (SK + CZ i18n, 11 receptov, PWA)
├── manifest.json           PWA manifest
├── sw.js                   Service worker (offline caching)
├── favicon.svg             Vektorová ikona
├── icon-192.png            PWA ikona 192×192
├── icon-512.png            PWA ikona 512×512
├── icon-maskable-512.png   PWA maskable ikona 512×512
├── og-image.jpg            Social preview 1200×630 (FB/Twitter/LinkedIn)
├── robots.txt              Pre crawlery vrátane GPTBot, ClaudeBot, PerplexityBot
├── sitemap.xml             Sitemap s hreflang pre obe domény
├── 404.html                Custom 404 stránka
├── CNAME-sk                Obsah: gulasovakalkulacka.sk  (premenovať na CNAME pre SK repo)
├── CNAME-cz                Obsah: gulasovakalkulacka.cz  (premenovať na CNAME pre CZ repo)
└── README.md               Tento súbor
```

## Kľúčové technické vlastnosti

- **Jeden kód, dve domény** — aplikácia automaticky detekuje doménu (`.sk` / `.cz`) cez `window.location.hostname` a prepne jazyk + menu + affiliate odkaz
- **11 receptov** — hovädzí, bravčový, poľovnícky, fazuľový, kyslá kapusta, kuracie, segedínsky, dršťkový, rybí, zverinový, pikantný (komplet zoznamy surovín)
- **Nákupný zoznam** — interaktívne checkboxy, uložené v `localStorage`, tlač, Web Share API, kopírovanie
- **Timeline varenia** — 10 krokov so odhadom času
- **Kotlíky 5–150 l** — 11 veľkostí
- **SEO** — hreflang SK/CS/x-default, Schema.org JSON-LD (Recipe + WebApplication + FAQPage), Open Graph, Twitter Cards, canonical
- **PWA** — manifest + service worker, inštalovateľné, funguje offline
- **GDPR** — cookie consent banner s jasnými formuláciami
- **Affiliate** — `rel="sponsored noopener"` (Google 2020 štandard, nie zastaralé `nofollow`)
- **Počítadlo litrov** — deterministický rast (žiadne nafukovanie, žiadne dead API)
- **Menový prevod** — EUR ↔ CZK (1 € = 25.1 Kč, upraviteľné v konštante `EUR_TO_CZK`)
- **Responzív** — mobile-first, print CSS pre tlač zoznamu

---

## Krok 1 — Príprava GitHub repov

Vytvor **dva samostatné repozitáre** (jeden pre každú doménu), obe identické až na `CNAME`:

### SK repo: `gulasovakalkulacka-sk`

```bash
mkdir gulasovakalkulacka-sk && cd gulasovakalkulacka-sk
git init
# Skopíruj všetky súbory z tohto balíka sem
# Premenuj CNAME-sk → CNAME, zmaž CNAME-cz
mv CNAME-sk CNAME
rm CNAME-cz
git add .
git commit -m "Initial release — gulasovakalkulacka.sk"
git branch -M main
git remote add origin https://github.com/TVOJE_MENO/gulasovakalkulacka-sk.git
git push -u origin main
```

### CZ repo: `gulasovakalkulacka-cz`

```bash
mkdir gulasovakalkulacka-cz && cd gulasovakalkulacka-cz
git init
# Skopíruj všetky súbory
# Premenuj CNAME-cz → CNAME, zmaž CNAME-sk
mv CNAME-cz CNAME
rm CNAME-sk
git add .
git commit -m "Initial release — gulasovakalkulacka.cz"
git branch -M main
git remote add origin https://github.com/TVOJE_MENO/gulasovakalkulacka-cz.git
git push -u origin main
```

> **Prečo dva repo?** Jeden repo = jeden `CNAME` = jedna doména. Ak by si chcel jeden repo, musel by si použiť Cloudflare Pages alebo Netlify. GitHub Pages je najjednoduchší s dvoma repos.

---

## Krok 2 — Aktivácia GitHub Pages

Pre **každý repo** urob:

1. Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)` → Save
4. Custom domain: zadaj doménu (`gulasovakalkulacka.sk` resp. `gulasovakalkulacka.cz`)
5. Zaškrtni **Enforce HTTPS** (Let's Encrypt certifikát sa vygeneruje do 15 min)

---

## Krok 3 — DNS nastavenie

U registrátora domény (Websupport.sk, Forpsi.cz, Cloudflare...) nastav:

### Pre gulasovakalkulacka.sk (apex + www)

**A záznamy pre apex doménu** (smerujú na GitHub Pages):
```
@    A    185.199.108.153
@    A    185.199.109.153
@    A    185.199.110.153
@    A    185.199.111.153
```

**AAAA záznamy** (IPv6, voliteľné ale odporúčané):
```
@    AAAA    2606:50c0:8000::153
@    AAAA    2606:50c0:8001::153
@    AAAA    2606:50c0:8002::153
@    AAAA    2606:50c0:8003::153
```

**CNAME pre www**:
```
www    CNAME    TVOJE_MENO.github.io
```

### Pre gulasovakalkulacka.cz
Rovnaké IP (GitHub Pages), ale na CZ repo: `www` CNAME → `TVOJE_MENO.github.io`.

> **Propagácia DNS** trvá 15 min – 24 h. Otestuj cez [dnschecker.org](https://dnschecker.org).

---

## Krok 4 — Verifikácia HTTPS

Po DNS propagácii:
1. Settings → Pages → odškrtni a znova zaškrtni **Enforce HTTPS** (vynúti regeneráciu certifikátu)
2. Otestuj oba URL-y:
   - `https://gulasovakalkulacka.sk` → musí byť zelený zámok
   - `https://gulasovakalkulacka.cz` → musí byť zelený zámok
   - Obe `www.*` varianty musia redirectnúť na apex (alebo naopak)

---

## Krok 5 — Google Search Console

Pre **obe domény** (nie `www`, ten sa rieši cez Preferred domain):

1. [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → **Domain** (nie URL prefix — Domain property pokryje apex + www + http + https)
3. Overenie cez DNS TXT záznam (skopíruj daný `google-site-verification=...` string)
4. U registrátora pridaj TXT záznam a čakaj 5–30 min
5. Po overení → **Sitemaps** → pridaj `sitemap.xml`

Pre Bing: [bing.com/webmasters](https://www.bing.com/webmasters) — import z Google Search Console funguje jednoduchšie.

---

## Krok 6 — Analytics (voliteľné, odporúčané)

**Odporúčam [Plausible](https://plausible.io)** alebo **[Umami](https://umami.is)** — GDPR-friendly, bez cookie banneru stačí len informovať v Privacy.

Alebo Google Analytics 4 — kalkulačka má pripravený cookie consent.

Pridaj script tag do `<head>` pred `</head>`:
```html
<script defer data-domain="gulasovakalkulacka.sk" src="https://plausible.io/js/script.js"></script>
```

---

## Krok 7 — Pre-launch checklist

Pred zapnutím reklamy / spustením:

- [ ] `https://gulasovakalkulacka.sk` otvára sa správne, zelený zámok
- [ ] `https://gulasovakalkulacka.cz` otvára sa správne, zelený zámok, **jazyk je čeština**
- [ ] Prepínač SK ↔ CS funguje
- [ ] Kalkulácia funguje (vyber recept, zmeň osoby, pozri nákupný zoznam)
- [ ] Checkboxy v nákupnom zozname fungujú, prežijú refresh
- [ ] Tlač nákupného zoznamu (Ctrl+P) — vyzerá profesionálne
- [ ] Cookie banner sa zobrazí pri prvej návšteve, po akceptovaní zmizne
- [ ] Affiliate tlačidlá fungujú (Kotlik.sk / Levnekotliky.cz otvárajú v novom tabe)
- [ ] PWA — otvor na mobile → „Pridať na domovskú obrazovku" → inštalácia funguje
- [ ] Offline — vypni wifi → refresh → stránka funguje ďalej
- [ ] Schema.org — [validator.schema.org](https://validator.schema.org) — žiadne errors
- [ ] Rich results — [search.google.com/test/rich-results](https://search.google.com/test/rich-results) — Recipe + FAQ sa zobrazia
- [ ] PageSpeed — [pagespeed.web.dev](https://pagespeed.web.dev) — mobile & desktop > 90
- [ ] Open Graph — [opengraph.xyz](https://www.opengraph.xyz) — náhľad zobrazuje `og-image.jpg`
- [ ] Sitemap — `https://gulasovakalkulacka.sk/sitemap.xml` sa otvára
- [ ] robots.txt — `https://gulasovakalkulacka.sk/robots.txt` sa otvára
- [ ] 404 stránka — otvor `/neexistujuca-stranka` → pekný 404

---

## Krok 8 — Affiliate partnerstvá

**Pred spustením** registruj sa do partnerských programov a uprav linky v `index.html` (konštanta `PARTNERS`):

### Slovensko — Kotlik.sk
- Zaregistruj sa do ich affiliate programu (email / kontakt na webe)
- Získaj svoj partnerský tag (napr. `?aff=tvoj_kod`)
- V `index.html` uprav: `sk: { url: 'https://www.kotlik.sk/?aff=TVOJ_KOD' }`

### Česko — Levnekotliky.cz
- To isté — registruj sa, získaj partnerské ID
- Uprav: `cs: { url: 'https://www.levnekotliky.cz/?aff=TVOJ_KOD' }`

> **Alternatívy ak partneri nedajú priamy affiliate:** Dognet.sk, Affilbox.cz — hľadaj kotlíkové e-shopy v ich katalógoch.

---

## Krok 9 — Obsahová stratégia (prvých 30 dní)

Aby Google indexoval a dával organickú návštevnosť:

1. **Týždeň 1** — Spustenie, pošli linky do Google Search Console, indexácia
2. **Týždeň 2** — Zdieľaj na FB skupinách: „Recepty na guláš", „Varenie v kotlíku", „Kempovanie SK"
3. **Týždeň 3** — Pridaj krátke YouTube Shorts / TikTok (ako vyrátať ingrediencie pre 50 osôb za 10 sekúnd) s linkom v biu
4. **Týždeň 4** — Oslov mikroinfluencerov (outdoor, food, rodina) — daj im zadarmo reklamu výmenou za zmienenie

### SEO potenciál
Slovenské kľúčové slová s najvyššou hodnotou:
- „guláš pre 50 ľudí" — low competition, high intent
- „koľko mäsa do kotlíka" — question keyword (dobre na rich results)
- „guláš kotlíkový recept" — mid competition

Česká strana:
- „guláš pro 50 lidí"
- „kotlíkový guláš recept"
- „kolik masa do kotlíku"

---

## Krok 10 — Údržba

- **Raz mesačne** — skontroluj ceny surovín (konštanta `PRICES_EUR` v `index.html`)
- **Raz za kvartál** — aktualizuj EUR/CZK kurz (konštanta `EUR_TO_CZK`)
- **Dvakrát ročne** — pridaj nový recept / sezónnu špecialitu (napr. „Vianočný kapustnicový guláš")
- **Pri update** — `sw.js`: zvýš `CACHE_NAME = 'gulas-kalk-v2'` aby si forcol re-cache

---

## Odporúčania na ďalší rozvoj

### Fáza 2 (za 3 mesiace, ak ide návštevnosť):
- Blog sekcia — 5–10 článkov typu „Najlepší guláš pre 100 hostí — kompletný návod"
- Kalkulačka na nápoje (pivo, víno, minerálky) pre akciu
- PDF export nákupného zoznamu
- QR kód na zdieľanie nákupného zoznamu

### Fáza 3 (za 6 mesiacov):
- Vlastný doménový e-mail (`info@gulasovakalkulacka.sk`) — cez Zoho / Forward Email (zadarmo)
- Reel/Short marketing — AI-generovaná postava „Kotlíkový dedo" odpovedá na otázky
- Predaj digitálnych produktov — PDF kuchárky „100 kotlíkových receptov" za 9 €

---

## Potrebujete pomoc?

Tento balík je plne funkčný out-of-the-box. Ak narazíš na problém:

1. Otvor `index.html` v prehliadači lokálne (dvojklikom) — musí fungovať aj bez servera
2. DevTools (F12) → Console — skontroluj errors
3. Ak chceš pridať recept → uprav `RECIPES` objekt v `<script>` sekcii
4. Ak chceš zmeniť ceny → uprav `PRICES_EUR` objekt

**Dobrú chuť a veľa úspechov s projektom! 🍲**
