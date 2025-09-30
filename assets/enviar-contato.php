<?php

var_dump("teste")
die();
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = trim($_POST["message"]);

    $recipient = "nicolasdanielmalheiros@gmail.com"; 

    $subject = "Nova mensagem de contato de $name";

    $email_content = "Nome: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Mensagem:\n$message\n";

    $email_headers = "From: $name <$email>";

    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400); // Bad Request
        echo "Por favor, preencha todos os campos.";
        exit;
    }

    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo "Obrigado! Sua mensagem foi enviada.";
    } else {
        http_response_code(500); // Internal Server Error
        echo "Ocorreu um erro ao enviar a mensagem. Tente novamente.";
    } 

} else {
    http_response_code(403); // Forbidden
    echo "Houve um problema com o envio, tente novamente.";
}
?>