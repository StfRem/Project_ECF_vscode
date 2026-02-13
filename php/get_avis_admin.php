<?php
header("Content-Type: application/json");
require_once "db.php";

try {
    // Récupérer tous les avis pour que l'admin ou employé puisse les modérer
    $sql = "SELECT * FROM avis ORDER BY date_creation DESC";
    $stmt = $pdo->query($sql);
    $avis = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $avis]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>