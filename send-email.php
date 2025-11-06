<?php
// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method not allowed');
}

// Set headers for JSON response
header('Content-Type: application/json');

// Email configuration
$to_email = 'resultl460@gmail.com';
$from_name = 'Lottery Results Contact Form';

// Get form data
$name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$subject = isset($_POST['subject']) ? strip_tags(trim($_POST['subject'])) : '';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

// Validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
}

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address';
}

if (empty($subject)) {
    $errors[] = 'Subject is required';
}

if (empty($message)) {
    $errors[] = 'Message is required';
}

// If there are errors, return them
if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit;
}

// Build email subject
$subject_map = [
    'general' => 'General Inquiry',
    'bug' => 'Bug Report',
    'feature' => 'Feature Request',
    'support' => 'Technical Support',
    'feedback' => 'Feedback',
    'other' => 'Other'
];

$email_subject = isset($subject_map[$subject]) ? $subject_map[$subject] : 'Contact Form Submission';
$email_subject = "[$from_name] $email_subject - From: $name";

// Build email body
$email_body = "You have received a new message from the contact form.\n\n";
$email_body .= "Contact Details:\n";
$email_body .= "-------------------\n";
$email_body .= "Name: $name\n";
$email_body .= "Email: $email\n";
$email_body .= "Subject: " . (isset($subject_map[$subject]) ? $subject_map[$subject] : $subject) . "\n\n";
$email_body .= "Message:\n";
$email_body .= "-------------------\n";
$email_body .= "$message\n\n";
$email_body .= "-------------------\n";
$email_body .= "Sent from: " . $_SERVER['HTTP_HOST'] . "\n";
$email_body .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";
$email_body .= "Date: " . date('Y-m-d H:i:s') . "\n";

// Email headers
$headers = [];
$headers[] = "From: $from_name <noreply@" . $_SERVER['HTTP_HOST'] . ">";
$headers[] = "Reply-To: $name <$email>";
$headers[] = "X-Mailer: PHP/" . phpversion();
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";

// Send email
$mail_sent = @mail($to_email, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message! We will get back to you within 24 hours.'
    ]);
} else {
    // If mail() fails, try alternative method or log error
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, there was an error sending your message. Please try again later or email us directly at resultl460@gmail.com'
    ]);
}
?>
