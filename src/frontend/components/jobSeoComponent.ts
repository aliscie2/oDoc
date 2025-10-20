// Consolidated Job SEO Component
// Handles all SEO-related functionality for job pages

interface Job {
  id: string;
  job_titles?: string[];
  description?: string;
  skills?: string[];
  category?: Record<string, any>;
  date_created?: string;
}

interface User {
  name?: string;
  photo?: Uint8Array | number[];
}

export class JobSEOManager {
  private static instance: JobSEOManager;

  static getInstance(): JobSEOManager {
    if (!JobSEOManager.instance) {
      JobSEOManager.instance = new JobSEOManager();
    }
    return JobSEOManager.instance;
  }

  // Generate thumbnail image as data URL
  generateThumbnail = async (
    title: string,
    description: string,
    skills: string[] = [],
    userPhoto?: string,
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 1200;
      canvas.height = 630;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#f8fafc");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      const leftMargin = 60;
      const rightMargin = 120; // Increased significantly
      const avatarX = leftMargin;
      const avatarY = 80;
      const avatarRadius = 50;

      const drawDefaultAvatar = () => {
        const gradient = ctx.createRadialGradient(
          avatarX + avatarRadius,
          avatarY + avatarRadius,
          0,
          avatarX + avatarRadius,
          avatarY + avatarRadius,
          avatarRadius,
        );
        gradient.addColorStop(0, "#f8f9fa");
        gradient.addColorStop(1, "#e9ecef");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
          avatarX + avatarRadius,
          avatarY + avatarRadius,
          avatarRadius,
          0,
          2 * Math.PI,
        );
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#6c757d";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "48px system-ui, Arial, sans-serif";
        ctx.fillText("👤", avatarX + avatarRadius, avatarY + avatarRadius);
      };

      const finishThumbnail = () => {
        const titleX = avatarX + avatarRadius * 2 + 40;
        const titleY = avatarY + 10;
        const maxWidth = canvas.width - titleX - rightMargin;

        // Title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 34px system-ui, Arial, sans-serif"; // Slightly smaller
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const words = (title || "Job Opportunity").split(" ");
        let line = "",
          y = titleY,
          lineCount = 0;

        for (let i = 0; i < words.length && lineCount < 2; i++) {
          const testLine = line + words[i] + " ";
          if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
            ctx.fillText(line.trim(), titleX, y);
            line = words[i] + " ";
            y += 45;
            lineCount++;
          } else {
            line = testLine;
          }
        }
        if (line.trim() && lineCount < 2) {
          ctx.fillText(line.trim(), titleX, y);
        }

        // Description
        ctx.fillStyle = "#475569";
        ctx.font = "28px system-ui, Arial, sans-serif"; // Slightly smaller
        const descY = y + 70;
        const descWords = (
          description || "Explore this opportunity on ICPJobs"
        ).split(" ");
        const truncatedDesc =
          descWords.slice(0, 15).join(" ") +
          (descWords.length > 15 ? "..." : "");

        let descLine = "",
          descY2 = descY,
          descLineCount = 0;
        for (const word of truncatedDesc.split(" ")) {
          const testLine = descLine + word + " ";
          if (
            ctx.measureText(testLine).width > maxWidth &&
            descLine.length > 0
          ) {
            ctx.fillText(descLine.trim(), titleX, descY2);
            descLine = word + " ";
            descY2 += 36;
            descLineCount++;
            if (descLineCount >= 2) break;
          } else {
            descLine = testLine;
          }
        }
        if (descLine.trim() && descLineCount < 2) {
          ctx.fillText(descLine.trim(), titleX, descY2);
        }

        // Skills
        if (skills?.length > 0) {
          ctx.fillStyle = "#3b82f6";
          ctx.font = "22px system-ui, Arial, sans-serif"; // Slightly smaller
          const skillsY = descY2 + 50;
          const skillsText = skills.slice(0, 4).join(" • ");

          let finalSkillsText = skillsText;
          while (
            ctx.measureText(finalSkillsText).width > maxWidth &&
            finalSkillsText.length > 10
          ) {
            finalSkillsText =
              finalSkillsText.substring(0, finalSkillsText.length - 10) + "...";
          }
          ctx.fillText(finalSkillsText, titleX, skillsY);
        }

