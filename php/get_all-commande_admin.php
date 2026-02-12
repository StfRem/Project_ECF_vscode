<?php
header("Content-Type: application/json");
require_once "db.php";

try {
$sql = "SELECT c.*, u.fullname, a.statut AS avis_statut 
        FROM commandes c 
        LEFT JOIN users u ON c.user_id = u.id 
        LEFT JOIN avis a ON c.id = a.commande_id 
        ORDER BY c.date_prestation DESC";
            
    $stmt = $pdo->query($sql);
    $commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // On renvoie le résultat en JSON
    echo json_encode([
        "status" => "success",
        "data" => $commandes
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Erreur lors de la récupération : " . $e->getMessage()
    ]);
}
?>