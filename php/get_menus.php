<?php
header('Content-Type: application/json');
require_once 'db.php'; // Ton fichier de connexion PDO

try {
    // On récupère tous les menus triés par titre
    $sql = "SELECT * FROM menus ORDER BY titre ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $menus = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // On renvoie les données au format attendu par ton JS
    echo json_encode([
        "status" => "success",
        "data" => $menus
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Erreur BDD : " . $e->getMessage()
    ]);
}
?>