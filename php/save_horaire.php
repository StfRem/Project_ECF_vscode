<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'], $data['jour'], $data['ouverture'], $data['fermeture'])) {
    try {
        // Utilisation de REPLACE pour que ça fonctionne à l'ajout ET à la modification
        $query = $pdo->prepare("REPLACE INTO horaires (id, jour, ouverture, fermeture) VALUES (:id, :jour, :ouverture, :fermeture)");
        $query->execute([
            'id' => $data['id'],
            'jour' => $data['jour'],
            'ouverture' => $data['ouverture'],
            'fermeture' => $data['fermeture']
        ]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>