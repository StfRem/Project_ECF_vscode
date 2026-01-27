// ---------------------------------------------------------
// Sécurité : utilisateur connecté
// ---------------------------------------------------------
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Vous devez être connecté pour accéder à votre espace utilisateur.");
    location.href = "./login.html";
}

// ---------------------------------------------------------
// Récupération des commandes de l'utilisateur
// ---------------------------------------------------------
let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
let commandesUtilisateur = commandes.filter(cmd => cmd.userId === user.id);

// ---------------------------------------------------------
// Sélection des zones d'affichage
// ---------------------------------------------------------
const liste = document.getElementById("liste-commandes");

// Zone où s'affichent les détails
let zoneDetail = document.createElement("div");
zoneDetail.id = "zone-detail";
zoneDetail.style.marginTop = "20px";
document.querySelector(".user-container").appendChild(zoneDetail);

// ---------------------------------------------------------
// Affichage de la liste des commandes
// ---------------------------------------------------------
function afficherListe() {
    liste.innerHTML = "";

    if (commandesUtilisateur.length === 0) {
        liste.innerHTML = "<p>Aucune commande pour le moment.</p>";
        return;
    }

    commandesUtilisateur.forEach(cmd => {
        const li = document.createElement("li");
        li.classList.add("commande-item");

        li.innerHTML = `
            <strong>${cmd.menuTitre}</strong><br>
            Commande : ${cmd.id}<br>
            Prestation : ${cmd.datePrestation} à ${cmd.heurePrestation}<br>
            Statut : ${cmd.statut}
        `;

        li.dataset.id = cmd.id;
        liste.appendChild(li);
    });
}

afficherListe();

// ---------------------------------------------------------
// Affichage des détails d'une commande
// ---------------------------------------------------------
function afficherDetail(cmd) {

    let boutonModifier = "";
    let boutonAnnuler = "";
    let boutonAvis = "";
    let suivi = "";

    // Modification + annulation si statut = en attente
    if (cmd.statut === "en attente") {
        boutonModifier = `<button id="btn-modifier" class="btn-action">Modifier</button>`;
        boutonAnnuler = `<button id="btn-annuler" class="btn-danger">Annuler</button>`;
    }

    // Suivi si accepté ou plus
    if (cmd.statut !== "en attente" && cmd.statut !== "annulée") {
        suivi = `
            <h3>Suivi de la commande</h3>
            <ul>
                ${cmd.historique.map(h => `<li>${new Date(h.date).toLocaleString()} — ${h.action}</li>`).join("")}
            </ul>
        `;
    }

    // Avis si terminée
    if (cmd.statut === "terminée" && cmd.avis.note === null) {
        boutonAvis = `<button id="btn-avis" class="btn-action">Donner un avis</button>`;
    }

    zoneDetail.innerHTML = `
        <h2>Détail de la commande</h2>

        <p><strong>Menu :</strong> ${cmd.menuTitre}</p>
        <p><strong>Nombre de personnes :</strong> ${cmd.nbPersonnes}</p>
        <p><strong>Date :</strong> ${cmd.datePrestation}</p>
        <p><strong>Heure :</strong> ${cmd.heurePrestation}</p>
        <p><strong>Adresse :</strong> ${cmd.adresse}, ${cmd.cp} ${cmd.ville}</p>
        <p><strong>Distance :</strong> ${cmd.distance} km</p>
        <p><strong>Statut :</strong> ${cmd.statut}</p>

        ${boutonModifier}
        ${boutonAnnuler}
        ${boutonAvis}

        <div id="zone-modification"></div>

        ${suivi}
    `;
}

// ---------------------------------------------------------
// Clic sur une commande → afficher les détails
// ---------------------------------------------------------
document.addEventListener("click", (e) => {
    const item = e.target.closest(".commande-item");
    if (item) {
        const id = item.dataset.id;
        const cmd = commandesUtilisateur.find(c => c.id === id);
        afficherDetail(cmd);
    }
});

// ---------------------------------------------------------
// ANNULATION
// ---------------------------------------------------------
document.addEventListener("click", (e) => {
    if (e.target.id === "btn-annuler") {

        const id = zoneDetail.querySelector("p:nth-child(2)").innerText.split(" : ")[1];
        const cmd = commandesUtilisateur.find(c => c.id === id);

        if (!confirm("Voulez-vous vraiment annuler cette commande ?")) return;

        cmd.statut = "annulée";
        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Commande annulée par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));
        afficherListe();
        afficherDetail(cmd);
    }
});

// ---------------------------------------------------------
// MODIFICATION
// ---------------------------------------------------------
document.addEventListener("click", (e) => {
    if (e.target.id === "btn-modifier") {

        const id = zoneDetail.querySelector("p:nth-child(2)").innerText.split(" : ")[1];
        const cmd = commandesUtilisateur.find(c => c.id === id);

        const zone = document.getElementById("zone-modification");

        zone.innerHTML = `
            <h3>Modifier la commande</h3>

            <label>Nombre de personnes :</label>
            <input type="number" id="mod-nb" value="${cmd.nbPersonnes}">

            <label>Date :</label>
            <input type="date" id="mod-date" value="${cmd.datePrestation}">

            <label>Heure :</label>
            <input type="time" id="mod-heure" value="${cmd.heurePrestation}">

            <label>Adresse :</label>
            <input type="text" id="mod-adresse" value="${cmd.adresse}">

            <label>Code postal :</label>
            <input type="text" id="mod-cp" value="${cmd.cp}">

            <label>Ville :</label>
            <input type="text" id="mod-ville" value="${cmd.ville}">

            <label>Distance (km) :</label>
            <input type="number" id="mod-distance" value="${cmd.distance}">

            <button id="btn-valider-modif" class="btn-action">Valider</button>
        `;
    }
});

// ---------------------------------------------------------
// VALIDATION MODIFICATION
// ---------------------------------------------------------
document.addEventListener("click", (e) => {
    if (e.target.id === "btn-valider-modif") {

        const id = zoneDetail.querySelector("p:nth-child(2)").innerText.split(" : ")[1];
        const cmd = commandesUtilisateur.find(c => c.id === id);

        cmd.nbPersonnes = Number(document.getElementById("mod-nb").value);
        cmd.datePrestation = document.getElementById("mod-date").value;
        cmd.heurePrestation = document.getElementById("mod-heure").value;
        cmd.adresse = document.getElementById("mod-adresse").value;
        cmd.cp = document.getElementById("mod-cp").value;
        cmd.ville = document.getElementById("mod-ville").value;
        cmd.distance = Number(document.getElementById("mod-distance").value);

        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Commande modifiée par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));

        alert("Commande mise à jour !");
        afficherListe();
        afficherDetail(cmd);
    }
});

// ---------------------------------------------------------
// AVIS
// ---------------------------------------------------------
document.addEventListener("click", (e) => {
    if (e.target.id === "btn-avis") {

        const id = zoneDetail.querySelector("p:nth-child(2)").innerText.split(" : ")[1];
        const cmd = commandesUtilisateur.find(c => c.id === id);

        const note = prompt("Note (1 à 5) :");
        const commentaire = prompt("Votre commentaire :");

        if (!note || !commentaire) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        cmd.avis.note = Number(note);
        cmd.avis.commentaire = commentaire;
        cmd.avis.date = new Date().toISOString();

        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Avis laissé par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));

        alert("Merci pour votre avis !");
        afficherDetail(cmd);
    }
});
