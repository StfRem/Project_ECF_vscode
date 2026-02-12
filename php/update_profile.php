<?php
header("Content-Type: application/json");
require_once "db.php";

$content = file_get_contents("php://input");
$data = json_decode($content, true);

if (!$data || !isset($data['email'])) {
    echo json_encode(["status" => "error", "message" => "Email manquant"]);
    exit;
}

try {
    $fields = [];
    $params = [];

    // On vérifie chaque champ : s'il n'est pas vide, on l'ajoute à la mise à jour
    if (!empty($data['fullname'])) {
        $fields[] = "fullname = ?";
        $params[] = $data['fullname'];
    }
    if (!empty($data['gsm'])) {
        $fields[] = "gsm = ?";
        $params[] = $data['gsm'];
    }
    if (!empty($data['address'])) {
        $fields[] = "address = ?";
        $params[] = $data['address'];
    }
    if (!empty($data['cp'])) {
        $fields[] = "cp = ?";
        $params[] = $data['cp'];
    }

    if (empty($fields)) {
        echo json_encode(["status" => "error", "message" => "Aucune donnée à modifier"]);
        exit;
    }

    // On ajoute l'email à la fin pour le WHERE
    $params[] = $data['email'];
    
    // On construit la requête finale : UPDATE users SET champ1 = ?, champ2 = ? WHERE email = ?
    $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE email = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode(["status" => "success", "message" => "Mise à jour réussie"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>