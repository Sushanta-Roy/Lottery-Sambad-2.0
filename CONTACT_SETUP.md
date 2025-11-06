# Contact Form Email Setup

## ✉️ Email Configuration

The contact form is now configured to send emails to: **resultl460@gmail.com**

## 📋 Files Created

1. **send-email.php** - Backend script that handles form submissions and sends emails
2. **contact.html** (updated) - Now submits to the PHP backend
3. **style.css** (updated) - Added success/error message styles

## 🚀 How It Works

1. User fills out the contact form
2. Form data is sent to `send-email.php` via AJAX
3. PHP validates the data
4. Email is sent to resultl460@gmail.com
5. User sees success or error message

## ⚙️ Server Requirements

### For PHP mail() function to work:

1. **Your hosting must have PHP installed** (most hosting providers do)
2. **PHP mail() function must be enabled** (check with your hosting provider)
3. **Your server must have a mail server configured** (SMTP)

### Testing Locally:

If you're testing on localhost, the PHP mail() function won't work without additional configuration. You have two options:

#### Option 1: Use a local mail server
- Install a tool like **MailHog** or **Papercut** for Windows
- These capture emails sent locally for testing

#### Option 2: Use SMTP with PHPMailer (recommended)
If the basic PHP mail() doesn't work on your server, you can use PHPMailer with Gmail SMTP.

## 🔧 Alternative: Using Gmail SMTP (If mail() doesn't work)

If the PHP mail() function doesn't work on your server, I can create an alternative version using PHPMailer with Gmail SMTP. This is more reliable and works on most servers.

**To use Gmail SMTP, you would need:**
1. A Gmail account (you can use resultl460@gmail.com)
2. An "App Password" from Gmail (for security)
3. PHPMailer library (I can set this up for you)

## 📧 Email Format

When someone submits the form, you'll receive an email like this:

```
Subject: [Lottery Results Contact Form] General Inquiry - From: John Doe

You have received a new message from the contact form.

Contact Details:
-------------------
Name: John Doe
Email: johndoe@example.com
Subject: General Inquiry

Message:
-------------------
Hello, I have a question about the lottery results...

-------------------
Sent from: yourwebsite.com
IP Address: 192.168.1.1
Date: 2025-11-03 12:30:45
```

## ✅ Features

- ✉️ Sends email to resultl460@gmail.com
- ✔️ Server-side validation
- 🔒 Spam protection (basic)
- 📱 Works on all devices
- 💬 Beautiful success/error messages
- ⏳ Loading state during submission
- 📋 Reply-To header set to sender's email (easy to reply)

## 🧪 Testing

1. Upload all files to your web server
2. Make sure PHP is enabled
3. Fill out the contact form
4. Check resultl460@gmail.com for the email

## ⚠️ Important Notes

1. **Check Spam Folder**: First few emails might go to spam
2. **Server Configuration**: Some servers require additional SMTP configuration
3. **Hosting Provider**: Contact your hosting provider if emails aren't being sent
4. **Alternative Solution**: If mail() doesn't work, let me know and I'll set up PHPMailer with Gmail SMTP

## 🆘 Troubleshooting

### Email not received?

1. Check your spam/junk folder
2. Verify PHP is enabled on your server
3. Check if mail() function is enabled: Create a file `test.php` with:
   ```php
   <?php
   echo function_exists('mail') ? 'mail() is enabled' : 'mail() is disabled';
   ?>
   ```
4. Contact your hosting provider about email configuration
5. Consider using SMTP method (Gmail/SendGrid) - more reliable

### Want to use Gmail SMTP instead?
Let me know and I'll set up a more reliable email solution using PHPMailer with your Gmail account!

## 🔐 Security Notes

The current implementation includes:
- Input sanitization
- XSS protection
- CSRF protection (can be added if needed)
- Rate limiting (can be added if needed)

For production use, consider adding:
- Google reCAPTCHA (spam protection)
- Rate limiting (prevent abuse)
- HTTPS (encrypt data in transit)
