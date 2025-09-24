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
    userPhoto?: Uint8Array | number[]
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 1200;
      canvas.height = 630;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8fafc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Avatar section
      const avatarX = 60;
      const avatarY = 80;
      const avatarRadius = 50;

      const drawDefaultAvatar = () => {
        const gradient = ctx.createRadialGradient(
          avatarX + avatarRadius, avatarY + avatarRadius, 0,
          avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius
        );
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Avatar icon
        ctx.fillStyle = '#6c757d';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '48px system-ui, Arial, sans-serif';
        ctx.fillText('👤', avatarX + avatarRadius, avatarY + avatarRadius);
      };

      const finishThumbnail = () => {
        // Title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px system-ui, Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const titleX = avatarX + avatarRadius * 2 + 50;
        const titleY = avatarY + 10;
        const maxWidth = canvas.width - titleX - 40;

        // Wrap title text
        const words = (title || 'Job Opportunity').split(' ');
        let line = '';
        let y = titleY;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && line.length > 0) {
            ctx.fillText(line.trim(), titleX, y);
            line = words[i] + ' ';
            y += 50;
            if (y > titleY + 50) break; // Max 2 lines
          } else {
            line = testLine;
          }
        }
        if (line.trim()) {
          ctx.fillText(line.trim(), titleX, y);
        }

        // Description
        ctx.fillStyle = '#475569';
        ctx.font = '32px system-ui, Arial, sans-serif';
        const descY = Math.max(y + 60, titleY + 100);
        const truncatedDesc = (description || 'Explore this opportunity on ICPJobs')
          .split(' ').slice(0, 25).join(' ') + '...';
        
        ctx.fillText(truncatedDesc, titleX, descY);

        // Skills
        if (skills && skills.length > 0) {
          ctx.fillStyle = '#3b82f6';
          ctx.font = '24px system-ui, Arial, sans-serif';
          const skillsY = descY + 60;
          const skillsText = skills.slice(0, 5).join(' • ');
          ctx.fillText(skillsText, titleX, skillsY);
        }

        // Branding
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 32px system-ui, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(window.location.hostname, canvas.width - 60, canvas.height - 40);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      // Handle user photo if provided
      if (userPhoto && userPhoto.length > 0) {
        const avatarImg = new Image();
        avatarImg.crossOrigin = 'anonymous';
        avatarImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(avatarImg, avatarX, avatarY, avatarRadius * 2, avatarRadius * 2);
          ctx.restore();
          finishThumbnail();
        };
        avatarImg.onerror = () => {
          drawDefaultAvatar();
          finishThumbnail();
        };
        
        // Convert Uint8Array to blob URL
        const blob = new Blob([new Uint8Array(userPhoto)], { type: 'image/jpeg' });
        avatarImg.src = URL.createObjectURL(blob);
      } else {
        drawDefaultAvatar();
        finishThumbnail();
      }
    });
  };

  // Update meta tags for SEO
  updateMetaTags = (tags: Record<string, string>) => {
    Object.entries(tags).forEach(([property, content]) => {
      const existingTag = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const metaTag = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('article:')) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', property);
        }
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    });
  };

  // Update structured data for search engines
  updateStructuredData = (job: Job, user?: User) => {
    let existingScript = document.getElementById('job-structured-data');
    
    if (!existingScript) {
      existingScript = document.createElement('script');
      existingScript.type = 'application/ld+json';
      existingScript.id = 'job-structured-data';
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
    const title = job.job_titles?.[0] || 'Job Opportunity';
    const description = job.description || 'Explore this job opportunity on ICPJobs';
    
    // Generate thumbnail if not provided
    const thumbnailUrl = customThumbnail || await this.generateThumbnail(
      title,
      description,
      job.skills,
      user?.photo
    );

    // Update meta tags
    this.updateMetaTags({
      'og:title': title,
      'og:description': description,
      'og:image': thumbnailUrl,
      'og:url': window.location.href,
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': thumbnailUrl,
      'description': description,
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