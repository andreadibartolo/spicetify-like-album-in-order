<div align="center">

# 💚 Spicetify — Like Album In Order

**Salva tutti i brani di un album nei Preferiti di Spotify mantenendo l'ordine originale della tracklist.**

[![Spicetify](https://img.shields.io/badge/Spicetify-Extension-1ed760?style=for-the-badge&logo=spotify&logoColor=white)](https://spicetify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/TUO_USERNAME/spicetify-like-album-in-order?style=for-the-badge&color=f15e6c)](https://github.com/andreadibartolo/spicetify-like-album-in-order/issues)

</div>

---

## 🤔 Il Problema

Quando aggiungi tutti i brani di un album a **Brani che ti piacciono** su Spotify:
1. Se li selezioni e li aggiungi tutti in una volta, Spotify assegna lo **stesso identico timestamp** a più tracce, mescolandone l'ordine.
2. Se li aggiungi dal primo all'ultimo, nella tua libreria appariranno in **ordine inverso** (dall'ultima traccia alla prima).

## ✨ La Soluzione

**Like Album In Order** recupera la tracklist tramite le API GraphQL interne di Spotify (evitando errori `429 Too Many Requests`) e salva i brani **partendo dall'ultimo fino al primo** con un breve ritardo configurabile (`2000 ms` di default). In questo modo, nella playlist **Brani che ti piacciono**, l'album apparirà **esattamente dalla traccia 1 all'ultima**.

---

## 🚀 Funzionalità Principali

- 💚 **Like in ordine (dall'ultimo al primo):** aggiunge l'intero album ai Preferiti preservando la sequenza originale.
- 🗑️ **Rimuovi Like in blocco:** rimuove con un solo clic tutti i brani dell'album corrente dai Preferiti.
- ➕ **Popup intelligente sul tasto `+` dell'album:** quando salvi un album nella libreria cliccando sul pulsante `+`, una finestra ti chiede se desideri aggiungere anche tutti i singoli brani ai Preferiti in ordine.
- 📊 **Barra di avanzamento in tempo reale (HUD):** mostra un widget flottante con il progresso live (es. `♥ 1 / 12`, `♥ 2 / 12`...).
- ⚙️ **Pannello Impostazioni integrato:** sezione dedicata direttamente nelle **Impostazioni di Spotify** per personalizzare il ritardo in millisecondi e i popup di conferma.

---

## 📦 Installazione

### Metodo 1: Tramite Spicetify Marketplace *(Consigliato)*
1. Apri **Spotify** e clicca su **Marketplace** nella barra laterale.
2. Vai nella scheda **Extensions** e cerca **`Like Album In Order`**.
3. Clicca sull'icona di installazione e ricarica Spotify.

### Metodo 2: Installazione Manuale (Spicetify CLI)
1. Scarica il file [`likeAlbumInOrder.js`](./likeAlbumInOrder.js) e copialo nella cartella `Extensions` di Spicetify:
   - **Windows:** `%appdata%\spicetify\Extensions`
   - **Linux / macOS:** `~/.config/spicetify/Extensions`
   *(Puoi trovare il percorso esatto eseguendo `spicetify path userdata` nel terminale).*
2. Attiva l'estensione eseguendo nel terminale:
   ```bash
   spicetify config extensions likeAlbumInOrder.js
   spicetify apply
   ```

---
## ⚙️ Configurazione
Apri le **Impostazioni di Spotify** (`Ctrl + P` oppure clicca sull'icona del profilo in alto a destra $\rightarrow$ **Impostazioni**) e scorri fino in fondo alla pagina nella sezione **Like Album In Order (Estensione)**:

| Impostazione |	Default	| Descrizione |
| --- |  :---:  | --- |
Ritardo tra il salvataggio dei brani (ms) |	`2000 ms` |	Pausa tra un brano e l'altro per garantire timestamp distinti sui server di Spotify.
|Chiedi quando salvi un album con il `+`	| `Attivo`|	Mostra il popup di conferma quando clicchi sul `+` per salvare un album nella libreria.
|Chiedi conferma prima di rimuovere i brani|	`Attivo`	|Mostra un avviso prima di rimuovere tutti i brani dell'album dai Preferiti.

---
## 🐛 Segnalazione Bug e Supporto
### 😥 Hai riscontrato un problema?
Apri un [nuovo issue](../../issues/new?template=bug_report.yml) compilando il modulo preimpostato con la tua versione di Spotify, Spicetify e i log della console.

### 💡 Hai un'idea per migliorare l'estensione?
Apri una [nuova feature request](../../issues/new?template=feature_request.yml).

---