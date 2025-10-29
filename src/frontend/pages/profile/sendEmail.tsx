import { useState } from "react";
import sanitizeHtml from "sanitize-html";
import sendEmail from "../../utils/sendEmail";
import { backendActor } from "@/utils/backendUtils";

const EmailComposer = () => {
  // Using direct backendActor import
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasPendingCampaign, setHasPendingCampaign] = useState(false);

  const sanitizeConfig = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "target"],
      img: ["src", "alt"],
    },
  };

  const handleSendEmail = async (resumeCampaign = false) => {
    if (!subject.trim() || !htmlContent.trim()) {
      alert("Subject and content are required");
      return;
    }

    try {
      setIsSending(true);
      const sanitizedHtml = sanitizeHtml(htmlContent, sanitizeConfig);

      const CAMPAIGN_KEY = "campaignPage";
      
      // Get the last processed page from localStorage (default to 0)
      let page = resumeCampaign
        ? parseInt(localStorage.getItem(CAMPAIGN_KEY) || "0", 10)
        : 0;
      
      // If starting fresh, reset to page 0
      if (!resumeCampaign) {
        localStorage.setItem(CAMPAIGN_KEY, "0");
        page = 0;
      }
      
      let hasMore = true;
      let totalSent = 0;

      while (hasMore) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const email_list = (await (backendActor.get_emails as any)(page)) || [];

        if (email_list.length === 0 || email_list.length < 30) {
          hasMore = false;
        }

        if (email_list.length > 0) {
          // Send emails for this batch
          await sendEmail(subject, sanitizedHtml, email_list);
          totalSent += email_list.length;
          
          // Save progress after each successful batch
          page++;
          localStorage.setItem(CAMPAIGN_KEY, page.toString());
        } else {
          break;
        }
      }

      // Clear the campaign progress after completion
      localStorage.removeItem(CAMPAIGN_KEY);
      setHasPendingCampaign(false);
      
      setIsDialogOpen(false);
      setHtmlContent("");
      setSubject("");
      alert(`All emails sent successfully! Total: ${totalSent} emails`);
    } catch (error) {
      console.error("Error sending email:", error);
      alert(
        "Error sending email: " +
          (error instanceof Error ? error.message : String(error)) +
          "\nProgress has been saved. You can retry to continue from where it stopped.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const checkForPendingCampaign = () => {
    const hasPending = localStorage.getItem("campaignPage") !== null;
    setHasPendingCampaign(hasPending);
  };

  const clearPendingCampaign = () => {
    localStorage.removeItem("campaignPage");
    setHasPendingCampaign(false);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setHtmlContent("");
    setSubject("");
  };

  return (
    <>
      <button
        onClick={() => {
          checkForPendingCampaign();
          setIsDialogOpen(true);
        }}
      >
        Compose Email
      </button>

      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "inherit",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflow: "auto",
              border: "1px solid currentColor",
            }}
          >
            <input
              type="text"
              placeholder="Subject *"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "15px",
                border: "1px solid currentColor",
                borderRadius: "4px",
                backgroundColor: "inherit",
                color: "inherit",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div>
                <h4>HTML Editor</h4>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  required
                  placeholder="Enter HTML content here... *"
                  style={{
                    width: "100%",
                    height: "300px",
                    padding: "10px",
                    fontFamily: "monospace",
                    border: "1px solid currentColor",
                    borderRadius: "4px",
                    backgroundColor: "inherit",
                    color: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <h4>Preview</h4>
                <div
                  style={{
                    border: "1px solid currentColor",
                    padding: "10px",
                    height: "300px",
                    overflow: "auto",
                    backgroundColor: "inherit",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(htmlContent, sanitizeConfig),
                  }}
                />
              </div>
            </div>

            {hasPendingCampaign && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  border: "1px solid orange",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255, 165, 0, 0.1)",
                }}
              >
                <p style={{ margin: "0 0 10px 0" }}>
                  ⚠️ A previous email campaign was interrupted. Do you want to
                  resume or start fresh?
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleSendEmail(true)}
                    disabled={isSending}
                    style={{
                      padding: "5px 15px",
                      border: "1px solid currentColor",
                      borderRadius: "4px",
                      backgroundColor: "inherit",
                      color: "inherit",
                      cursor: isSending ? "not-allowed" : "pointer",
                    }}
                  >
                    Resume
                  </button>
                  <button
                    onClick={clearPendingCampaign}
                    disabled={isSending}
                    style={{
                      padding: "5px 15px",
                      border: "1px solid currentColor",
                      borderRadius: "4px",
                      backgroundColor: "inherit",
                      color: "inherit",
                      cursor: isSending ? "not-allowed" : "pointer",
                    }}
                  >
                    Clear & Start Fresh
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleSendEmail(false)}
                disabled={isSending || !subject.trim() || !htmlContent.trim()}
                style={{
                  padding: "10px 20px",
                  border: "1px solid currentColor",
                  borderRadius: "4px",
                  backgroundColor: "inherit",
                  color: "inherit",
                  cursor:
                    isSending || !subject.trim() || !htmlContent.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isSending || !subject.trim() || !htmlContent.trim()
                      ? 0.5
                      : 1,
                }}
              >
                {isSending ? "Sending..." : "Send Email"}
              </button>
              <button
                onClick={closeDialog}
                disabled={isSending}
                style={{
                  padding: "10px 20px",
                  border: "1px solid currentColor",
                  borderRadius: "4px",
                  backgroundColor: "inherit",
                  color: "inherit",
                  cursor: isSending ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailComposer;
