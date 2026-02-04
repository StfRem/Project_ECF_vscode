// Vérification du rôle utilisateur
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Vous devez être connecté pour accéder à votre espace utilisateur.");
    location.href = "./login.html";
}

// Stocker les menus dans localStorage si ce n'est pas déjà fait
if (!localStorage.getItem("menus")) {
    const menus = [
        {
            id: 1,
            titre: "Noël Traditionnel",
            personnesMin: 4,
            materiel: true
        },
        {
            id: 2,
            titre: "Menu Vegan Fraîcheur",
            personnesMin: 2,
            materiel: false
        },
        {
            id: 3,
            titre: "Menu Événements",
            personnesMin: 6,
            materiel: true
        }
    ];
    localStorage.setItem("menus", JSON.stringify(menus));
}

// Récupération des commandes de l'utilisateur
let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
let commandesUtilisateur = commandes.filter(cmd => cmd.userId === user.id);

// Fonction pour récupérer un menu par son ID
function getMenuById(menuId) {
    const menus = JSON.parse(localStorage.getItem("menus")) || [];
    return menus.find(m => m.id == menuId);
}

// Sélection de la zone d'affichage
const liste = document.getElementById("liste-commandes");

// Affichage de la liste des commandes avec tous les détails
function afficherListe() {
    liste.innerHTML = "";

    if (commandesUtilisateur.length === 0) {
        liste.innerHTML = "<p>Aucune commande pour le moment.</p>";
        return;
    }

    commandesUtilisateur.forEach(cmd => {
        const li = document.createElement("li");
        li.classList.add("commande-item");
        li.dataset.id = cmd.id;

        let boutonModifier = "";
        let boutonAnnuler = "";
        let boutonAvis = "";
        let suivi = "";
        let zoneModification = "";

        // Boutons Modifier et Annuler pour les commandes en attente
        if (cmd.statut === "en attente") {
            boutonModifier = `<button class="btn-modifier btn-action" data-id="${cmd.id}">Modifier</button>`;
            boutonAnnuler = `<button class="btn-annuler btn-danger" data-id="${cmd.id}">Annuler</button>`;
        }

        // Suivi pour les commandes non en attente et non annulées
        if (cmd.statut !== "en attente" && cmd.statut !== "annulée") {
            suivi = `
                <div class="suivi-commande">
                    <h4>Suivi de la commande</h4>
                    <ul>
                        ${cmd.historique.map(h => `<li>${new Date(h.date).toLocaleString()} — ${h.action}</li>`).join("")}
                    </ul>
                </div>
            `;
        }

        // Bouton avis pour les commandes terminées
        if (cmd.statut === "terminée" && cmd.avis && cmd.avis.note === null) {
            boutonAvis = `<button class="btn-avis btn-action" data-id="${cmd.id}">Donner un avis</button>`;
        }

        li.innerHTML = `
            <div class="commande-details">
                <h3>${cmd.menuTitre}</h3>
                <p><strong>Commande :</strong> ${cmd.id}</p>
                <p><strong>Nombre de personnes :</strong> ${cmd.nbPersonnes}</p>
                <p><strong>Date de prestation :</strong> ${cmd.datePrestation}</p>
                <p><strong>Heure :</strong> ${cmd.heurePrestation}</p>
                <p><strong>Adresse :</strong> ${cmd.adresse}, ${cmd.cp} ${cmd.ville}</p>
                <p><strong>Distance :</strong> ${cmd.distance} km</p>
                <p><strong>Statut :</strong> ${cmd.statut}</p>
                
                <div class="boutons-commande">
                    ${boutonModifier}
                    ${boutonAnnuler}
                    ${boutonAvis}
                </div>
                
                <div class="zone-modification" id="zone-modification-${cmd.id}"></div>
                
                ${suivi}
            </div>
        `;

        liste.appendChild(li);
    });
}

