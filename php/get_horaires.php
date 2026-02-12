<?php
header('Content-Type: application/json');
require_once 'db.php'; // On suppose que db.php définit la variable $pdo

try {
    // Correction de la constante : FETCH_ASSOC au lieu de REQUEST_ASSOC
    $query = $pdo->query("SELECT * FROM horaires ORDER BY FIELD(jour, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche')");
    $horaires = $query->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $horaires]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>