const apiKey = import.meta.env.VITE_MAINGUN_KEY;

export const sendEmail = async (to: string) => {
  const domain = "odoc.app"; // Replace with your Mailgun domain
  const from = "weplutus.1@gmail.com"; // Replace with your sender email

  const formData = new FormData();
  formData.append('from', from);
  formData.append('to', to);
  formData.append('subject', 'New Connection Request');
  formData.append('text', 'A user has requested to connect with you regarding a job posting.');

  try {
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};