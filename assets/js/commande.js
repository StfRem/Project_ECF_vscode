// Données des menus (identiques à menus.js et menu-detail.js)
const menus = [
    {
        id: 1,
        titre: "Noël Traditionnel",
        prix: 70,
        personnesMin: 4,
        stock: 20,
        materiel: true   // ← matériel inclus
    },
    {
        id: 2,
        titre: "Menu Vegan Fraîcheur",
        prix: 55,
        personnesMin: 2,
        stock: 15,
        materiel: false  // ← pas de matériel
    },
    {
        id: 3,
        titre: "Menu Événements",
        prix: 90,
        personnesMin: 6,
        stock: 10,
        materiel: true
    }
];

// Récupération de l'ID dans l'URL
const params = new URLSearchParams(location.search);
const id = params.get("id");
const menu = menus.find(m => m.id == id);

if (!menu) {
    alert("Menu introuvable.");
    location.href = "./menus.html";
}

// Pré-remplissage des infos client
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    document.getElementById("fullname").removeAttribute("readonly");
    document.getElementById("email").removeAttribute("readonly");
    document.getElementById("gsm").removeAttribute("readonly");
} else {
    document.getElementById("fullname").value = user.fullname;
    document.getElementById("email").value = user.email;
    document.getElementById("gsm").value = user.gsm;
}

// Gestion du nombre de personnes + prix total
const inputNb = document.getElementById("nbPersonnes");
const prixTotal = document.getElementById("prixTotal");

inputNb.min = menu.personnesMin;
inputNb.value = menu.personnesMin;

updatePrix();

inputNb.addEventListener("input", () => {
    if (inputNb.value < menu.personnesMin) {
        inputNb.value = menu.personnesMin;
    }
    updatePrix();
});
document.getElementById("ville").addEventListener("input", updatePrix);
document.getElementById("distance").addEventListener("input", updatePrix);

function updatePrix() {
    const nb = Number(inputNb.value);
    let total = nb * (menu.prix / menu.personnesMin);

    const reductionInfo = document.getElementById("reductionInfo");

    if (nb >= menu.personnesMin + 5) {
        total = total * 0.9;
        reductionInfo.textContent = "Réduction de 10% appliquée !";
        reductionInfo.style.color = "#FFFFFF";
    } else {
        const manque = (menu.personnesMin + 5) - nb;
        reductionInfo.textContent = `Ajoutez encore ${manque} personne(s) pour obtenir une réduction de 10% !`;
    }

    const ville = document.getElementById("ville").value.trim().toLowerCase();
    const distance = Number(document.getElementById("distance").value);

    let fraisLivraison = 5;
    if (ville !== "" && ville !== "bordeaux") {
        fraisLivraison += distance * 0.59;
    }

    window.totalFinal = total + fraisLivraison;
    prixTotal.textContent = `Prix total avec livraison : ${window.totalFinal.toFixed(2)} €`;
}

// Validation de la commande + stockage (BDD & LocalStorage)

// --- SECTION VALIDATION  ---
document.getElementById("commande-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const nb = Number(inputNb.value);

    // 1. VERIFICATION STOCK
    if (nb > menu.stock) {
        alert(`Stock insuffisant. Il reste seulement ${menu.stock} commandes possibles.`);
        return;
    }

    // 2. VERIFICATION CONNEXION
    const isLogged = localStorage.getItem("userIsLogged") === "true";
    if (!isLogged) {
        alert("Vous devez être connecté pour valider une commande.");
        localStorage.setItem("pendingMenu", menu.id);
        location.href = "./login.html";
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const commandes = JSON.parse(localStorage.getItem("commandes")) || [];

    // 3. CRÉATION DE L'OBJET MIROIR
    const nouvelleCommande = {
        id: "CMD-" + Date.now(),
        userId: user.id,
        menuId: menu.id,
        menuTitre: menu.titre,
        nbPersonnes: nb,
        prixTotal: window.totalFinal,
        reduction: nb >= menu.personnesMin + 5,
        materiel: menu.materiel,
        adresse: document.getElementById("address").value,
        ville: document.getElementById("ville").value,
        cp: document.getElementById("cp").value,
        distance: Number(document.getElementById("distance").value),
        datePrestation: document.getElementById("date").value,
        heurePrestation: document.getElementById("heure").value,
        telephone: user.gsm,
        statut: "en attente",
        historique: [{ date: new Date().toISOString(), action: "Commande créée" }],
        avis: { note: null, commentaire: null, date: null }
    };

    // 4. PREPARATION DONNÉES POUR PHP (WAMP)
    const dataBDD = {
        user_id: user.id,
        menu_titre: menu.titre,
        prix_total: window.totalFinal,
        date_prestation: nouvelleCommande.datePrestation,
        heure_prestation: nouvelleCommande.heurePrestation,
        adresse: nouvelleCommande.adresse,
        cp: nouvelleCommande.cp,
        ville: nouvelleCommande.ville,
        materiel: menu.materiel ? 1 : 0
    };

    // 5. ENVOI ET SYNCHRONISATION
    fetch('./php/save_commande.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataBDD)
    })
        .then(res => res.json())
        .then(result => {
            if (result.status === "success") {
                // MIROIR : On met à jour le LocalStorage
                commandes.push(nouvelleCommande);
                localStorage.setItem("commandes", JSON.stringify(commandes));

                alert("Votre commande a bien été enregistrée !");
                location.href = "./espace-utilisateur.html";
            } else {
                alert("Erreur BDD : " + result.message);
            }
        })
        .catch(err => {
            console.error("Erreur envoi commande:", err);
            alert("Erreur de connexion au serveur.");
        });
});