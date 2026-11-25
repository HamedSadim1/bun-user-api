# Plan: primary-tint schaduwen rebasen op `--primary`

**Status:** proposed
**Datum:** 2026-11-25
**Basiscommit:** `e0ae3d2` (branch `main`)
**Surface:** signup-pagina (`/`), gedeelde stylesheet `public/style.css`

## Doel

De focus-ring van de formuliervelden, de hover-glow van de submit-knop en het decoratieve brandpatroon gebruiken een hardgecodeerde RGB-waarde van de **oude** primary-kleur: `#6366f1` = `rgb(99, 102, 241)`. De huidige token is `--primary: #4f46e5` = `rgb(79, 70, 229)`. Daardoor hebben die schaduwen een andere hue dan de rand of achtergrond waar ze bij horen.

Dit plan doet precies één ding: de drie primary-getinte schaduwen rebasen op de huidige tokenwaarde. Geen layout-, gedrags- of contrastwijziging, geen nieuwe tokens.

## Bewijs uit de huidige staat

- `public/style.css:11` — `--primary: #4f46e5;` (gelijk aan `rgb(79, 70, 229)`); `--primary-light: #818cf8` is een andere waarde en komt niet overeen met de gebruikte tint.
- `public/style.css:232` — `.input-wrapper input:focus` zet `border-color: var(--primary);`
- `public/style.css:234` — dezelfde regel zet `box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);`
- `public/style.css:423` — `.submit-btn` gebruikt `background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);`
- `public/style.css:456` — `.submit-btn:hover` zet `box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);`
- `public/style.css:95` — `.brand-pattern` gebruikt `radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`

Dat de tint van de state-token moet komen, bewijzen de zusterregels in dezelfde component:

- `public/style.css:247` — `.input-wrapper.valid input:focus` gebruikt `rgba(34, 197, 94, 0.1)`, exact `--success` `#22c55e`.
- `public/style.css:251` — `.input-wrapper.invalid input:focus` gebruikt `rgba(239, 68, 68, 0.1)`, exact `--error` `#ef4444`.

Alleen de primary-variant wijkt af; de conventie is dus "10% tint van de bijbehorende kleurtoken", en de waarde `rgb(99, 102, 241)` hoort bij geen enkele token meer.

## Wijziging 1 — focus-ring van de invoervelden

Bestand: `public/style.css`, regel 234 (selector `.input-wrapper input:focus`).

```css
/* was */
box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);

/* wordt */
box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
```

## Wijziging 2 — hover-glow van de submit-knop

Bestand: `public/style.css`, regel 456 (selector `.submit-btn:hover`).

```css
/* was */
box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);

/* wordt */
box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
```

## Wijziging 3 — decoratief brandpatroon

Bestand: `public/style.css`, regel 95 (selector `.brand-pattern`), eerste radial-gradient-stop.

```css
/* was */
radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),

/* wordt */
radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
```

## Waarom deze waarden

`rgb(79, 70, 229)` is de exacte RGB-notatie van `--primary` (`#4f46e5`). De alpha-waarden (0.1, 0.4, 0.3) en alle geometrie blijven ongewijzigd, zodat alleen de hue wijzigt. Er wordt geen nieuw token of primitief geïntroduceerd; de waarde volgt de bestaande praktijk uit `public/style.css:247` en `public/style.css:251`.

## Cache-buster

Beide pagina's laden de stylesheet met een versieparameter: `public/index.html` en `public/users.html` gebruiken `./style.css?v=4`. Verhoog die naar `?v=5` in beide bestanden, zodat browsers de nieuwe CSS ophalen. Dit is de bestaande conventie in dit project en hoort bij deze wijziging.

## Buiten scope

- Geen wijzigingen aan tokens, radii, typografie, spacing of componentstructuur.
- Geen nieuwe CSS-primitieven of `color-mix()`-refactor; dat is een aparte ontwerpbeslissing (zie "Risico's").
- Geen wijziging aan de success- en error-tinten; die kloppen al met hun tokens.

## Verificatie door de uitvoerende agent

1. `bun run lint` — verwacht: 0 errors, dezelfde 3 `noImportantStyles`-waarschuwingen in `prefers-reduced-motion` als vóór de wijziging.
2. `bun run typecheck` — verwacht: exit 0.
3. Handmatig in de browser op `/`:
   - Focus op e-mail, gebruikersnaam en wachtwoord: de ring moet dezelfde paarse hue hebben als de rand van het veld.
   - Hover op "Create Account": de glow moet paars zijn, niet indigo.
   - De validatie-states (grof, rood) mogen onveranderd blijven.
4. Controleer in devtools de computed `box-shadow` van een gefocust veld: verwacht `rgba(79, 70, 229, 0.1)`.
5. Bevestig dat er geen andere `rgba(99, 102, 241`-waarde meer in `public/style.css` staat.

## Risico's en opvolging

- De tint blijft een hardgecodeerde RGB-waarde: verandert `--primary` opnieuw, dan moet deze mee. Een structurele oplossing (tint afleiden uit de token met `color-mix()` of een expliciet `--primary-tint`-token) valt buiten dit plan en vraagt een eigen ontwerpbeslissing plus een keuze over de alpha-schaal.
- Dit plan raakt alleen kleurwaarden. De onderzochte radii- en typografie-drift staat hier los van en is bewust niet meegenomen.
