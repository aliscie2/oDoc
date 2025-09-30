import React, { useState } from "react";
import sanitizeHtml from "sanitize-html";
import sendEmail from "../../utils/sendEmail";
import { backendActor } from "@/utils/backendUtils";

const EmailComposer = () => {
  // Using direct backendActor import
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sanitizeConfig = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "target"],
      img: ["src", "alt"],
    },
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      alert("Subject and content are required");
      return;
    }

    try {
      setIsSending(true);
      const sanitizedHtml = sanitizeHtml(htmlContent, sanitizeConfig);
      const email_list = (await backendActor.get_emails()) || [];

      email_list.forEach(async (email) => {
        const response = await sendEmail(subject, sanitizedHtml, email);
        if (response.status !== 200) {
        }
      });

      setIsDialogOpen(false);
      setHtmlContent("");
      setSubject("");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email: " + error.text);
    } finally {
      setIsSending(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setHtmlContent("");
    setSubject("");
  };

  return (
    <>
      <button onClick={() => setIsDialogOpen(true)}>Compose Email</button>

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

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleSendEmail}
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
                }}
              >
                {isSending ? "Sending..." : "Send Email"}
              </button>
              <button
                onClick={closeDialog}
                style={{
                  padding: "10px 20px",
                  border: "1px solid currentColor",
                  borderRadius: "4px",
                  backgroundColor: "inherit",
                  color: "inherit",
                  cursor: "pointer",
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
