<?php

// Autoriser le retour au format JSON
header("Content-Type: application/json");

// Inclure la connexion à la base de données
require_once "db.php"; 

try {
    // On récupère tous les plats de la table 'plats'
    $stmt = $pdo->query("SELECT * FROM plats");
    $plats = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Envoyer les données au JavaScript
    echo json_encode([
        "status" => "success",
        "data" => $plats
    ]);

} catch (PDOException $e) {
    // En cas d'erreur SQL, on envoie le message d'erreur
    echo json_encode([
        "status" => "error",
        "message" => "Erreur SQL : " . $e->getMessage()
    ]);
}
?>