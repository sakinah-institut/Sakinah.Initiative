// =============================================
// SAKINAH INITIATIVE - Kompletter script.js
// Korrigiert und angepasst an die neue HTML
// =============================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Skript wird geladen...");

    // === RATE LIMIT SCHUTZ ===
    console.warn("⚠️ Rate Limit Schutz aktiv – Feiertags-Calls werden gedrosselt.");

    // Deaktiviere Feiertags-Funktionen vorübergehend
    window.ladeFeiertagsCountdowns = function() {
        console.log("Feiertags-Countdowns deaktiviert (Rate Limit)");
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

    // Standort & Stadt
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

                        const nameEl = document.getElementById("stadt-name");
                        if (!stadt) {
                            if (nameEl) nameEl.innerHTML = "❌ Standort konnte nicht ermittelt werden.<br> Bitte Stadt manuell auswählen:";
                            await ladeStadtAuswahl();
                            return;
                        }

                        aktuelleStadt = stadt;
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

    // Vollständige Gebetszeiten-Funktion (wie in deiner Originalversion)
    async function ladeGebetszeiten(stadt) {
        try {
            if (countdownInterval) clearInterval(countdownInterval);

            let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${stadt}&country=DE&method=3`);
            let data = await response.json();

            if (!data || !data.data || !data.data.timings) {
                console.error("❌ API-Fehler: Gebetszeiten konnten nicht geladen werden!");
                return;
            }

            function zeitAnpassen(zeit, minuten) {
                let [h, m] = zeit.split(":").map(Number);
                let neueZeit = new Date();
                neueZeit.setHours(h, m + minuten);
                return neueZeit.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false });
            }

            let prayerTimes = {
                "Fajr": zeitAnpassen(data.data.timings.Fajr, 0),
                "Shuruk": zeitAnpassen(data.data.timings.Sunrise, 0),
                "Duha": zeitAnpassen(data.data.timings.Sunrise, 15),
                "Dhuhr": zeitAnpassen(data.data.timings.Dhuhr, 0),
                "Asr": zeitAnpassen(data.data.timings.Asr, 0),
                "Maghrib": zeitAnpassen(data.data.timings.Maghrib, 1),
                "Isha": zeitAnpassen(data.data.timings.Isha, 0),
                "Duha-Ende": zeitAnpassen(data.data.timings.Dhuhr, -10)
            };

            let { mitternacht, letztesDrittel } = berechneMitternachtUndDrittel(prayerTimes.Fajr, prayerTimes.Maghrib);

            prayerTimes["Letztes Drittel"] = letztesDrittel;
            prayerTimes["Mitternacht"] = mitternacht;
            prayerTimes["Mitternacht-Ende"] = zeitAnpassen(mitternacht, 1);

            // Setze Zeiten
            Object.keys(prayerTimes).forEach(prayer => {
                let element = document.getElementById(prayer.toLowerCase().replace(/ /g, "-"));
                if (element) element.textContent = prayerTimes[prayer].slice(0, 5);
            });

            updateGebetszeitenCountdown(prayerTimes);

            if (countdownInterval) clearInterval(countdownInterval);
            countdownInterval = setInterval(() => updateGebetszeitenCountdown(prayerTimes), 1000);

        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Gebetszeiten:", error);
        }
    }

    // Berechnung Mitternacht & letztes Drittel
    function berechneMitternachtUndDrittel(fajr, maghrib) {
        let [fajrH, fajrM] = fajr.split(":").map(Number);
        let [maghribH, maghribM] = maghrib.split(":").map(Number);

        let maghribZeit = maghribH * 60 + maghribM;
        let fajrZeit = fajrH * 60 + fajrM;

        if (fajrZeit < maghribZeit) fajrZeit += 24 * 60;

        let nachtDauer = fajrZeit - maghribZeit;

        let mitternachtMinuten = maghribZeit + (nachtDauer / 2);
        let mitternachtH = Math.floor(mitternachtMinuten / 60) % 24;
        let mitternachtM = Math.floor(mitternachtMinuten % 60);

        let letztesDrittelMinuten = maghribZeit + (2 * (nachtDauer / 3));
        let letztesDrittelH = Math.floor(letztesDrittelMinuten / 60) % 24;
        let letztesDrittelM = Math.floor(letztesDrittelMinuten % 60);

        return {
            mitternacht: `${String(mitternachtH).padStart(2, '0')}:${String(mitternachtM).padStart(2, '0')}`,
            letztesDrittel: `${String(letztesDrittelH).padStart(2, '0')}:${String(letztesDrittelM).padStart(2, '0')}`
        };
    }

    // Gebetszeiten-Countdown
    function updateGebetszeitenCountdown(prayerTimes) {
        let jetzt = new Date();
        let currentTime = jetzt.getHours() * 60 + jetzt.getMinutes();
        let currentSeconds = jetzt.getSeconds();

        let nextPrayer = null, nextPrayerTime = null, currentPrayer = null, currentPrayerEndTime = null;

        for (let i = 0; i < prayerOrder.length - 1; i++) {
            let prayer = prayerOrder[i];
            if (!prayerTimes[prayer]) continue;

            let [startH, startM] = prayerTimes[prayer].split(":").map(Number);
            let prayerStartMinutes = startH * 60 + startM;

            let [endH, endM] = prayerTimes[prayerOrder[i + 1]].split(":").map(Number);
            let prayerEndMinutes = endH * 60 + endM;

            if (prayerEndMinutes < prayerStartMinutes) prayerEndMinutes += 24 * 60;

            let countdownElement = document.getElementById(`${prayer.toLowerCase().replace(/ /g, "-")}-countdown`);
            if (!countdownElement) continue;

            if (currentTime < prayerStartMinutes) {
                let remainingMinutes = prayerStartMinutes - currentTime - 1;
                let remainingSeconds = 60 - currentSeconds;
                countdownElement.textContent = `Beginnt in: ${formatTime(remainingMinutes, remainingSeconds, false)}`;

                if (!nextPrayer) {
                    nextPrayer = prayer;
                    nextPrayerTime = prayerStartMinutes;
                }
            } else if (currentTime >= prayerStartMinutes && currentTime < prayerEndMinutes) {
                let remainingMinutes = prayerEndMinutes - currentTime - 1;
                let remainingSeconds = 60 - currentSeconds;
                countdownElement.textContent = `Begonnen. Noch: ${formatTime(remainingMinutes, remainingSeconds, false)}`;
                currentPrayer = prayer;
                currentPrayerEndTime = prayerEndMinutes;
            } else {
                countdownElement.textContent = "Bereits abgelaufen.";
            }
        }

        // Nächstes Gebet Anzeige
        if (nextPrayer && prayerTimes[nextPrayer]) {
            document.getElementById("next-prayer").textContent = `Nächstes Gebet: ${nextPrayer} (${prayerTimes[nextPrayer].slice(0, 5)})`;
        }
    }

    function formatTime(minutes, seconds, showSeconds) {
        let h = Math.floor(minutes / 60);
        let m = minutes % 60;
        let s = seconds;
        return showSeconds
            ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    // Hadith
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

    // Dua
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

    // Reihenfolge der Gebete (wird von updateGebetszeitenCountdown benötigt)
    const prayerOrder = ["Letztes Drittel", "Fajr", "Shuruk", "Duha", "Duha-Ende", "Dhuhr", "Asr", "Maghrib", "Isha", "Mitternacht", "Mitternacht-Ende"];

    // === START ALLER FUNKTIONEN ===
    zeigeFortsetzenButton();
    ermittleStandort();
    await ladeHadith();
    await ladeDua();

    console.log("✅ Sakinah Initiative Skript erfolgreich gestartet.");
});
