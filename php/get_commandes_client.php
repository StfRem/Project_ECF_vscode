<?php
header("Content-Type: application/json");
require_once "db.php";

$userId = $_GET['userId'] ?? null;

if (!$userId) {
    echo json_encode(["status" => "error", "message" => "ID utilisateur manquant"]);
    exit;
}

try {
    $sql = "SELECT c.*, c.id AS id, a.statut AS avis_statut 
            FROM commandes c 
            LEFT JOIN avis a ON c.id = a.commande_id 
            WHERE c.user_id = ? 
            ORDER BY c.date_prestation DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $commandes]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
?>