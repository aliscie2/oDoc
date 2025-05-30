import emailjs from "@emailjs/browser";
import sanitizeHtml from "sanitize-html";

// Initialize EmailJS (call this once when your app starts)
emailjs.init(import.meta.env.VITE_REACT_APP_EMAILJS_USER_ID);

/**
 * Send an email using EmailJS
 * @param {string} subject - Email subject line
 * @param {string} body - Email body content (can be plain text or HTML)
 * @param {string} receiverEmail - Recipient email address
 * @returns {Promise<boolean>} - Returns true if email sent successfully, false otherwise
 */
const sendEmail = async (subject:string, body:string, receiverEmail:string[], extra:any={}, template:string = import.meta.env.VITE_REACT_APP_EMAILJS_TEMPLATE_ID) => {
  try {
    // Sanitize HTML content to prevent XSS attacks
    const sanitizedBody = sanitizeHtml(body, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ["href", "target"],
        img: ["src", "alt"],
      },
    });

    const response = await emailjs.send(
      import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID,
      template,
      {
        ...extra,
        from_email: "no_repaly@odoc.app",
        // from_email: "weplutus@gmail.com",
        to_email: receiverEmail,
        subject: subject,
        html_message: sanitizedBody,
      }
    );


    if (response.status === 200) {

      return true;
    } else {
      console.error("Failed to send email:", response);
      return false;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Usage example:
// sendEmail("Test Subject", "<h1>Hello World!</h1><p>This is a test email.</p>", "recipient@example.com");

export default sendEmail;