// ---------------------------------------------------------
// Chargement du menu choisi
// ---------------------------------------------------------

// Données des menus (identiques à menus.js et menu-detail.js)
const menus = [
    {
        id: 1,
        titre: "Noël Traditionnel",
        prix: 70,
        personnesMin: 4,
        stock: 20
    },
    {
        id: 2,
        titre: "Menu Vegan Fraîcheur",
        prix: 55,
        personnesMin: 2,
        stock: 15
    },
    {
        id: 3,
        titre: "Menu Événements",
        prix: 90,
        personnesMin: 6,
        stock: 10
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

// ---------------------------------------------------------
// Pré-remplissage des infos client
// ---------------------------------------------------------
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
    document.getElementById("fullname").value = user.fullname;
    document.getElementById("email").value = user.email;
    document.getElementById("gsm").value = user.gsm;
}



// ---------------------------------------------------------
// Gestion du nombre de personnes + prix total
// ---------------------------------------------------------
const inputNb = document.getElementById("nbPersonnes");
const prixTotal = document.getElementById("prixTotal");

// impose le minimum
inputNb.min = menu.personnesMin;
inputNb.value = menu.personnesMin;

// calcul initial
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

    // Réduction 10% si +5 personnes
    if (nb >= menu.personnesMin + 5) {
        total = total * 0.9;
        reductionInfo.textContent = "🎉 Réduction de 10% appliquée !";
        reductionInfo.style.color = "#27ae60";
    } else {
        const manque = (menu.personnesMin + 5) - nb;
        reductionInfo.textContent = `Ajoutez encore ${manque} personne(s) pour obtenir une réduction de 10% !`;
        reductionInfo.style.color = "#d35400";
    }

    // Frais de livraison
    const ville = document.getElementById("ville").value.trim().toLowerCase();
    const distance = Number(document.getElementById("distance").value);

    let fraisLivraison = 0;

    if (ville !== "" && ville !== "bordeaux") {
        fraisLivraison = 5 + (distance * 0.59);
    }

    const totalFinal = total + fraisLivraison;

    prixTotal.textContent = `Prix total : ${totalFinal.toFixed(2)} €`;
}



// ---------------------------------------------------------
// Validation de la commande + stockage
// ---------------------------------------------------------
document.getElementById("commande-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const nb = Number(inputNb.value);

    // Vérification stock
    if (nb > menu.stock) {
        alert(`Stock insuffisant. Il reste seulement ${menu.stock} commandes possibles.`);
        return;
    }

    // Vérification connexion
    const isLogged = localStorage.getItem("userIsLogged") === "true";

    if (!isLogged) {
        alert("Vous devez être connecté pour valider une commande.");
        localStorage.setItem("pendingMenu", menu.id);
        location.href = "./login.html";
        return;
    }

    // Récupération utilisateur connecté
    const user = JSON.parse(localStorage.getItem("userConnecte"));

    // Récupération commandes existantes
    const commandes = JSON.parse(localStorage.getItem("commandes")) || [];

    // Création de la commande
    const nouvelleCommande = {
        id: "CMD-" + Date.now(),
        userId: user.id,
        menuId: menu.id,
        menuTitre: menu.titre,

        nbPersonnes: nb,
        prixTotal: totalFinal,
        reduction: nb >= menu.personnesMin + 5,

        adresse: document.getElementById("address").value,
        ville: document.getElementById("ville").value,
        cp: document.getElementById("cp").value,
        distance: Number(document.getElementById("distance").value),

        datePrestation: document.getElementById("date").value,
        heurePrestation: document.getElementById("heure").value,

        telephone: user.gsm,

        statut: "en attente",

        historique: [
            {
                date: new Date().toISOString(),
                action: "Commande créée"
            }
        ],

        avis: {
            note: null,
            commentaire: null,
            date: null
        }
    };

    // Sauvegarde
    commandes.push(nouvelleCommande);
    localStorage.setItem("commandes", JSON.stringify(commandes));

    alert("Votre commande a bien été enregistrée !");
    location.href = "./espace-utilisateur.html"; // conforme au cahier des charges
});
