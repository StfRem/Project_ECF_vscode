<?php
// php/db.php
$host = 'localhost';
$dbname = 'vite_et_gourmand';
$user = 'root';
$pass = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // On précise au navigateur qu'on répond en JSON
    header('Content-Type: application/json');
    // On envoie l'erreur proprement pour que le JS puisse l'afficher
    echo json_encode([
        'status' => 'error', 
        'message' => 'Liaison BDD échouée : ' . $e->getMessage()
    ]);
    exit;
}
?>