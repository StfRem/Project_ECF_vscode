// --- VERIFICATION ET INITIALISATION ---
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Vous devez être connecté pour accéder à votre espace utilisateur.");
    location.href = "./login.html";
}
// --- PRÉ-REMPLISSAGE DU PROFIL ---
if (user) {
    document.getElementById("edit-fullname").value = user.fullname || "";
    document.getElementById("edit-email").value = user.email || "";
    document.getElementById("edit-gsm").value = user.gsm || "";
    document.getElementById("edit-address").value = user.address || "";
    document.getElementById("edit-cp").value = user.cp || "";
}

let commandesUtilisateur = [];
const liste = document.getElementById("liste-commandes");

// --- FONCTION : Aller chercher les données dans WAMP ---
async function chargerCommandesDepuisBDD() {
    try {
        const resp = await fetch(`./php/get_commandes_client.php?userId=${user.id}`);
        const result = await resp.json();

        if (result.status === "success") {
            commandesUtilisateur = result.data;
            afficherListe();
        }
    } catch (error) {
        console.error("Erreur BDD :", error);
    }
}

// --- AFFICHAGE ---
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

        if (cmd.statut === "en attente") {
            boutonModifier = `<button class="btn-modifier btn-action" data-id="${cmd.id}">Modifier</button>`;
            boutonAnnuler = `<button class="btn-annuler btn-danger" data-id="${cmd.id}">Annuler</button>`;
        }

        // On affiche le bouton avis si livré ou terminée
        if (cmd.statut === "livré" || cmd.statut === "terminée") {
            boutonAvis = `<button class="btn-avis btn-action" data-id="${cmd.id}">Donner un avis</button>`;
        }

        // --- prépare le petit texte du statut de l'avis ---
        let infoAvis = "";
        if (cmd.avis_statut) {
            infoAvis = `<p style="margin-top:10px; color: #d35400;"><strong>Statut de votre avis :</strong> ${cmd.avis_statut}</p>`;
        }

        li.innerHTML = `
            <div class="commande-details">
                <h3>${cmd.menu_titre}</h3>
                <p><strong>Commande :</strong> #${cmd.id}</p>
                <p><strong>Nombre de personnes :</strong> ${cmd.nb_personnes || 'N/A'}</p>
                <p><strong>Prix total :</strong> ${parseFloat(cmd.prix_total).toFixed(2)} €</p>
                <p><strong>Date :</strong> ${cmd.date_prestation} à ${cmd.heure_prestation}</p>
                <p><strong>Adresse :</strong> ${cmd.adresse}, ${cmd.cp} ${cmd.ville}</p>
                <p><strong>Statut :</strong> <span class="statut-${cmd.statut.replace(/ /g, '-')}">${cmd.statut}</span></p>
                
                ${infoAvis} <div class="boutons-commande">
                    ${boutonModifier}
                    ${boutonAnnuler}
                    ${boutonAvis}
                </div>
                <div class="zone-modification" id="zone-modification-${cmd.id}"></div>
            </div>
        `;
        liste.appendChild(li);
    });
}

