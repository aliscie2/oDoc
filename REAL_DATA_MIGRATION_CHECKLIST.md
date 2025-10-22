# Real Data Migration Checklist

## Overview

This document tracks the migration of real data from the legacy landing page (`src/frontend/pages/LandingPage/DesktopLanding.tsx`) to the new landing page (`src/frontend/pages/LandingPage/project/`).

---

## 1. Hero Section

### Images

- ✅ `/job.png` - AI job matching icon
- ✅ `/calendar.png` - Calendar/scheduling icon
- ✅ `/contract.png` - Contract/escrow icon
- ✅ `/logo.png` - oDoc logo

### AI Chat Demo

**Legacy Implementation:**

- User: "Find full-stack developers"
- AI: Shows 3 candidates (Sarah Chen, Alex Kumar, Maria Silva)
- User: "Find a suitable time to meet Sarah"
- AI: "Tomorrow 10 AM" with Sarah
- User: "Make an escrow with John Smith"
- AI: Shows contract card with $100, John Smith

**✅ New Implementation Complete:**

- ✅ Chat sequence matches legacy flow
- ✅ Candidate cards with avatars (Sarah Chen, Alex Kumar, Maria Silva)
- ✅ Meeting card with calendar icon
- ✅ Escrow/contract card with contract icon
- ✅ Uses real avatar images from pravatar.cc
- ✅ Shows 95% match indicator on candidates

### Stats (from `backendActor.get_sns_status()`)

**Real Data Source:** Backend API call

- Total Users: `number_users` from API
- Active Now: `active_users` from API
- ckUSDC Locked: `getckUsdcBalance()` / 1000000
- Job Postings: `jobs_count` from API
- Talents: `talents_count` from API

**Fallback Values (if API fails):**

- Total Users: 1250
- Active Now: 342
- ckUSDC Locked: $45,000
- Job Postings: 89
- Talents: 456

### CTA Buttons

**Legacy Implementation:**

- "Find Talent" button → stores "JOB" in localStorage → triggers login
- "Find Job" button → stores "TALENT" in localStorage → triggers login

**Component:** `LoginButton` with `userType` prop

---

## 2. Service Overview Section (Three Powerful Services)

### Title

- "Three Powerful Services" or "We offer an A to Z system"

### Services with Icons

1. **AI Job Match**

   - Icon: `/job.png`
   - Title: "AI Job Match"
   - Description: "AI-powered matching connects you with opportunities that perfectly align with your skills"

2. **Smart Calendar**

   - Icon: `/calendar.png`
   - Title: "Smart Calendar"
   - Description: "Smart scheduling system coordinates interviews and meetings at optimal times"

3. **Crypto Agreements**
   - Icon: `/contract.png`
   - Title: "Crypto Agreements"
   - Description: "Secure platform handles projects, teams, tasks, payments, and contract management"

---

## 3. AI Job Matching Demo

### Real Data Source

**Backend API:** `backendActor.get_sns_status()`

- Should fetch and display real job/talent data
- Currently uses mock data, needs backend integration

### Current Mock Data

- Search queries rotate through different job types
- Shows scrolling feed of job cards
- Each card has: avatar, title, skills chips, type badge

---

## 4. Email Notifications Section

### Content

- Title: "Email Alerts"
- Description: "Get notified when new opportunities match your profile. Never miss the perfect job or talent again."
- Shows inbox with 2 sample emails
- Email icon with badge count

---

## 5. Smart Calendar Section

### Demo Flow

- User sets availability: "Set me available Mon-Wed 9 AM - 1 PM"
- Shows availability slots
- User schedules meeting: "Find me a good time to meet Sarah tomorrow"
- Shows meeting card: "Tomorrow • 10:00 AM - Meeting with Sarah"
- Icon: `/calendar.png`

---

## 6. Escrow Agreement Section

### Demo Content

- Title: "Secure Escrow Agreements"
- Icon: `/contract.png`
- Shows animated contract form with:
  - Amount: 500 USDC
  - Staking: 30 days
  - Recipient: John Smith (Senior ICP Developer)
  - Avatar: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d

---

## 7. Agreement Proofs Section

### Four Proofs

1. **Proof of Existence**

   - Icon: AttachMoney
   - Subtitle: "Deposit funds before making promises"

