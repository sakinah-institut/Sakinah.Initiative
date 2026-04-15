import { auth, db } from './firebase-init.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    // Registrierung
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });
                alert("✅ Registrierung erfolgreich!");
                window.location.href = "login.html";
            } catch (error) {
                alert("❌ Registrierung fehlgeschlagen: " + error.message);
            }
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;
            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("✅ Assalamu alaikum");
                window.location.href = "index.html";
            } catch (error) {
                alert("❌ Login fehlgeschlagen: " + error.message);
            }
        });
    }

    // ====================== AUTH STATE - WICHTIG ======================
    const loginLink = document.getElementById("login-link");
    const userInfo = document.getElementById("user-info");
    const greeting = document.getElementById("greeting");

    if (loginLink && userInfo && greeting) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // EINGELOGGT
                loginLink.classList.add("hidden");
                userInfo.classList.remove("hidden");

                const name = user.displayName || user.email.split("@")[0];
                greeting.textContent = `Assalamu alaikum, ${name}`;
            } else {
                // NICHT EINGELOGGT
                loginLink.classList.remove("hidden");
                userInfo.classList.add("hidden");
            }
        });
    }

    // Logout
    window.logout = () => {
        signOut(auth)
            .then(() => location.reload())
            .catch(error => alert("❌ Fehler beim Logout: " + error.message));
    };
});