// --- GESTION DES CLICS ---
document.addEventListener("click", (e) => {
    const target = e.target;
    const id = target.dataset.id;

    // 1. ANNULER UNE COMMANDE
    if (target.classList.contains("btn-annuler")) {
        if (confirm("Voulez-vous vraiment annuler cette commande ?")) {
            fetch('./php/update_commande_statut.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, statut: "annulée" })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Commande annulée !");
                        chargerCommandesDepuisBDD();
                    }
                });
        }
    }

    // 2. OUVRIR LE FORMULAIRE DE MODIF
    if (target.classList.contains("btn-modifier")) {
        const cmd = commandesUtilisateur.find(c => String(c.id) === String(id));
        if (!cmd) return;

        const zone = document.getElementById(`zone-modification-${id}`);
        zone.innerHTML = `
        <div class="formulaire-modification">
            <h4>Modifier la commande #${id}</h4>
            
            <label>Nombre de personnes :</label>
            <input type="number" id="mod-nb-${id}" value="${cmd.nb_personnes || 0}" min="1">
            
            <label>Date :</label>
            <input type="date" id="mod-date-${id}" value="${cmd.date_prestation || ''}">
            
            <label>Heure :</label>
            <input type="time" id="mod-heure-${id}" value="${cmd.heure_prestation || ''}">
            
            <label>Adresse :</label>
            <input type="text" id="mod-adresse-${id}" value="${cmd.adresse || ''}">
            
            <label>Code postal :</label>
            <input type="text" id="mod-cp-${id}" value="${cmd.cp || ''}">
            
            <label>Ville :</label>
            <input type="text" id="mod-ville-${id}" value="${cmd.ville || ''}">

            <label>Distance (km) :</label>
            <input type="number" id="mod-distance-${id}" value="${cmd.distance || 0}">
            
            <br>
            <button class="btn-valider-modif btn-action" data-id="${id}">Confirmer les changements</button>
            <button class="btn-annuler-modif btn-secondary" data-id="${id}">Fermer</button>
        </div>
    `;
    }

    // 3. VALIDER LA MODIFICATION
    if (target.classList.contains("btn-valider-modif")) {
        const cmdOriginale = commandesUtilisateur.find(c => String(c.id) === String(id));
        if (!cmdOriginale) return;

        const nbPers = Number(document.getElementById(`mod-nb-${id}`).value);
        const distanceVal = Number(document.getElementById(`mod-distance-${id}`).value);

        // Calcul du nouveau prix au prorata de personne
        let nouveauPrix = parseFloat(cmdOriginale.prix_total);
        if (cmdOriginale.nb_personnes > 0) {
            nouveauPrix = nbPers * (parseFloat(cmdOriginale.prix_total) / cmdOriginale.nb_personnes);
        }

        const updatedCmd = {
            nb_personnes: nbPers,
            prix_total: nouveauPrix.toFixed(2),
            date_prestation: document.getElementById(`mod-date-${id}`).value,
            heure_prestation: document.getElementById(`mod-heure-${id}`).value,
            adresse: document.getElementById(`mod-adresse-${id}`).value,
            cp: document.getElementById(`mod-cp-${id}`).value,
            ville: document.getElementById(`mod-ville-${id}`).value,
            distance: distanceVal,
            id: id
        };

        fetch('./php/update_commande_complete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCmd)
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Modifications enregistrées !");
                    chargerCommandesDepuisBDD();
                } else {
                    alert("Erreur BDD : " + data.message);
                }
            })

            .catch(err => {
                console.error("Erreur Fetch :", err);
                alert("Une erreur technique est survenue.");
            });
    }

    // 4. DONNER UN AVIS
    if (target.classList.contains("btn-avis")) {
        const note = prompt("Note (1 à 5) :");
        const commentaire = prompt("Votre commentaire :");

        if (!note || !commentaire) return;

        // envoie les clés exactement comme attendues par save_avis.php
        const avisData = {
            commandeId: id,
            userId: user.id,
            nomClient: user.fullname,
            note: parseInt(note),
            commentaire: commentaire
        };

        fetch('./php/save_avis.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avisData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Merci pour votre avis !");
                } else {
                    alert("Erreur : " + data.message);
                }
            });
    }

    if (target.classList.contains("btn-annuler-modif")) {
        document.getElementById(`zone-modification-${id}`).innerHTML = "";
    }
});

// --- MISE À JOUR DU PROFIL ---
const profileForm = document.getElementById("profile-form");
if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const updatedData = {
            fullname: document.getElementById("edit-fullname").value,
            email: document.getElementById("edit-email").value, // Nécessaire pour le WHERE dans le PHP
            gsm: document.getElementById("edit-gsm").value,
            address: document.getElementById("edit-address").value,
            cp: document.getElementById("edit-cp").value
        };

        fetch('./php/update_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Profil mis à jour avec succès !");

                    // Mise à jour du localStorage pour que les changements soient visibles partout
                    const newUser = { ...user, ...updatedData };
                    localStorage.setItem("user", JSON.stringify(newUser));
                } else {
                    alert("Erreur : " + data.message);
                }
            })
            .catch(err => console.error("Erreur profil:", err));
    });
}

document.addEventListener("DOMContentLoaded", chargerCommandesDepuisBDD);