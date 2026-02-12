<?php
// php/db.php
$host = 'localhost';
$dbname = 'vite_et_gourmand';
$user = 'root';
$pass = ''; // Vide par défaut sur Wamp

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    // On active les erreurs SQL pour le débogage
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>