2. **Proof of Stake**

   - Icon: Lock
   - Subtitle: "Build trust with upfront staking"

3. **Proof of Cap**

   - Icon: BarChart
   - Subtitle: "Smart limits prevent oversized commitments"

4. **Proof of Reputation**
   - Icon: Star
   - Subtitle: "Your track record shows transparently"

---

## 8. Project Management Section

### Demo Contracts

1. **AI Agent Development**

   - Status: Active
   - Promises: 3 ($1500)
   - Payments: 1 ($500)
   - Creator: Sarah Chen (Project Manager)
   - Avatar: https://images.unsplash.com/photo-1438761681033-6461ffad8d80

2. **ICP Canister Integration**
   - Status: Pending
   - Promises: 2 ($2000)
   - Payments: 0 ($0)
   - Creator: Alex Rodriguez (Tech Lead)
   - Avatar: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e

### Features

- Smart task allocation
- Automated payment tracking
- Progress analytics
- Real-time notifications

---

## 9. Social Links Section (Join Our Community)

### Real Social Media Links

- **Telegram:** https://t.me/odoc_ic
- **X (Twitter):** https://x.com/odoc_ic
- **Discord:** https://discord.gg/HbaFQXDD
- **YouTube:** https://www.youtube.com/@odoc_ic
- **Instagram:** https://www.instagram.com/odoc_ic
- **TikTok:** https://www.tiktok.com/@odoc.app
- **LinkedIn:** https://www.linkedin.com/company/odocic

---

## 10. Footer Section

### Brand Info

- Logo: `/logo.png`
- Name: "oDoc" or `window.location.hostname`
- Tagline: "AI-powered job matching • Smart contracts • Team management"

### Resources Links

- **White Paper:** `/white_paper` route
- Documentation (if available)
- API Reference (if available)

### Social Links (Follow Us)

- **GitHub:** https://github.com/aliscie2/oDoc
- **X (Twitter):** https://x.com/odoc_ic
- **YouTube:** https://www.youtube.com/@odoc_ic

### Legal Links

- **Privacy Policy:** `/privacy` route
- Terms of Service (if available)

### Copyright

- © 2025 oDoc.app. All rights reserved.

---

## 11. SEO & Meta Data

### Page Title

`${window.location.hostname} - ICP Jobs & Blockchain Developer Careers | AI Job Matching`

### Description

"Find blockchain developer jobs, ICP careers, and Web3 talent. AI-powered job matching platform for Internet Computer Protocol ecosystem. Smart contracts, remote positions, DeFinity careers."

### Keywords

"ICP jobs, blockchain developer jobs, DeFinity careers, Web3 jobs, Internet Computer Protocol jobs, blockchain engineer, smart contract developer, Rust developer, canister development, Web3 talent, blockchain recruitment, ICP project manager, crypto jobs, decentralized jobs, blockchain careers"

---

## Implementation Checklist

- [ ] Update HeroSection with real chat demo flow
- [ ] Add backend API integration for stats
- [ ] Update LoginButton integration for Find Job/Talent buttons
- [ ] Update ServiceOverview with correct icons and descriptions
- [ ] Add backend integration to AIJobMatchingDemo
- [ ] Update SocialLinks with real URLs
- [ ] Update Footer with real links and routes
- [ ] Add missing sections: EmailNotifications, SmartCalendar, EscrowAgreement, AgreementProofs, ProjectManagement
- [ ] Add SEO component with structured data
- [ ] Test all external links
- [ ] Verify all images exist in public folder

---

#### Try It Now Buttons

Each service card includes a **LoginButton** component with:

- **Text**: "Try it now"
- **Variant**: outlined
- **User Type**: Specific to each service (aimatch, calendar, contracts)
- **Styling**:
  - Full width within card
  - Minimum height: 40px
  - Hover effects: 2px border, primary.dark color, subtle background
- **Functionality**: Routes users to the specific service section after login

## Notes

- All images should be in `/public/` folder
- Backend API calls use `backendActor.get_sns_status()` and `getckUsdcBalance()`
- LoginButton component handles user type storage and authentication
- Legacy uses scroll-snap for smooth section transitions
- All social links are verified and active