        // Domain name
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 28px system-ui, Arial, sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(
          window.location.hostname,
          canvas.width - rightMargin + 20,
          canvas.height - 40,
        );

        resolve(canvas.toDataURL("image/png"));
      };

      if (userPhoto) {
        const avatarImg = new Image();
        avatarImg.crossOrigin = "anonymous";
        avatarImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            avatarX + avatarRadius,
            avatarY + avatarRadius,
            avatarRadius,
            0,
            2 * Math.PI,
          );
          ctx.clip();
          ctx.drawImage(
            avatarImg,
            avatarX,
            avatarY,
            avatarRadius * 2,
            avatarRadius * 2,
          );
          ctx.restore();
          finishThumbnail();
        };
        avatarImg.onerror = () => {
          drawDefaultAvatar();
          finishThumbnail();
        };
        avatarImg.src = userPhoto;
      } else {
        drawDefaultAvatar();
        finishThumbnail();
      }
    });
  };
  // Update meta tags for SEO
  updateMetaTags = (tags: Record<string, string>) => {
    Object.entries(tags).forEach(([property, content]) => {
      const existingTag = document.querySelector(
        `meta[property="${property}"], meta[name="${property}"]`,
      );

      if (existingTag) {
        existingTag.setAttribute("content", content);
      } else {
        const metaTag = document.createElement("meta");
        if (property.startsWith("og:") || property.startsWith("article:")) {
          metaTag.setAttribute("property", property);
        } else {
          metaTag.setAttribute("name", property);
        }
        metaTag.setAttribute("content", content);
        document.head.appendChild(metaTag);
      }
    });
  };

  // Update structured data for search engines
  updateStructuredData = (job: Job, user?: User) => {
    let existingScript = document.getElementById("job-structured-data");

    if (!existingScript) {
      existingScript = document.createElement("script");
      existingScript.type = "application/ld+json";
      existingScript.id = "job-structured-data";
      document.head.appendChild(existingScript);
    }

    existingScript.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.job_titles?.[0] || "Job Opportunity",
      description: job.description || "Explore this job opportunity on ICPJobs",
      datePosted: job.date_created
        ? new Date(Number(job.date_created) / 1000000).toISOString()
        : new Date().toISOString(),
      hiringOrganization: {
        "@type": "Organization",
        name: user?.name || "ICPJobs Employer",
      },
      jobLocation: {
        "@type": "Place",
        address: "Remote",
      },
      employmentType: job.category ? Object.keys(job.category)[0] : "Full-time",
      skills: job.skills?.length > 0 ? job.skills.join(", ") : undefined,
      url: window.location.href,
      identifier: {
        "@type": "PropertyValue",
        name: "Job ID",
        value: job.id,
      },
    });
  };

  // Complete SEO setup for a job page
  setupJobSEO = async (job: Job, user?: User, customThumbnail?: string) => {
    const title = job.job_titles?.[0] || "Job Opportunity";
    const description =
      job.description || "Explore this job opportunity on ICPJobs";

    // Generate thumbnail if not provided
    const thumbnailUrl =
      customThumbnail ||
      (await this.generateThumbnail(
        title,
        description,
        job.skills,
        user?.photo,
      ));

    // Update meta tags
    this.updateMetaTags({
      "og:title": title,
      "og:description": description,
      "og:image": thumbnailUrl,
      "og:url": window.location.href,
      "og:type": "website",
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": thumbnailUrl,
      description: description,
    });

    // Update structured data
    this.updateStructuredData(job, user);

    // Update page title
    document.title = `${title} | ICPJobs`;

    return thumbnailUrl;
  };
}

// Export singleton instance
export const jobSEO = JobSEOManager.getInstance();
