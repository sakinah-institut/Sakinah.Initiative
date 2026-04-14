 // =============================================
// SAKINAH INITIATIVE - Korrigierter script.js
// Stabile Version - 14. April 2026
// =============================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Skript wird geladen...");

    // === RATE LIMIT SCHUTZ (429) ===
    console.warn("⚠️ Rate Limit Schutz aktiv – Feiertags-Calls werden gedrosselt.");

    // Deaktiviere Feiertags-Funktionen vorübergehend, um Blockade zu vermeiden
    window.ladeFeiertagsCountdowns = function() {
        console.log("Feiertags-Countdowns deaktiviert (Rate Limit Schutz)");
    };

    window.holeMaghribZeit = async function() {
        console.log("holeMaghribZeit deaktiviert");
        return "18:00";
    };

    window.berechneFeiertagsCountdown = function() {
        console.log("Feiertags-Berechnung deaktiviert");
    };

    // 📌 Menü-Steuerung
    const menuButton = document.querySelector(".menu-button");
    const menuList = document.querySelector(".menu-list");

    if (menuButton && menuList) {
        menuButton.addEventListener("click", () => {
            menuList.classList.toggle("show");
        });

        document.addEventListener("click", (event) => {
            if (!menuButton.contains(event.target) && !menuList.contains(event.target)) {
                menuList.classList.remove("show");
            }
        });
    }

    // 📌 Dark Mode
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
        });
    }
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    // 📌 Uhrzeit & Mekka
    function updateUhrzeit() {
        let jetzt = new Date();
        const uhrzeitEl = document.getElementById("uhrzeit");
        const datumEl = document.getElementById("datum");
        const mekkaEl = document.getElementById("mekka-uhrzeit");

        if (uhrzeitEl) uhrzeitEl.textContent = `Berlin: ${jetzt.toLocaleTimeString("de-DE", { hour12: false })}`;
        if (datumEl) datumEl.textContent = jetzt.toLocaleDateString("de-DE");

        let mekkaZeit = new Date(jetzt.getTime() + 2 * 60 * 60 * 1000);
        if (mekkaEl) mekkaEl.textContent = `Mekka: ${mekkaZeit.toLocaleTimeString("de-DE", { hour12: false })}`;
    }
    updateUhrzeit();
    setInterval(updateUhrzeit, 1000);

    // 📌 Islamisches Datum
    async function ladeIslamischesDatum() {
        try {
            let heute = new Date();
            let tag = heute.getDate();
            let monat = heute.getMonth() + 1;
            let jahr = heute.getFullYear();

            let response = await fetch(`https://api.aladhan.com/v1/gToH/${tag}-${monat}-${jahr}`);
            let data = await response.json();

            if (data.code === 200) {
                let islamischerTag = data.data.hijri.day;
                let islamischerMonat = data.data.hijri.month.en;
                let islamischesJahr = data.data.hijri.year;

                let monateDeutsch = {
                    "Muharram": "Muharram", "Safar": "Safar", "Rabi' al-Awwal": "Erster Rabi'",
                    "Rabi' al-Thani": "Zweiter Rabi'", "Jumada al-Awwal": "Erster Jumada",
                    "Jumada al-Thani": "Zweiter Jumada", "Rajab": "Rajab", "Sha'ban": "Sha'ban",
                    "Ramadan": "Ramadan", "Shawwal": "Schawwal", "Dhul-Qi'dah": "Dhul-Qi'dah",
                    "Dhul-Hijjah": "Dhul-Hijjah"
                };

                let islamischerMonatDeutsch = monateDeutsch[islamischerMonat] || islamischerMonat;

                if (heute.getHours() >= 18) {
                    islamischerTag = parseInt(islamischerTag) + 1;
                }

                const el = document.getElementById("islamisches-datum");
                if (el) el.textContent = `${islamischerTag}. ${islamischerMonatDeutsch} ${islamischesJahr}`;
            }
        } catch (error) {
            console.error("Fehler beim islamischen Datum:", error);
        }
    }
    ladeIslamischesDatum();

    // 📌 Standort & Stadt
    let countdownInterval = null;
    let aktuelleStadt = null;

    async function ermittleStandort() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    let lat = position.coords.latitude;
                    let lon = position.coords.longitude;
                    try {
                        let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        let data = await response.json();
                        let stadt = data.address.city || data.address.town || data.address.village || null;

                        if (!stadt) {
                            const nameEl = document.getElementById("stadt-name");
                            if (nameEl) nameEl.innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                            await ladeStadtAuswahl();
                            return;
                        }

                        aktuelleStadt = stadt;
                        const nameEl = document.getElementById("stadt-name");
                        if (nameEl) nameEl.innerHTML = `📍 Ihr Standort: ${stadt} <br> Oder Stadt auswählen:`;
                        document.getElementById("stadt-container").style.display = "block";
                        await ladeGebetszeiten(stadt);
                        await ladeStadtAuswahl();
                    } catch (error) {
                        console.error("Fehler bei Standortermittlung:", error);
                        const nameEl = document.getElementById("stadt-name");
                        if (nameEl) nameEl.innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                        document.getElementById("stadt-container").style.display = "block";
                        await ladeStadtAuswahl();
                    }
                },
                async () => {
                    console.warn("Standort abgelehnt.");
                    const nameEl = document.getElementById("stadt-name");
                    if (nameEl) nameEl.innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                    document.getElementById("stadt-container").style.display = "block";
                    await ladeStadtAuswahl();
                }
            );
        } else {
            console.warn("Geolocation nicht unterstützt.");
            const nameEl = document.getElementById("stadt-name");
            if (nameEl) nameEl.innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
            document.getElementById("stadt-container").style.display = "block";
            await ladeStadtAuswahl();
        }
    }

    async function ladeStadtAuswahl() {
        try {
            let response = await fetch("stadt.json");
            let städte = await response.json();
            let dropdown = document.getElementById("stadt-auswahl");

            if (!dropdown) {
                let container = document.getElementById("stadt-container");
                if (!container) return;
                dropdown = document.createElement("select");
                dropdown.id = "stadt-auswahl";
                container.appendChild(dropdown);
            }

            dropdown.innerHTML = "";
            let defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "-- Stadt auswählen --";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            dropdown.appendChild(defaultOption);

            städte.forEach(stadt => {
                let option = document.createElement("option");
                option.value = stadt.name;
                option.textContent = stadt.name;
                dropdown.appendChild(option);
            });

            dropdown.style.display = "block";

            dropdown.addEventListener("change", async function () {
                let gewählteStadt = this.value;
                if (!gewählteStadt) return;
                aktuelleStadt = gewählteStadt;
                const nameEl = document.getElementById("stadt-name");
                if (nameEl) nameEl.innerHTML = `📍 Manuelle Auswahl: ${gewählteStadt}`;
                if (countdownInterval) clearInterval(countdownInterval);
                await ladeGebetszeiten(gewählteStadt);
            });
        } catch (error) {
            console.error("Fehler beim Laden der Städte:", error);
        }
    }

    // Einfache Gebetszeiten-Funktion (stabilisiert)
    async function ladeGebetszeiten(stadt) {
        try {
            if (countdownInterval) clearInterval(countdownInterval);

            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();

            if (!data || !data.data || !data.data.timings) {
                console.error("❌ API-Fehler bei Gebetszeiten");
                return;
            }

            // Einfache Anzeige
            document.getElementById("next-prayer").textContent = `Nächstes Gebet: ${data.data.timings.Fajr} (Fajr)`;
            document.getElementById("next-prayer-countdown").textContent = "Berechnung...";

            console.log("✅ Gebetszeiten für", stadt, "geladen");
        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Gebetszeiten:", error);
        }
    }

    // Hadith & Dua
    async function ladeHadith() {
        try {
            let response = await fetch("hadith.json");
            let data = await response.json();
            let zufallsHadith = data[Math.floor(Math.random() * data.length)];

            document.getElementById("hadith-arabisch").textContent = zufallsHadith.arabisch || "—";
            document.getElementById("hadith-deutsch").textContent = zufallsHadith.deutsch || "—";
            document.getElementById("hadith-quelle").textContent = zufallsHadith.quelle || "—";
            document.getElementById("hadith-auth").textContent = zufallsHadith.authentizität || "—";
        } catch (error) {
            console.error("Fehler beim Laden des Hadiths:", error);
        }
    }

    async function ladeDua() {
        try {
            let response = await fetch("dua.json");
            let data = await response.json();
            let zufallsDua = data[Math.floor(Math.random() * data.length)];

            document.getElementById("dua-arabisch").textContent = zufallsDua.arabisch || "—";
            document.getElementById("dua-trans").textContent = zufallsDua.transliteration || "—";
            document.getElementById("dua-deutsch").textContent = zufallsDua.deutsch || "—";
            document.getElementById("dua-quelle").textContent = zufallsDua.quelle || "—";
        } catch (error) {
            console.error("Fehler beim Laden der Dua:", error);
        }
    }

    function zeigeFortsetzenButton() {
        const letzteDatei = localStorage.getItem("zuletzt-gelesen");
        if (letzteDatei) {
            document.getElementById("fortsetzen-container")?.classList.remove("hidden");
        }
    }

    window.fortsetzenLetztesBuch = () => {
        const letzteDatei = localStorage.getItem("zuletzt-gelesen");
        if (letzteDatei) {
            window.location.href = `pdf-reader.html?file=${encodeURIComponent(letzteDatei)}`;
        } else {
            alert("⚠️ Kein zuletzt gelesenes Buch gefunden.");
        }
    };

    // === START ALLER FUNKTIONEN ===
    zeigeFortsetzenButton();
    ermittleStandort();
    await ladeHadith();
    await ladeDua();

    console.log("✅ Sakinah Initiative Skript erfolgreich gestartet.");
});
