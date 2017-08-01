<?php
    // message that will be displayed when everything is OK :)
    $OKMessage = 'Contact form successfully submitted.<br>Thank you, we will get back to you soon!';
    // If something goes wrong, we will display this message.
    $errorMessage = array();

    $from_name = strip_tags(trim($_POST['name']));
    $from_email = strip_tags(trim($_POST['from_email']));
    $subject = "New message from Owltree contact form";
    $body = strip_tags(trim($_POST['body']));

    // $to_email = "hello@owltreebcn.com";
    $to_email = "hello@owltreebcn.com";

    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "From: " . $from_name . "<" .$from_email . ">" . "\r\n";
    // $headers .= "Cc: welcome@example.com" . "\r\n";
    // $headers .= "Bcc: welcome2@example.com" . "\r\n";

    function sanitize_email($email) {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return true;
        } else {
            array_push($errorMessage, "Invalid email format.");
        }
    }

    function is_valid_email($email) {
        return preg_match("#^[a-z0-9.!\#$%&\"*+-/=?^_`{|}~]+@([0-9.]+|([^\s]+\.+[a-z]{2,6}))$#si", $email);
    }

    function contains_bad_str($str_to_test) {
        $bad_strings = array(
            "content-type:",
            "mime-version:",
            "multipart/mixed",
            "Content-Transfer-Encoding:",
            "bcc:",
            "cc:",
            "to:"
        );

        foreach ($bad_strings as $bad_string) {
            if (preg_match("/" . $bad_string ."/i", $str_to_test)) {
                echo "$bad_string found. Suspected injection attempt.";
                exit;
            }
        }
    }

    function contains_newlines($str_to_test) {
        if (preg_match("/(%0A|%0D|\\n+|\\r+)/i", $str_to_test) != 0) {
            echo "Newline found in $str_to_test. Suspected injection attempt.";
            exit;
        }
    }

    if ($_SERVER["REQUEST_METHOD"] != "POST"){
       echo "Unauthorized attempt to access page.";
       exit;
    }

    contains_bad_str($from_email);
    contains_bad_str($to_email);
    contains_bad_str($subject);
    contains_bad_str($body);

    contains_newlines($from_email);
    contains_newlines($to_email);
    contains_newlines($subject);

    sanitize_email($from_email);
    sanitize_email($to_email);

    try {
        if (count($_POST) == 0) throw new \Exception('Form is empty');
        if (!$from_name) {
            array_push($errorMessage, array("field" => "name", "text" => "Name is required."));
        }
        if (!$from_email) {
            array_push($errorMessage, array("field" => "from_email", "text" => "Email is required."));
        }
        if (!$body) {
            array_push($errorMessage, array("field" => "body", "text" => "Message is required."));
        }
        if ($from_name && $from_email && $body) {
            if (!is_valid_email($from_email)) {
                array_push($errorMessage, array("field" => "from_email", "text" => "Invalid email submitted. Email should be something like this yourname@example.com"));
                $responseArray = array('type' => 'danger', 'message' => $errorMessage);
            } else {
                if (mail($to_email, $subject, $body, $headers)) {
                    $responseArray = array('type' => 'success', 'message' => $OKMessage);
                } else {
                    array_push($errorMessage, array("field" => "from_email", "text" => "There was an error while submitting the form. Please try again later"));
                    $responseArray = array('type' => 'danger', 'message' => $errorMessage);
                }
            }
        } else {
            $responseArray = array('type' => 'danger', 'message' => $errorMessage);
        }
    }

    catch (\Exception $e) {
        array_push($errorMessage, 'There was an error while submitting the form. Please try again later');
        $responseArray = array('type' => 'danger', 'message' => $errorMessage);
    }

    // if requested by AJAX request return JSON response
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        $encoded = json_encode($responseArray);

        header('Content-Type: application/json');

        echo $encoded;
    }
    // else just display the message
    else {
        echo $responseArray['message'];
    }
?>
