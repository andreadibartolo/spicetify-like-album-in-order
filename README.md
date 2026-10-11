<div align="center">

[![English](https://img.shields.io/badge/🇬🇧_Language-English_(Default)-1ed760?style=for-the-badge)](./README.md)
[![Italiano](https://img.shields.io/badge/🇮🇹_Lingua-Italiano-282828?style=for-the-badge)](./README.it.md)

# 💚 Spicetify — Like Album In Order

**Save all tracks from an album to your Spotify Favorites while maintaining the original tracklist order.**

[![Spicetify](https://img.shields.io/badge/Spicetify-Extension-1ed760?style=for-the-badge&logo=spotify&logoColor=white)](https://spicetify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Issues](https://img.shields.io/github/issues/TUO_USERNAME/spicetify-like-album-in-order?style=for-the-badge&color=f15e6c)](https://github.com/andreadibartolo/spicetify-like-album-in-order/issues)

</div>

---

## 🤔 The Problem

When you add all the tracks from an album to **Liked Songs** on Spotify:
1. If you select and add them all at once, Spotify assigns the **exact same timestamp** to multiple tracks, scrambling their order.
2. If you add them from first to last, they will appear in your library in **reverse order** (from the last track to the first).

## ✨ The Solution

**Like Album In Order** retrieves the tracklist via Spotify's internal GraphQL APIs (avoiding `429 Too Many Requests` errors) and saves the tracks **from last to first** with a short, configurable delay (default `2000 ms`). This ensures that the album appears **exactly from track 1 to the last** in your **Liked Songs** playlist.

---

## 🚀 Key Features

- 💚 **Sequential Liking (last to first):** adds the entire album to Favorites while preserving the original track order.
- 🗑️ **Bulk Remove Likes:** removes all tracks from the current album from Favorites with a single click.
- ➕ **Smart popup on the album `+` button:** when saving an album to your library by clicking the `+` button, a window asks if you also want to add all individual tracks to Favorites in order.
- 📊 **Real-time progress bar (HUD):** displays a floating widget showing live progress (e.g., `♥ 1 / 12`, `♥ 2 / 12`...).
- ⚙️ **Integrated Settings panel:** a dedicated section directly within **Spotify Settings** to customize the delay (in milliseconds) and confirmation popups.

---

## 📦 Installation

### Method 1: Via Spicetify Marketplace *(Recommended)*
1. Open **Spotify** and click on **Marketplace** in the sidebar.
2. Go to the **Extensions** tab and search for **`Like Album In Order`**.
3. Click the install icon and reload Spotify.

### Method 2: Manual Installation (Spicetify CLI)
1. Download the [`likeAlbumInOrder.js`](./likeAlbumInOrder.js) file and copy it to the Spicetify `Extensions` folder:
   - **Windows:** `%appdata%\spicetify\Extensions`
   - **Linux / macOS:** `~/.config/spicetify/Extensions`
   *(You can find the exact path by running `spicetify path userdata` in the terminal).*
2. Enable the extension by running the following in the terminal:
   ```bash
   spicetify config extensions likeAlbumInOrder.js
   spicetify apply
   ```

---
## ⚙️ Configuration
Open **Spotify Settings** (`Ctrl + P` or click the profile icon in the top-right corner $\rightarrow$ **Settings**) and scroll to the bottom of the page to the **Like Album In Order (Extension)** section:

| Setting | Default | Description |
| --- | :---: | --- |
Delay between saving tracks (ms) | `2000 ms` | Pause between tracks to ensure distinct timestamps on Spotify's servers. |
Ask when saving an album with `+` | `On` | Shows a confirmation popup when you click `+` to save all the tracks from album to your Liked Songs playlist. |
Ask for confirmation before removing tracks | `On` | Shows a warning before removing all the album's tracks from your Liked Songs. |

---
## 🐛 Bug Reports and Support
### 😥 Found a problem?
Open a [new issue](../../issues/new?template=bug_report.yml) and fill out the template with your Spotify and Spicetify versions, as well as the console logs.

### 💡 Have an idea to improve the extension?
Open a [new feature request](../../issues/new?template=feature_request.yml).

---