// NAVBAR DYNAMIQUE
export function loadNavbar() {
    document.getElementById("header").innerHTML = `
        <nav class="nav-header">
            <img src="./assets/images/logo.png" alt="logo" class="logo">
            <ul class="menu_header">
                <li><a href="./index.html">Accueil</a></li>
                <li><a href="./menus.html">Menus</a></li>
                <li><a href="./contact.html">Contact</a></li>
                <li><a href="./login.html">Connexion</a></li>
            </ul>
        </nav>
    `;
}

// FOOTER DYNAMIQUE
export function loadFooter() {
    document.getElementById("footer").innerHTML = `
        <div class="footer">
            <h2>Horaires</h2>
            <ul class="ul_horaire">
                <li>Lundi : 08h00 – 20h00</li>
                <li>Mardi : 08h00 – 20h00</li>
                <li>Mercredi : 08h00 – 20h00</li>
                <li>Jeudi : 08h00 – 20h00</li>
                <li>Vendredi : 08h00 – 20h00</li>
                <li>Samedi : 09h00 – 18h00</li>
                <li>Dimanche : 09h00 – 13h00</li>
            </ul>

            <div class="mention">
                <h3><a href="./mentionlegal.html">Mentions légales</a></h3>
                <h3><a href="./cgv.html">Conditions Générales de Vente (CGV)</a></h3>
            </div>
        </div>
    `;
}
// Simulation : à remplacer plus tard par ton vrai système de connexion
let userIsLogged = false; 