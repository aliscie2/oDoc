const apiKey = import.meta.env.VITE_MAILJET_KEY;
const secretApiKey = import.meta.env.VITE_MAILJET_SECRET_KEY;

/**
 * Send email using Mailjet API
 * @param {Object} emailData - Email configuration object
 * @param {string} emailData.fromEmail - Sender email address
 * @param {string} emailData.fromName - Sender name (optional)
 * @param {Array|string} emailData.to - Recipients (array of objects or single email string)
 * @param {Array} [emailData.cc] - CC recipients (optional)
 * @param {Array} [emailData.bcc] - BCC recipients (optional)
 * @param {string} emailData.subject - Email subject
 * @param {string} [emailData.textPart] - Plain text content
 * @param {string} [emailData.htmlPart] - HTML content
 * @param {number} [emailData.templateId] - Template ID (alternative to text/html content)
 * @param {Object} [emailData.variables] - Template variables
 * @param {Array} [emailData.attachments] - File attachments
 * @param {string} [emailData.customId] - Custom message ID
 * @param {string} [emailData.customCampaign] - Campaign name
 * @param {boolean} [emailData.templateLanguage] - Enable template language
 * @param {boolean} [emailData.sandboxMode] - Enable sandbox mode
 * @returns {Promise<Object>} Response from Mailjet API
 */
async function sendEmail({
  fromEmail="weplutus.1@gmail.com",
  fromName = null,
  to,
  cc = null,
  bcc = null,
  subject="any",
  textPart = null,
  htmlPart = null,
  templateId = null,
  variables = null,
  attachments = null,
  customId = null,
  customCampaign = null,
  templateLanguage = false,
  sandboxMode = false
}) {
  const url = 'https://api.mailjet.com/v3.1/send';
  
  // Create base64 encoded credentials for basic auth
  const credentials = btoa(`${apiKey}:${secretApiKey}`);
  
  // Helper function to format recipients
  const formatRecipients = (recipients) => {
    if (!recipients) return null;
    if (typeof recipients === 'string') {
      return [{ Email: recipients }];
    }
    if (Array.isArray(recipients)) {
      return recipients.map(recipient => {
        if (typeof recipient === 'string') {
          return { Email: recipient };
        }
        return {
          Email: recipient.email || recipient.Email,
          ...(recipient.name || recipient.Name) && { Name: recipient.name || recipient.Name }
        };
      });
    }
    return [recipients];
  };

  // Build message object
  const message = {
    From: {
      Email: fromEmail,
      ...(fromName && { Name: fromName })
    },
    To: formatRecipients(to),
    Subject: subject
  };

  // Add optional recipients
  if (cc) message.Cc = formatRecipients(cc);
  if (bcc) message.Bcc = formatRecipients(bcc);

  // Add content (template or text/html)
  if (templateId) {
    message.TemplateID = templateId;
  } else {
    if (textPart) message.TextPart = textPart;
    if (htmlPart) message.HTMLPart = htmlPart;
    
    // Validate that at least one content type is provided
    if (!textPart && !htmlPart) {
      throw new Error('Either textPart, htmlPart, or templateId must be provided');
    }
  }

  // Add optional properties
  if (variables) message.Variables = variables;
  if (attachments) message.Attachments = attachments;
  if (customId) message.CustomID = customId;
  if (customCampaign) message.CustomCampaign = customCampaign;
  if (templateLanguage) message.TemplateLanguage = templateLanguage;

  const emailPayload = {
    Messages: [message]
  };

  // Add sandbox mode if specified
  if (sandboxMode) {
    emailPayload.SandboxMode = sandboxMode;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(emailPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mailjet API error: ${response.status} - ${data.ErrorMessage || 'Unknown error'}`);
    }

    return {
      success: true,
      data: data,
      messages: data.Messages || [],
      messageIds: data.Messages?.[0]?.To?.map(recipient => recipient.MessageID) || []
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage:
/*
// Basic email
const basicEmail = await sendEmail({
  fromEmail: 'sender@example.com',
  fromName: 'Your App Name',
  to: 'recipient@example.com',
  subject: 'Welcome to our platform!',
  textPart: 'Thank you for signing up. We\'re excited to have you!',
  htmlPart: '<h1>Welcome!</h1><p>Thank you for signing up. We\'re excited to have you!</p>'
});

// Advanced email with multiple recipients and attachments
const advancedEmail = await sendEmail({
  fromEmail: 'sender@example.com',
  fromName: 'Your App Name',
  to: [
    { email: 'recipient1@example.com', name: 'John Doe' },
    { email: 'recipient2@example.com', name: 'Jane Smith' }
  ],
  cc: ['manager@example.com'],
  subject: 'Project Update',
  htmlPart: '<h1>Project Status</h1><p>Please find the update attached.</p>',
  attachments: [
    {
      ContentType: 'application/pdf',
      Filename: 'report.pdf',
      Base64Content: 'base64-encoded-content-here'
    }
  ],
  customId: 'project-update-001',
  customCampaign: 'Monthly Updates'
});

// Template-based email with variables
const templateEmail = await sendEmail({
  fromEmail: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Your Order Confirmation',
  templateId: 12345,
  variables: {
    customerName: 'John Doe',
    orderNumber: 'ORD-001',
    orderTotal: '$99.99'
  },
  templateLanguage: true
});

// Sandbox mode for testing
const testEmail = await sendEmail({
  fromEmail: 'sender@example.com',
  to: 'test@example.com',
  subject: 'Test Email',
  textPart: 'This is a test email',
  sandboxMode: true
});

if (basicEmail.success) {
  console.log('Email sent successfully:', basicEmail.messageIds);
} else {
  console.error('Failed to send email:', basicEmail.error);
}
*/

export { sendEmail };