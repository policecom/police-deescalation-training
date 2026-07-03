# Police De-escalation Training

An open, browser-based training simulation for practising **de-escalation and
communication** in tense situations. Players work through branching dialogue
scenarios, get per-choice feedback and an end-of-scenario training report, and
can **create, edit, upload and play their own scenarios** — no server, no build
step, no account.

It runs entirely in the browser. Clone it, open it, adapt it.

> **▶ Play it online:** https://policecom.github.io/police-deescalation-training/

Languages: **English · Čeština · Lietuvių · Română**.

---

## ⚠️ Disclaimer — please read

**Funded by the European Union.** Views and opinions expressed are those of the
authors only and do not necessarily reflect those of the European Union or the
granting authority (Czech National Agency / EACEA). Neither the European Union
nor the granting authority can be held responsible for them.
Erasmus+ project **POL-COM**, project number **2023-1-CZ01-KA220-VET-000167148**.

**No guarantee of factual or legal accuracy.** The scenarios and their feedback
are **training material**, not legal advice and not official police procedure.
The built-in scenarios illustrate communication technique against a **primarily
Czech legal framework** as an example. Law differs between countries and changes
over time; references to statutes may become outdated. **Neither the POL-COM
consortium nor the European Union warrants that any scenario is factually
correct, complete, or applicable to your jurisdiction.**

**It is up to you to decide** whether a given scenario fits your context — your
national legislation, your force's procedures, your training goals. If it does
not, **that is exactly what this repository is for:** the content is open, so you
can review it, correct it, translate it, and replace it with scenarios that match
your own legal reality. Use of this material is entirely at your own discretion
and responsibility.

