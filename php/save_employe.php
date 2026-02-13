<?php
header('Content-Type: application/json');
require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (isset($data['fullname'], $data['email'], $data['password'])) {
    
    $fullname = htmlspecialchars($data['fullname']);
    $email = htmlspecialchars($data['email']);
    $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // On récupère l'ID du JS ou on en génère un compatible varchar(50)
    $id = isset($data['id']) ? $data['id'] : "EMP-" . round(microtime(true) * 1000);
    
    $role = 'employe';
    $suspendu = 0;

    try {
        // Utilisation de $pdo (au lieu de $db) pour correspondre à db.php
        $query = $pdo->prepare("INSERT INTO users (id, fullname, email, password, role, suspendu) 
                                VALUES (:id, :fullname, :email, :password, :role, :suspendu)");
        
        $result = $query->execute([
            'id'       => $id,
            'fullname' => $fullname,
            'email'    => $email,
            'password' => $passwordHash,
            'role'     => $role,
            'suspendu' => $suspendu
        ]);

        if ($result) {
            echo json_encode(["status" => "success", "id" => $id, "message" => "Employé enregistré"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Erreur lors de l'insertion"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Données incomplètes"]);
}
?>