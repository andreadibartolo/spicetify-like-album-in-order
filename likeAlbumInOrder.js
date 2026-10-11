// NAME: Like All Album Tracks In Order
// AUTHOR: andreadibartolo
// DESCRIPTION: Adds or removes all tracks of an album from Favorites while preserving the original order, with a dedicated section in Spotify Settings.

(function likeAlbumInOrder() {
    if (
        !Spicetify.Platform ||
        !Spicetify.GraphQL ||
        !Spicetify.ContextMenu ||
        !Spicetify.URI ||
        !Spicetify.LocalStorage ||
        !Spicetify.showNotification
    ) {
        setTimeout(likeAlbumInOrder, 300);
        return;
    }

    console.log("[LikeAlbumInOrder] Estensione caricata correttamente (v4).");

    // --- GESTIONE IMPOSTAZIONI (LocalStorage) ---
    const STORAGE_KEYS = {
        DELAY_MS: "likeAlbumInOrder:delayMs",
        ASK_ON_SAVE: "likeAlbumInOrder:askOnSave",
        CONFIRM_REMOVE: "likeAlbumInOrder:confirmRemove",
    };

    const DEFAULT_SETTINGS = {
        delayMs: 2000,
        askOnSave: true,
        confirmRemove: true,
    };

    function getDelayMs() {
        const raw = Spicetify.LocalStorage.get(STORAGE_KEYS.DELAY_MS);
        const parsed = parseInt(raw, 10);
        return !isNaN(parsed) && parsed >= 50 ? parsed : DEFAULT_SETTINGS.delayMs;
    }

    function setDelayMs(val) {
        const parsed = parseInt(val, 10);
        const safeVal = !isNaN(parsed) && parsed >= 50 ? parsed : DEFAULT_SETTINGS.delayMs;
        Spicetify.LocalStorage.set(STORAGE_KEYS.DELAY_MS, String(safeVal));
        return safeVal;
    }

    function getBoolSetting(key, defaultVal) {
        const raw = Spicetify.LocalStorage.get(key);
        if (raw === null || raw === undefined) return defaultVal;
        return raw === "true";
    }

    function setBoolSetting(key, val) {
        Spicetify.LocalStorage.set(key, val ? "true" : "false");
    }

    // --- STATO GLOBALE E ID ELEMENTI DOM ---
    let isProcessing = false;
    let currentProgressText = null;
    let lastModalTriggerTime = 0;

    const LIKE_BUTTON_ID = "spicetify-reverse-like-btn";
    const UNLIKE_BUTTON_ID = "spicetify-reverse-unlike-btn";
    const MODAL_ID = "spicetify-reverse-like-modal";
    const HUD_ID = "spicetify-reverse-like-hud";
    const SETTINGS_SECTION_ID = "spicetify-reverse-like-settings";
    const REMOVE_STEP_DELAY_MS = 100;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const DEFAULT_LIKE_BTN_HTML = `
        <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2zm3.158.252A3.082 3.082 0 0 0 2.49 7.337l.005.005L7.8 13.664a.264.264 0 0 0 .311.069.262.262 0 0 0 .09-.069l5.312-6.33a3.043 3.043 0 0 0 .68-2.573 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.007.007a1.501 1.501 0 0 1-2.045 0l-.009-.008a3.082 3.082 0 0 0-2.121-.861z"></path>
        </svg>
        <span>Like in ordine</span>
    `;

    const DEFAULT_UNLIKE_BTN_HTML = `
        <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
            <path d="M4 7.25h8v1.5H4v-1.5z"></path>
        </svg>
        <span>Rimuovi Like</span>
    `;

    /**
     * Aggiorna il pannello flottante (HUD) e i pulsanti nella barra azioni
     */
    function updateProgressUI(current, total, finished = false, mode = "add") {
        const accentColor = mode === "remove" ? "#f15e6c" : "#1ed760";
        const likeBtn = document.getElementById(LIKE_BUTTON_ID);
        const unlikeBtn = document.getElementById(UNLIKE_BUTTON_ID);

        if (likeBtn) {
            if (isProcessing && mode === "add" && currentProgressText) {
                likeBtn.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: ${accentColor};">${currentProgressText}</span>`;
                likeBtn.style.borderColor = accentColor;
            } else {
                likeBtn.innerHTML = DEFAULT_LIKE_BTN_HTML;
                likeBtn.style.borderColor = "var(--essential-subdued, rgba(255, 255, 255, 0.3))";
            }
        }

        if (unlikeBtn) {
            if (isProcessing && mode === "remove" && currentProgressText) {
                unlikeBtn.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: ${accentColor};">${currentProgressText}</span>`;
                unlikeBtn.style.borderColor = accentColor;
            } else {
                unlikeBtn.innerHTML = DEFAULT_UNLIKE_BTN_HTML;
                unlikeBtn.style.borderColor = "var(--essential-subdued, rgba(255, 255, 255, 0.3))";
            }
        }

        let hud = document.getElementById(HUD_ID);

        if (!isProcessing && !finished) {
            if (hud) hud.remove();
            return;
        }

        if (!hud) {
            hud = document.createElement("div");
            hud.id = HUD_ID;
            hud.style.cssText = `
                position: fixed;
                bottom: 105px;
                right: 24px;
                z-index: 999999;
                background: var(--spice-card, #181818);
                color: var(--spice-text, #ffffff);
                border: 1px solid ${accentColor};
                border-radius: 10px;
                padding: 14px 18px;
                min-width: 260px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                font-family: inherit;
                transition: opacity 0.25s ease;
            `;
            document.body.appendChild(hud);
        } else {
            hud.style.borderColor = accentColor;
        }

        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        const statusTitle = finished
            ? mode === "remove"
                ? "Brani rimossi dai Preferiti!"
                : "Aggiunta completata!"
            : mode === "remove"
            ? "Rimozione dai Preferiti..."
            : "Aggiunta ai Preferiti in corso...";

        const symbol = mode === "remove" ? "✕" : "♥";

        hud.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 600; color: var(--spice-text, #ffffff);">
                    ${statusTitle}
                </span>
                <span style="font-size: 14px; font-weight: 800; color: ${accentColor}; white-space: nowrap;">
                    ${symbol} ${current} / ${total}
                </span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.15); border-radius: 999px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: ${accentColor}; transition: width 0.2s ease;"></div>
            </div>
        `;

        if (finished) {
            setTimeout(() => {
                const el = document.getElementById(HUD_ID);
                if (el) el.remove();
            }, 2200);
        }
    }

    /**
     * Recupera tutti gli URI dei brani tramite le API GraphQL interne di Spotify
     */
    async function fetchAlbumTrackUris(albumUri) {
        const { Definitions, Request } = Spicetify.GraphQL;
        const queryDef = Definitions.getAlbum || Definitions.queryAlbumTracks;

        if (!queryDef) {
            throw new Error("Definizione GraphQL per gli album non trovata.");
        }

        let trackUris = [];
        let offset = 0;
        const limit = 300;
        let totalCount = Infinity;

        while (offset < totalCount) {
            const response = await Request(queryDef, {
                uri: albumUri,
                locale: "",
                offset: offset,
                limit: limit,
            });

            const albumUnion = response?.data?.albumUnion;
            const tracksContainer = albumUnion?.tracksV2 || albumUnion?.tracks;

            if (!tracksContainer || !Array.isArray(tracksContainer.items)) {
                console.error("[LikeAlbumInOrder] Risposta GraphQL inattesa:", response);
                throw new Error("Impossibile leggere la lista dei brani dalla risposta GraphQL.");
            }

            const items = tracksContainer.items;
            const uris = items
                .map((item) => item?.track?.uri || item?.uri)
                .filter((uri) => typeof uri === "string" && uri.startsWith("spotify:track:"));

            trackUris.push(...uris);

            totalCount = tracksContainer.totalCount ?? uris.length;
            if (items.length === 0) break;
            offset += items.length;
        }

        return trackUris;
    }

    /**
     * Aggiunge i brani dell'album ai Preferiti dall'ultimo al primo
     */
    async function addAlbumReversed(albumUri) {
        if (isProcessing) {
            Spicetify.showNotification("Operazione già in corso, attendi il completamento!", true);
            return;
        }

        const delayMs = getDelayMs();
        isProcessing = true;
        currentProgressText = "...";
        updateProgressUI(0, 0, false, "add");

        try {
            const trackUris = await fetchAlbumTrackUris(albumUri);

            if (trackUris.length === 0) {
                Spicetify.showNotification("Nessun brano trovato in questo album.", true);
                isProcessing = false;
                currentProgressText = null;
                updateProgressUI(0, 0, false, "add");
                return;
            }

            const reversedUris = [...trackUris].reverse();
            const total = reversedUris.length;

            for (let i = 0; i < total; i++) {
                const trackUri = reversedUris[i];
                const step = i + 1;

                currentProgressText = `♥ ${step}/${total}`;
                updateProgressUI(step, total, false, "add");

                await Spicetify.Platform.LibraryAPI.add({ uris: [trackUri] });

                if (i < total - 1) {
                    await sleep(delayMs);
                }
            }

            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(total, total, true, "add");
        } catch (error) {
            console.error("[LikeAlbumInOrder] Errore dettagliato:", error);
            Spicetify.showNotification(`Errore: ${error.message || "Impossibile recuperare i brani"}`, true);
            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(0, 0, false, "add");
        }
    }

    /**
     * Rimuove tutti i brani dell'album dai Preferiti
     */
    async function removeAlbumTracksFromLikes(albumUri) {
        if (isProcessing) {
            Spicetify.showNotification("Operazione già in corso, attendi il completamento!", true);
            return;
        }

        isProcessing = true;
        currentProgressText = "...";
        updateProgressUI(0, 0, false, "remove");

        try {
            const trackUris = await fetchAlbumTrackUris(albumUri);

            if (trackUris.length === 0) {
                Spicetify.showNotification("Nessun brano trovato in questo album.", true);
                isProcessing = false;
                currentProgressText = null;
                updateProgressUI(0, 0, false, "remove");
                return;
            }

            const total = trackUris.length;

            for (let i = 0; i < total; i++) {
                const trackUri = trackUris[i];
                const step = i + 1;

                currentProgressText = `✕ ${step}/${total}`;
                updateProgressUI(step, total, false, "remove");

                await Spicetify.Platform.LibraryAPI.remove({ uris: [trackUri] });

                if (i < total - 1) {
                    await sleep(REMOVE_STEP_DELAY_MS);
                }
            }

            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(total, total, true, "remove");
        } catch (error) {
            console.error("[LikeAlbumInOrder] Errore rimozione:", error);
            Spicetify.showNotification(`Errore: ${error.message || "Impossibile rimuovere i brani"}`, true);
            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(0, 0, false, "remove");
        }
    }

    /**
     * Finestra di dialogo generica (usata sia per aggiunta sul "+" sia per conferma rimozione)
     */
    function showCustomModal({ title, descriptionHtml, confirmText, cancelText, confirmColor, onConfirm }) {
        const existingModal = document.getElementById(MODAL_ID);
        if (existingModal) existingModal.remove();

        const overlay = document.createElement("div");
        overlay.id = MODAL_ID;
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.72);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            backdrop-filter: blur(3px);
        `;

        const dialog = document.createElement("div");
        dialog.style.cssText = `
            background: var(--spice-card, #282828);
            color: var(--spice-text, #ffffff);
            border-radius: 12px;
            padding: 24px;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
            font-family: inherit;
        `;

        dialog.innerHTML = `
            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: var(--spice-text, #ffffff);">
                ${title}
            </h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: var(--spice-subtext, #b3b3b3);">
                ${descriptionHtml}
            </p>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="${MODAL_ID}-cancel" style="
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 9999px;
                    color: var(--spice-text, #ffffff);
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    padding: 8px 20px;
                ">${cancelText}</button>
                <button id="${MODAL_ID}-confirm" style="
                    background: ${confirmColor || "#1ed760"};
                    border: none;
                    border-radius: 9999px;
                    color: #000000;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    padding: 8px 20px;
                ">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const closeModal = () => {
            overlay.remove();
            document.removeEventListener("keydown", onKeyDown);
        };

        const onKeyDown = (e) => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", onKeyDown);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });

        dialog.querySelector(`#${MODAL_ID}-cancel`).addEventListener("click", closeModal);
        dialog.querySelector(`#${MODAL_ID}-confirm`).addEventListener("click", () => {
            closeModal();
            onConfirm();
        });
    }

    function triggerConfirmModalOnce(albumUri) {
        if (!getBoolSetting(STORAGE_KEYS.ASK_ON_SAVE, DEFAULT_SETTINGS.askOnSave)) return;

        const now = Date.now();
        if (now - lastModalTriggerTime < 2000) return;
        if (isProcessing) return;

        lastModalTriggerTime = now;
        showCustomModal({
            title: "Aggiungere i brani ai Preferiti?",
            descriptionHtml:
                "Hai salvato l'album nella libreria. Vuoi aggiungere anche tutti i singoli brani ai <b>Brani che ti piacciono</b> mantenendo l'ordine dell'album (dall'ultimo al primo)?",
            cancelText: "No, solo l'album",
            confirmText: "Sì, aggiungi i brani",
            confirmColor: "#1ed760",
            onConfirm: () => addAlbumReversed(albumUri),
        });
    }

    function handleRemoveClick(albumUri) {
        if (getBoolSetting(STORAGE_KEYS.CONFIRM_REMOVE, DEFAULT_SETTINGS.confirmRemove)) {
            showCustomModal({
                title: "Rimuovere i brani dai Preferiti?",
                descriptionHtml:
                    "Vuoi rimuovere tutti i brani di questo album dalla tua lista <b>Brani che ti piacciono</b>?",
                cancelText: "Annulla",
                confirmText: "Sì, rimuovi tutti",
                confirmColor: "#f15e6c",
                onConfirm: () => removeAlbumTracksFromLikes(albumUri),
            });
        } else {
            removeAlbumTracksFromLikes(albumUri);
        }
    }

    /**
     * Restituisce l'URI dell'album se siamo nella pagina di un album
     */
    function getCurrentAlbumUri() {
        const pathname = Spicetify.Platform?.History?.location?.pathname || "";
        if (!pathname.startsWith("/album/")) return null;
        const albumId = pathname.split("/album/")[1]?.split("/")[0]?.split("?")[0];
        return albumId ? `spotify:album:${albumId}` : null;
    }

    /**
     * Trova la barra delle azioni dell'album
     */
    function findActionBar() {
        const direct =
            document.querySelector('[data-testid="action-bar-row"]') ||
            document.querySelector(".main-actionBar-ActionBarRow") ||
            document.querySelector(".main-actionBar-ActionBar");
        if (direct) return direct;

        const playBtn = document.querySelector(
            'main [data-testid="play-button"], .Root__main-view [data-testid="play-button"]'
        );
        if (playBtn) {
            return (
                playBtn.closest('[role="presentation"]') ||
                playBtn.parentElement?.parentElement ||
                playBtn.parentElement
            );
        }

        return null;
    }

    /**
     * METODO 1: Intercetta la chiamata API di salvataggio album in libreria
     */
    try {
        const libApi = Spicetify.Platform.LibraryAPI;
        if (libApi && typeof libApi.add === "function") {
            const origAdd = libApi.add.bind(libApi);
            libApi.add = async function (...args) {
                const result = await origAdd(...args);
                try {
                    const firstArg = args[0];
                    const uris = Array.isArray(firstArg?.uris)
                        ? firstArg.uris
                        : Array.isArray(firstArg)
                        ? firstArg
                        : [];
                    const addedAlbumUri = uris.find(
                        (u) => typeof u === "string" && u.startsWith("spotify:album:")
                    );
                    if (addedAlbumUri) {
                        setTimeout(() => triggerConfirmModalOnce(addedAlbumUri), 150);
                    }
                } catch (e) {
                    console.warn("[LikeAlbumInOrder] Errore hook LibraryAPI.add:", e);
                }
                return result;
            };
        }
    } catch (e) {
        console.warn("[LikeAlbumInOrder] Impossibile registrare hook su LibraryAPI:", e);
    }

    /**
     * METODO 2: Intercetta il clic sul pulsante "+" nella barra azioni dell'album
     */
    document.addEventListener(
        "click",
        (event) => {
            const albumUri = getCurrentAlbumUri();
            if (!albumUri) return;

            const clickedBtn = event.target.closest("button");
            if (
                !clickedBtn ||
                clickedBtn.id === LIKE_BUTTON_ID ||
                clickedBtn.id === UNLIKE_BUTTON_ID
            ) {
                return;
            }

            if (
                clickedBtn.closest(`#${MODAL_ID}`) ||
                clickedBtn.closest('[role="row"], [data-testid="tracklist-row"]')
            ) {
                return;
            }

            const actionBar = findActionBar();
            if (!actionBar || !actionBar.contains(clickedBtn)) return;

            const testId = (clickedBtn.dataset.testid || "").toLowerCase();
            const ariaLabel = (clickedBtn.getAttribute("aria-label") || "").toLowerCase();
            const encoreId = (clickedBtn.getAttribute("data-encore-id") || "").toLowerCase();
            const ariaChecked = clickedBtn.getAttribute("aria-checked");
            const ariaPressed = clickedBtn.getAttribute("aria-pressed");
            const btnText = (clickedBtn.textContent || "").trim();

            if (
                testId === "play-button" ||
                encoreId === "buttonprimary" ||
                ariaLabel.includes("play") ||
                ariaLabel.includes("riproduci") ||
                ariaLabel.includes("pausa") ||
                ariaLabel.includes("pause")
            ) {
                return;
            }

            if (
                testId === "more-button" ||
                testId === "context-menu-button" ||
                testId === "shuffle-button" ||
                testId === "download-button" ||
                ariaLabel.includes("shuffle") ||
                ariaLabel.includes("casuale") ||
                ariaLabel.includes("scarica") ||
                ariaLabel.includes("download") ||
                ariaLabel.includes("altre opzioni") ||
                ariaLabel.includes("more options") ||
                ariaLabel.includes("altro per") ||
                clickedBtn.getAttribute("role") === "combobox" ||
                clickedBtn.getAttribute("aria-haspopup") === "listbox" ||
                btnText.length > 0
            ) {
                return;
            }

            const isRemoving =
                ariaChecked === "true" ||
                ariaPressed === "true" ||
                ariaLabel.includes("rimuovi") ||
                ariaLabel.includes("remove");

            if (!isRemoving) {
                setTimeout(() => {
                    triggerConfirmModalOnce(albumUri);
                }, 150);
            }
        },
        true
    );

    /**
     * 1. Voci nel menu contestuale (Tasto destro sull'album o menu '...')
     */
    const MENU_ADD_LABEL = "Aggiungi brani ai Preferiti (in ordine)";
    const MENU_REMOVE_LABEL = "Rimuovi tutti i brani dai Preferiti";

    function isAlbumUri(uris) {
        if (uris.length !== 1) return false;
        const uriObj = Spicetify.URI.fromString(uris[0]);
        return uriObj.type === Spicetify.URI.Type.ALBUM;
    }

    new Spicetify.ContextMenu.Item(
        MENU_ADD_LABEL,
        (uris) => addAlbumReversed(uris[0]),
        isAlbumUri,
        "heart"
    ).register();

    new Spicetify.ContextMenu.Item(
        MENU_REMOVE_LABEL,
        (uris) => handleRemoveClick(uris[0]),
        isAlbumUri,
        "x"
    ).register();

    /**
     * Colora di verde e rosso anche le voci dentro il menu dei 3 puntini (...)
     */
    function colorizeContextMenuItems() {
        const menuItems = document.querySelectorAll('#context-menu button[role="menuitem"], [role="menu"] button[role="menuitem"]');
        menuItems.forEach((btn) => {
            const text = (btn.textContent || "").trim();
            if (text === MENU_ADD_LABEL) {
                btn.style.color = "#1ed760";
                btn.querySelectorAll("span, svg").forEach((el) => (el.style.color = "#1ed760"));
            } else if (text === MENU_REMOVE_LABEL) {
                btn.style.color = "#f15e6c";
                btn.querySelectorAll("span, svg").forEach((el) => (el.style.color = "#f15e6c"));
            }
        });
    }

    /**
     * 2. Pulsanti colorati nella barra dell'album (accanto a Play, '+' e '...')
     */
    function styleActionButton(btn, colorHex, bgRgba) {
        btn.style.cssText = `
            background: ${bgRgba};
            border: 1px solid ${colorHex};
            border-radius: 9999px;
            color: ${colorHex};
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 32px;
            padding: 0 14px;
            margin-left: 8px;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
            transition: all 0.15s ease;
        `;

        btn.addEventListener("mouseenter", () => {
            btn.style.background = colorHex;
            btn.style.color = "#000000";
            btn.style.transform = "scale(1.04)";
        });

        btn.addEventListener("mouseleave", () => {
            btn.style.background = bgRgba;
            btn.style.color = colorHex;
            btn.style.transform = "scale(1)";
        });
    }

    function createLikeButton(albumUri) {
        const btn = document.createElement("button");
        btn.id = LIKE_BUTTON_ID;
        btn.dataset.albumUri = albumUri;
        btn.title = "Aggiungi tutti i brani ai Preferiti in ordine (dall'ultimo al primo)";
        btn.innerHTML = DEFAULT_LIKE_BTN_HTML;
        styleActionButton(btn, "#1ed760", "rgba(30, 215, 96, 0.12)");
        btn.addEventListener("click", () => {
            if (btn.dataset.albumUri) addAlbumReversed(btn.dataset.albumUri);
        });
        return btn;
    }

    function createUnlikeButton(albumUri) {
        const btn = document.createElement("button");
        btn.id = UNLIKE_BUTTON_ID;
        btn.dataset.albumUri = albumUri;
        btn.title = "Rimuovi tutti i brani di questo album dai Preferiti";
        btn.innerHTML = DEFAULT_UNLIKE_BTN_HTML;
        styleActionButton(btn, "#f15e6c", "rgba(241, 94, 108, 0.12)");
        btn.addEventListener("click", () => {
            if (btn.dataset.albumUri) handleRemoveClick(btn.dataset.albumUri);
        });
        return btn;
    }

    function checkAndInjectAlbumButtons() {
        colorizeContextMenuItems(); // Applica i colori al menu '...' quando viene aperto

        // NOTA: Se preferisci avere i pulsanti SOLO dentro il menu dei 3 puntini (...),
        // ti basta togliere il commento alla riga qui sotto:
        // return;

        const albumUri = getCurrentAlbumUri();
        if (!albumUri) return;

        const actionBar = findActionBar();
        if (!actionBar) return;

        // Cerca il pulsante '...' o il pulsante Play dentro la barra azioni (senza dipendere dal tag <main>)
        const anchorBtn =
            actionBar.querySelector('[data-testid="more-button"]') ||
            actionBar.querySelector('[data-testid="context-menu-button"]') ||
            actionBar.querySelector('[data-testid="play-button"]');

        const container = anchorBtn ? anchorBtn.parentElement : actionBar;

        let likeBtn = document.getElementById(LIKE_BUTTON_ID);
        if (likeBtn) {
            likeBtn.dataset.albumUri = albumUri;
        } else {
            likeBtn = createLikeButton(albumUri);
            if (anchorBtn && anchorBtn.nextSibling) {
                container.insertBefore(likeBtn, anchorBtn.nextSibling);
            } else {
                container.appendChild(likeBtn);
            }
        }

        let unlikeBtn = document.getElementById(UNLIKE_BUTTON_ID);
        if (unlikeBtn) {
            unlikeBtn.dataset.albumUri = albumUri;
        } else {
            unlikeBtn = createUnlikeButton(albumUri);
            if (likeBtn.nextSibling) {
                container.insertBefore(unlikeBtn, likeBtn.nextSibling);
            } else {
                container.appendChild(unlikeBtn);
            }
        }
    }

    /**
     * SEZIONE NELLE IMPOSTAZIONI DI SPOTIFY (/preferences)
     */
    function checkAndInjectSettings() {
        const pathname = Spicetify.Platform?.History?.location?.pathname || "";
        if (pathname !== "/preferences") return;

        if (document.getElementById(SETTINGS_SECTION_ID)) return;

        // Individua il contenitore principale della pagina Impostazioni di Spotify
        const settingsHeading = document.querySelector(
            'main h1, .Root__main-view h1, [data-testid="settings-page"] h1'
        );
        const settingsContainer =
            document.querySelector('[data-testid="settings-page"]') ||
            document.querySelector(".x-settings-container") ||
            settingsHeading?.parentElement;

        if (!settingsContainer) return;

        const section = document.createElement("div");
        section.id = SETTINGS_SECTION_ID;
        section.style.cssText = `
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-family: inherit;
        `;

        const currentDelay = getDelayMs();
        const askOnSave = getBoolSetting(STORAGE_KEYS.ASK_ON_SAVE, DEFAULT_SETTINGS.askOnSave);
        const confirmRemove = getBoolSetting(STORAGE_KEYS.CONFIRM_REMOVE, DEFAULT_SETTINGS.confirmRemove);

        section.innerHTML = `
            <h2 style="font-size: 18px; font-weight: 700; color: var(--spice-text, #ffffff); margin: 0 0 16px 0;">
                Like Album In Order (Estensione)
            </h2>

            <!-- Riga 1: Delay in ms -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 0;">
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500; color: var(--spice-text, #ffffff);">
                        Ritardo tra il salvataggio dei brani (ms)
                    </div>
                    <div style="font-size: 12px; color: var(--spice-subtext, #b3b3b3); margin-top: 2px;">
                        Pausa in millisecondi tra un brano e l'altro per garantire che Spotify mantenga l'ordine (consigliato: 2000 ms).
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input
                        id="${SETTINGS_SECTION_ID}-delay"
                        type="number"
                        min="500"
                        max="10000"
                        step="50"
                        value="${currentDelay}"
                        style="
                            width: 90px;
                            padding: 6px 10px;
                            border-radius: 6px;
                            border: 1px solid rgba(255, 255, 255, 0.25);
                            background: var(--spice-card, #282828);
                            color: var(--spice-text, #ffffff);
                            font-size: 14px;
                            font-weight: 600;
                            text-align: right;
                        "
                    />
                    <span style="font-size: 13px; color: var(--spice-subtext, #b3b3b3);">ms</span>
                </div>
            </div>

            <!-- Riga 2: Chiedi quando si salva un album con il "+" -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 0;">
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500; color: var(--spice-text, #ffffff);">
                        Chiedi di aggiungere i brani quando salvi un album con il "+"
                    </div>
                    <div style="font-size: 12px; color: var(--spice-subtext, #b3b3b3); margin-top: 2px;">
                        Mostra una finestra di conferma quando clicchi sul pulsante "+" per salvare un album nella libreria.
                    </div>
                </div>
                <input
                    id="${SETTINGS_SECTION_ID}-ask-save"
                    type="checkbox"
                    ${askOnSave ? "checked" : ""}
                    style="width: 18px; height: 18px; accent-color: #1ed760; cursor: pointer;"
                />
            </div>

            <!-- Riga 3: Conferma prima di rimuovere tutti i Like -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 0;">
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500; color: var(--spice-text, #ffffff);">
                        Chiedi conferma prima di rimuovere i brani dai Preferiti
                    </div>
                    <div style="font-size: 12px; color: var(--spice-subtext, #b3b3b3); margin-top: 2px;">
                        Evita rimozioni accidentali quando premi il pulsante "Rimuovi Like".
                    </div>
                </div>
                <input
                    id="${SETTINGS_SECTION_ID}-confirm-remove"
                    type="checkbox"
                    ${confirmRemove ? "checked" : ""}
                    style="width: 18px; height: 18px; accent-color: #1ed760; cursor: pointer;"
                />
            </div>
        `;

        settingsContainer.appendChild(section);

        // Event listener per salvare subito le modifiche
        const delayInput = section.querySelector(`#${SETTINGS_SECTION_ID}-delay`);
        delayInput.addEventListener("change", () => {
            const saved = setDelayMs(delayInput.value);
            delayInput.value = saved;
            Spicetify.showNotification(`Ritardo impostato a ${saved} ms`);
        });

        const askSaveCheckbox = section.querySelector(`#${SETTINGS_SECTION_ID}-ask-save`);
        askSaveCheckbox.addEventListener("change", () => {
            setBoolSetting(STORAGE_KEYS.ASK_ON_SAVE, askSaveCheckbox.checked);
        });

        const confirmRemoveCheckbox = section.querySelector(`#${SETTINGS_SECTION_ID}-confirm-remove`);
        confirmRemoveCheckbox.addEventListener("change", () => {
            setBoolSetting(STORAGE_KEYS.CONFIRM_REMOVE, confirmRemoveCheckbox.checked);
        });
    }

    // --- OSSERVATORI DI NAVIGAZIONE E DOM ---
    function onPageUpdate() {
        checkAndInjectAlbumButtons();
        checkAndInjectSettings();
    }

    Spicetify.Platform.History.listen(() => {
        setTimeout(onPageUpdate, 250);
    });

    const observer = new MutationObserver(() => {
        onPageUpdate();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    onPageUpdate();
})();