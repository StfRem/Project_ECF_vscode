<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['statut'])) {
    echo json_encode(["status" => "error", "message" => "Données incomplètes"]);
    exit;
}

try {
    // Cette requête va mettre à jour le statut (valide ou refusé) de l'avis choisi
    $sql = "UPDATE avis SET statut = :statut WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':statut' => $data['statut'],
        ':id' => $data['id']
    ]);

    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>