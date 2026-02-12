<?php
header('Content-Type: application/json');
require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (isset($data['id'])) {
    $id = $data['id'];

    try {
        // Attention : si ton ID en BDD est un chiffre (INT) 
        // et ton ID JS est "EMP-123...", il faudra peut-être adapter.
        // Ici on part du principe que tu cibles la colonne 'id'
        $query = $db->prepare("DELETE FROM users WHERE id = :id AND role = 'employe'");
        $result = $query->execute(['id' => $id]);

        if ($result) {
            echo json_encode(["status" => "success", "message" => "Employé supprimé de la BDD"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Erreur lors de la suppression"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID manquant"]);
}
?>