*This notice is also available in [Čeština](#-česky), [Lietuvių](#-lietuvių) and [Română](#-română).*

---

## What's inside

- **14 branching scenarios** × 4 languages, each with a 7-stage decision flow and
  a final debrief.
- **Per-choice feedback** structured as *Why / Consequences / Reflection*, with
  clickable links to cited Czech statutes on zakonyprolidi.cz.
- A **training report** with a stage-by-stage analysis and a per-stage legal note.
- A built-in **scenario editor** (`editor.html`) that saves to your browser and
  exports ready-to-commit JSON files.
- Pure client-side: HTML + vanilla JS, no framework, no build. Custom scenarios
  are stored locally in IndexedDB.

## Play

Either open the **[live demo](https://policecom.github.io/police-deescalation-training/)**,
or self-host (below). Pick a language on the welcome screen, choose a scenario,
and respond to each situation. At the end, open **📊 Training Report**.

## Self-host

The game must be served over **HTTP** (it loads JSON via `fetch`, which does not
work from `file://`). Any static file server or static host works.

```bash
git clone https://github.com/policecom/police-deescalation-training.git
cd police-deescalation-training
python3 -m http.server 8000
# open http://127.0.0.1:8000/
```

To publish your own copy, enable **GitHub Pages** on your fork (Settings →
Pages → Deploy from branch → `main` / root), or drop the folder on any static
host (Netlify, Cloudflare Pages, an Apache/nginx directory, …). There is nothing
to build.

## Make it your own — add or change scenarios

Two ways, depending on whether you want the change to live only in your browser
or to become part of your (forkable, shareable) copy:

### A) In the app — quickest, browser-local

Open the game → the **➕ Vlastní scénář / Custom scenario** card at the bottom of
the menu → **Create in editor**. Fill in stages, choices and feedback; use
**Generate review skeleton** so the report works immediately. Your scenario is
saved in your browser (IndexedDB) and appears in the menu. Use **Export** to
download the JSON files.

### B) As repository files — permanent and shareable

Add the exported files to your fork and they become part of the site:

1. Put the scenario at `scenarios/<lang>/scenario-<id>-<lang>.json`
   (e.g. `scenarios/en/scenario-myscenario-en.json`).
2. Optionally put a review at `scenarios/reviews/review-<id>-<lang>.json`
   (without it, the report just shows the score).
3. Add a menu entry to `scenarios/index-<lang>.json` (the `scenarios` array — id,
   title, description, icon, difficulty, duration).

That's it — the game resolves scenario files by this naming convention, so **you
don't need to edit any JavaScript.** See [CONTRIBUTING.md](CONTRIBUTING.md) for
the exact JSON schema and validation rules.

## Licensing

- **Code** (HTML/JS/CSS) is licensed under the **MIT License** — see
  [`LICENSE`](LICENSE).
- **Content** (scenarios, reviews, translations, texts, images) is licensed
  under **Creative Commons Attribution 4.0 International (CC BY 4.0)** — see
  [`CONTENT-LICENSE.md`](CONTENT-LICENSE.md).

You may use, modify, translate and redistribute both, including commercially,
provided you keep the code copyright notice and give appropriate credit for the
content. Attribution suggestion:

> Based on *Police De-escalation Training* by the POL-COM project
> (Erasmus+ 2023-1-CZ01-KA220-VET-000167148), CC BY 4.0.

## Credits

Created within the Erasmus+ project **POL-COM**
(2023-1-CZ01-KA220-VET-000167148), co-funded by the European Union.

---

## 🇨🇿 Česky

**Trénink policejní deeskalace** — otevřená výuková simulace pro nácvik
**deeskalace a komunikace** ve vypjatých situacích, běžící čistě v prohlížeči.
Hráč prochází větvenými scénáři, dostává zpětnou vazbu ke každé volbě a závěrečný
report, a může si **vytvořit, upravit, nahrát a zahrát vlastní scénáře** — bez
serveru, bez buildu, bez účtu.

**▶ Zahrát:** https://policecom.github.io/police-deescalation-training/

### ⚠️ Upozornění

**Financováno Evropskou unií.** Vyjádřené názory jsou názory autorů a nemusí
odrážet stanoviska Evropské unie ani poskytovatele grantu; ti za ně nenesou
odpovědnost. Projekt Erasmus+ **POL-COM**, číslo **2023-1-CZ01-KA220-VET-000167148**.

**Bez záruky věcné a právní správnosti.** Scénáře a jejich zpětná vazba jsou
**výukový materiál**, nikoli právní poradenství ani oficiální policejní postup.
Vestavěné scénáře ilustrují komunikační techniky na **převážně českém právním
rámci** jako příklad. Právo se liší stát od státu a mění se v čase; odkazy na
paragrafy mohou zastarat. **Konsorcium POL-COM ani Evropská unie neručí za to, že
je scénář věcně správný, úplný nebo použitelný ve vaší jurisdikci.**

**Je na vás, abyste posoudili**, zda daný scénář odpovídá vašemu kontextu — vaší
legislativě, postupům vašeho sboru, cílům výcviku. Pokud ne, **přesně k tomu
tento repozitář slouží:** obsah je otevřený, takže si scénáře můžete
zkontrolovat, opravit, přeložit a nahradit takovými, které odpovídají vaší právní
realitě. Použití je zcela na vašem uvážení a odpovědnosti.

### Self-hosting a vlastní scénáře

Hru je nutné servírovat přes **HTTP** (načítá JSON přes `fetch`, `file://`
nefunguje):

```bash
git clone https://github.com/policecom/police-deescalation-training.git
cd police-deescalation-training
python3 -m http.server 8000
# otevřete http://127.0.0.1:8000/
```

Vlastní scénář přidáte buď **v aplikaci** (karta „➕ Vlastní scénář" → editor →
Export), nebo jako **soubory v repu**: scénář do
`scenarios/<jazyk>/scenario-<id>-<jazyk>.json`, volitelně review do
`scenarios/reviews/`, a položku do `scenarios/index-<jazyk>.json`. JavaScript
upravovat nemusíte. Podrobnosti a schéma viz [CONTRIBUTING.md](CONTRIBUTING.md).

### Licence

Kód pod **MIT** ([`LICENSE`](LICENSE)), obsah (scénáře, texty, překlady) pod
**CC BY 4.0** ([`CONTENT-LICENSE.md`](CONTENT-LICENSE.md)). Smíte používat,
upravovat, překládat i šířit (i komerčně) při zachování autorství.

---

## 🇱🇹 Lietuvių

**Policijos konfliktų deeskalavimo mokymai** — atviras, naršyklėje veikiantis
mokomasis simuliatorius, skirtas deeskalavimo ir bendravimo įtemptose situacijose
įgūdžiams lavinti; viskas vyksta tiesiogiai naršyklėje. Žaidėjai sprendžia šakotus
scenarijus, gauna grįžtamąjį ryšį apie kiekvieną pasirinkimą ir galutinę mokymų
ataskaitą, taip pat gali kurti, redaguoti, įkelti ir žaisti savo scenarijus — be
serverio, be kompiliacijos, be paskyros.

**▶ Žaisti:** https://policecom.github.io/police-deescalation-training/

### ⚠️ Atsakomybės apribojimas — prašome perskaityti

**Finansuojama Europos Sąjungos.** Išreikštos nuomonės ir požiūriai yra tik
autorių ir nebūtinai atspindi Europos Sąjungos ar finansavimo institucijos
nuomonę; nė viena iš jų negali būti laikoma už juos atsakinga. „Erasmus+" projektas
POL-COM, projekto numeris 2023-1-CZ01-KA220-VET-000167148.

**Negarantuojamas faktinis ar teisinis tikslumas.** Scenarijai ir jų atsiliepimai
yra mokymo medžiaga, o ne teisinė konsultacija ir ne oficiali policijos procedūra.
Pateikti scenarijai iliustruoja bendravimo techniką, remiantis pirmiausia Čekijos
teisinio reguliavimo pavyzdžiu. Teisės aktai skirtingose šalyse skiriasi ir laikui
bėgant keičiasi; nuorodos į teisės aktus gali tapti pasenusios. Nei „POL-COM"
konsorciumas, nei Europos Sąjunga negarantuoja, kad bet kuris scenarijus yra
faktiniu požiūriu teisingas, išsamus ar taikytinas jūsų jurisdikcijoje.

**Jūs patys turite nuspręsti**, ar konkretus scenarijus tinka jūsų kontekstui —
jūsų šalies teisės aktams, jūsų tarnybos procedūroms, jūsų mokymo tikslams. Jei
netinka, būtent tam ir skirta ši saugykla: turinys yra atviras, todėl galite jį
peržiūrėti, pataisyti, išversti ir pakeisti scenarijais, atitinkančiais jūsų
teisinę realybę. Šios medžiagos naudojimas yra visiškai jūsų nuožiūra ir
atsakomybe.

### Savarankiškas talpinimas ir savi scenarijai

Žaidimas turi būti teikiamas per **HTTP** (jis įkelia JSON naudodamas `fetch`,
kuris neveikia naudojant `file://` protokolą):

```bash
git clone https://github.com/policecom/police-deescalation-training.git
cd police-deescalation-training
python3 -m http.server 8000
# atidarykite http://127.0.0.1:8000/
```

Savo scenarijų galite pridėti arba pačioje programėlėje (kortelė „➕ Vlastní
scénář / Custom scenario", tada redaktorius ir Export), arba kaip failus
saugykloje: scenarijus į `scenarios/<kalba>/scenario-<id>-<kalba>.json`,
pasirinktinai apžvalgą į `scenarios/reviews/` ir įrašą į
`scenarios/index-<kalba>.json`. Jums nereikia redaguoti jokio JavaScript kodo.
Schemą rasite faile [CONTRIBUTING.md](CONTRIBUTING.md).

### Licencija

Kodas pagal **MIT** ([`LICENSE`](LICENSE)), turinys (scenarijai, tekstai,
vertimai) pagal **CC BY 4.0** ([`CONTENT-LICENSE.md`](CONTENT-LICENSE.md)). Galite
jį naudoti, keisti, versti ir platinti, įskaitant komerciniais tikslais,
išlaikydami autoriaus nuorodą.

---

## 🇷🇴 Română

**Instruirea poliției în domeniul dezamorsării conflictelor** — o simulare de
instruire deschisă, bazată pe browser, pentru exersarea dezamorsării conflictelor
și a comunicării în situații tensionate, care rulează integral în browser.
Jucătorii parcurg scenarii cu ramificații, primesc feedback pentru fiecare alegere
și un raport final de instruire și pot crea, edita, încărca și juca propriile
scenarii — fără server, fără compilare, fără cont.

**▶ Jucați:** https://policecom.github.io/police-deescalation-training/

### ⚠️ Declarație de exonerare de răspundere — vă rugăm să citiți

**Finanțat de Uniunea Europeană.** Punctele de vedere și opiniile exprimate aparțin
exclusiv autorilor și nu reflectă neapărat punctul de vedere al Uniunii Europene
sau al autorității finanțatoare; niciuna dintre acestea nu poate fi trasă la
răspundere pentru acestea. Proiectul Erasmus+ POL-COM, numărul de proiect
2023-1-CZ01-KA220-VET-000167148.

**Nu se garantează acuratețea factuală sau juridică.** Scenariile și feedback-ul
aferent constituie materiale de instruire, nu reprezintă consultanță juridică și nu
constituie o procedură oficială a poliției. Scenariile incluse ilustrează tehnici
de comunicare pe baza unui cadru juridic preponderent ceh, cu titlu de exemplu.
Legislația diferă de la o țară la alta și se modifică în timp; referirile la acte
normative pot deveni depășite. Nici consorțiul POL-COM, nici Uniunea Europeană nu
garantează că vreun scenariu este corect din punct de vedere factual, complet sau
aplicabil în jurisdicția dumneavoastră.

**Rămâne la latitudinea dumneavoastră să decideți** dacă un anumit scenariu se
potrivește contextului dumneavoastră — legislația națională, procedurile forței
dumneavoastră de poliție, obiectivele dumneavoastră de instruire. Dacă nu este
cazul, tocmai acesta este scopul acestui depozit: conținutul este deschis, astfel
încât îl puteți revizui, corecta, traduce și înlocui cu scenarii care corespund
realității juridice proprii. Utilizarea acestui material se face în întregime la
propria dumneavoastră discreție și pe propria răspundere.

### Găzduire proprie și scenarii personalizate

Jocul trebuie să fie găzduit prin **HTTP** (încarcă fișiere JSON prin `fetch`, care
nu funcționează cu protocolul `file://`):

```bash
git clone https://github.com/policecom/police-deescalation-training.git
cd police-deescalation-training
python3 -m http.server 8000
# deschideți http://127.0.0.1:8000/
```

Puteți adăuga propriul scenariu fie în aplicație (cardul „➕ Vlastní scénář /
Custom scenario", apoi editorul și Export), fie ca fișiere în depozit: scenariul în
`scenarios/<limba>/scenario-<id>-<limba>.json`, opțional o recenzie în
`scenarios/reviews/` și o intrare în `scenarios/index-<limba>.json`. Nu este necesar
să editați codul JavaScript. Consultați [CONTRIBUTING.md](CONTRIBUTING.md) pentru
schemă.

### Licență

Codul este sub licența **MIT** ([`LICENSE`](LICENSE)), iar conținutul (scenarii,
texte, traduceri) sub **CC BY 4.0** ([`CONTENT-LICENSE.md`](CONTENT-LICENSE.md)).
Puteți să îl utilizați, să îl modificați, să îl traduceți și să îl redistribuiți,
inclusiv în scop comercial, păstrând însă atribuirea.