// Gestion centralisée des clics
document.addEventListener("click", (e) => {
    const target = e.target;

    // Clic sur le bouton Annuler
    if (target.classList.contains("btn-annuler")) {
        const id = target.dataset.id;
        const cmd = commandesUtilisateur.find(c => String(c.id) === String(id));
        if (!cmd) return;
        
        if (confirm("Voulez-vous vraiment annuler cette commande ?")) {
            cmd.statut = "annulée";
            cmd.historique.push({
                date: new Date().toISOString(),
                action: "Commande annulée par l'utilisateur"
            });
            localStorage.setItem("commandes", JSON.stringify(commandes));
            afficherListe();
        }
        return;
    }

    // Clic sur le bouton Modifier
    if (target.classList.contains("btn-modifier")) {
        const id = target.dataset.id;
        const cmd = commandesUtilisateur.find(c => String(c.id) === String(id));
        if (!cmd) return;
        
        const zone = document.getElementById(`zone-modification-${cmd.id}`);
        if (!zone) return;
        
        zone.innerHTML = `
            <div class="formulaire-modification">
                <h4>Modifier la commande</h4>
                <label>Nombre de personnes :</label>
                <input type="number" id="mod-nb-${cmd.id}" value="${cmd.nbPersonnes}">
                <label>Date :</label>
                <input type="date" id="mod-date-${cmd.id}" value="${cmd.datePrestation}">
                <label>Heure :</label>
                <input type="time" id="mod-heure-${cmd.id}" value="${cmd.heurePrestation}">
                <label>Adresse :</label>
                <input type="text" id="mod-adresse-${cmd.id}" value="${cmd.adresse}">
                <label>Code postal :</label>
                <input type="text" id="mod-cp-${cmd.id}" value="${cmd.cp}">
                <label>Ville :</label>
                <input type="text" id="mod-ville-${cmd.id}" value="${cmd.ville}">
                <label>Distance (km) :</label>
                <input type="number" id="mod-distance-${cmd.id}" value="${cmd.distance}">
                <button class="btn-valider-modif btn-action" data-id="${cmd.id}">Valider</button>
                <button class="btn-annuler-modif" data-id="${cmd.id}">Annuler les modifications</button>
            </div>
        `;
        return;
    }

    // Annuler les modifications
    if (target.classList.contains("btn-annuler-modif")) {
        const id = target.dataset.id;
        const zone = document.getElementById(`zone-modification-${id}`);
        if (zone) {
            zone.innerHTML = "";
        }
        return;
    }

    // Validation de la modification
    if (target.classList.contains("btn-valider-modif")) {
        const id = target.dataset.id;
        const cmd = commandesUtilisateur.find(c => String(c.id) === String(id));
        if (!cmd) {
            alert("Erreur : commande introuvable.");
            return;
        }

        const nouveauNb = Number(document.getElementById(`mod-nb-${id}`).value);
        const nouvelleDate = document.getElementById(`mod-date-${id}`).value;
        const nouvelleHeure = document.getElementById(`mod-heure-${id}`).value;
        const nouvelleAdresse = document.getElementById(`mod-adresse-${id}`).value;
        const nouveauCP = document.getElementById(`mod-cp-${id}`).value;
        const nouvelleVille = document.getElementById(`mod-ville-${id}`).value;
        const nouvelleDistance = Number(document.getElementById(`mod-distance-${id}`).value);

let menu = getMenuById(cmd.menuId);

// fallback si menuId foireux
if (!menu) {
    const menus = JSON.parse(localStorage.getItem("menus")) || [];
    menu = menus.find(m => m.nom === cmd.menuTitre);
}

if (!menu) {
    console.error("Menu introuvable", cmd);
    alert("Menu introuvable pour recalcul.");
    return;
}


        let total = nouveauNb * (menu.prix / menu.personnesMin);
        if (nouveauNb >= menu.personnesMin + 5) {
            total *= 0.9;
        }

        let fraisLivraison = 5;
        if (nouvelleVille.toLowerCase() !== "bordeaux") {
            fraisLivraison += nouvelleDistance * 0.59;
        }
        total += fraisLivraison;

        cmd.nbPersonnes = nouveauNb;
        cmd.prixTotal = total;
        cmd.datePrestation = nouvelleDate;
        cmd.heurePrestation = nouvelleHeure;
        cmd.adresse = nouvelleAdresse;
        cmd.cp = nouveauCP;
        cmd.ville = nouvelleVille;
        cmd.distance = nouvelleDistance;

        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Commande modifiée par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));
        alert("Commande mise à jour avec succès !");
        afficherListe();
        return;
    }

    // Bouton Avis
    if (target.classList.contains("btn-avis")) {
        const id = target.dataset.id;
        const cmd = commandesUtilisateur.find(c => String(c.id) === String(id));
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

        let avis = JSON.parse(localStorage.getItem("avis")) || [];
        avis.push({
            id: "AVIS-" + Date.now(),
            commandeId: cmd.id,
            userId: user.id,
            nomClient: user.fullname,
            note: Number(note),
            commentaire: commentaire,
            date: new Date().toISOString(),
            statut: "en attente"
        });

        localStorage.setItem("avis", JSON.stringify(avis));
        cmd.historique.push({
            date: new Date().toISOString(),
            action: "Avis laissé par l'utilisateur"
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));
        alert("Merci pour votre avis !");
        afficherListe();
    }
});

// Initialisation
afficherListe();