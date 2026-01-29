// Vérification du rôle utilisateur
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Vous devez être connecté pour accéder à votre espace utilisateur.");
    location.href = "./login.html";
    window.location.href = "./login.html";
}




// ---------------------------------------------------------
// Récupération des commandes de l'utilisateur
// ---------------------------------------------------------
let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
let commandesUtilisateur = commandes.filter(cmd => cmd.userId === user.id);
function getMenuById(menuId) {
    const menus = JSON.parse(localStorage.getItem("menus")) || [];
    return menus.find(m => m.id === menuId);
}
// ---------------------------------------------------------
// Sélection des zones d'affichage
// ---------------------------------------------------------
const liste = document.getElementById("liste-commandes");
const zoneDetail = document.getElementById("zone-detail");

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
if (commandesUtilisateur.length > 0) {
    afficherDetail(commandesUtilisateur[0]);
}

// ---------------------------------------------------------
// Affichage des détails d'une commande
// ---------------------------------------------------------
function afficherDetail(cmd) {
    let boutonModifier = "";
    let boutonAnnuler = "";
    let boutonAvis = "";
    let suivi = "";

    if (cmd.statut === "en attente") {
        boutonModifier = `<button id="btn-modifier" class="btn-action">Modifier</button>`;
        boutonAnnuler = `<button id="btn-annuler" class="btn-danger">Annuler</button>`;
    }

    if (cmd.statut !== "en attente" && cmd.statut !== "annulée") {
        suivi = `
            <h3>Suivi de la commande</h3>
            <ul>
                ${cmd.historique.map(h => `<li>${new Date(h.date).toLocaleString()} — ${h.action}</li>`).join("")}
            </ul>
        `;
    }

    if (cmd.statut === "terminée" && cmd.avis && cmd.avis.note === null) {
        boutonAvis = `<button id="btn-avis" class="btn-action">Donner un avis</button>`;
    }

    zoneDetail.dataset.id = cmd.id; // ID proprement stocké ici

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
// Récupération de la commande actuellement affichée
// ---------------------------------------------------------
function getCommandeCourante() {
    const id = zoneDetail.dataset.id;
    if (!id) return null;
    return commandesUtilisateur.find(c => String(c.id) === String(id)) || null;
}

// ---------------------------------------------------------
// Gestion centralisée des clics
// ---------------------------------------------------------
document.addEventListener("click", (e) => {
    const target = e.target;

    // Clic sur une commande → afficher les détails
    const item = target.closest(".commande-item");
    if (item) {
        const id = item.dataset.id;
        const cmd = commandesUtilisateur.find(c => String(c.id) === String(id));
        if (cmd) afficherDetail(cmd);
        return;
    }

    // ANNULATION
    if (target.id === "btn-annuler") {
        const cmd = getCommandeCourante();
        if (!cmd) return;

        if (!confirm("Voulez-vous vraiment annuler cette commande ?")) return;

        cmd.statut = "annulée";
        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Commande annulée par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));
        afficherListe();
        afficherDetail(cmd);
        return;
    }

    // MODIFICATION → affichage du formulaire
    if (target.id === "btn-modifier") {
        const cmd = getCommandeCourante();
        if (!cmd) return;

        const zone = document.getElementById("zone-modification");
        if (!zone) return;

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
        return;
    }

    // VALIDATION MODIFICATION
    if (target.id === "btn-valider-modif") {
        const cmd = getCommandeCourante();
        if (!cmd) return;

        const nouveauNb = Number(document.getElementById("mod-nb").value);
        const menu = getMenuById(cmd.menuId); // Vous devrez récupérer les infos du menu

        // RECALCUL DU PRIX
        let total = nouveauNb * (menu.prix / menu.personnesMin);

        // Réduction 10% si +5 personnes
        if (nouveauNb >= menu.personnesMin + 5) {
            total = total * 0.9;
        }

        // Frais de livraison
        const ville = document.getElementById("mod-ville").value.toLowerCase();
        const distance = Number(document.getElementById("mod-distance").value);

        let fraisLivraison = 5;
        if (ville !== "bordeaux") {
            fraisLivraison += distance * 0.59;
        }

        total += fraisLivraison;

        // Mise à jour
        cmd.nbPersonnes = nouveauNb;
        cmd.prixTotal = total;
        cmd.datePrestation = document.getElementById("mod-date").value;
        cmd.heurePrestation = document.getElementById("mod-heure").value;
        cmd.adresse = document.getElementById("mod-adresse").value;
        cmd.cp = document.getElementById("mod-cp").value;
        cmd.ville = document.getElementById("mod-ville").value;
        cmd.distance = distance;

        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Commande modifiée par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));

        alert("Commande mise à jour !");
        afficherListe();
        afficherDetail(cmd);
    }

    // ---------  AVIS  -----------------------------------------
    if (target.id === "btn-avis") {
        const cmd = getCommandeCourante();
        if (!cmd) return;

        const note = prompt("Note (1 à 5) :");
        const commentaire = prompt("Votre commentaire :");

        if (!note || !commentaire) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        if (!cmd.avis) {
            cmd.avis = { note: null, commentaire: "", date: null };
        }

        cmd.avis.note = Number(note);
        cmd.avis.commentaire = commentaire;
        cmd.avis.date = new Date().toISOString();

        // AJOUTER : Créer un objet avis dans la liste globale
        let avis = JSON.parse(localStorage.getItem("avis")) || [];

        avis.push({
            id: "AVIS-" + Date.now(),
            commandeId: cmd.id,
            userId: user.id,
            nomClient: user.fullname,
            note: Number(note),
            commentaire: commentaire,
            date: new Date().toISOString(),
            statut: "en attente"  // En attente de validation employé
        });

        localStorage.setItem("avis", JSON.stringify(avis));

        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Avis laissé par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));

        alert("Merci pour votre avis !");
        afficherDetail(cmd);
        return;
    }
});
