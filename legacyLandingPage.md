# Legacy Landing Page Components

This document archives the content from the legacy landing page components that were removed from the codebase.

## Files Archived

- `src/frontend/pages/LandingPage/aboutUs.tsx`
- `src/frontend/pages/LandingPage/landingPageData.tsx`

---

## aboutUs.tsx

### Component Overview

Main landing page component with hero section, feature sections, karma system, and platform progress.

### Key Features

#### Hero Section with Real-time Stats

- Displays live platform statistics:
  - Total Users
  - Active Users
  - Total Value (deposits)
  - Jobs Posted
  - Talents
- Animated counter effects
- Integration with backend SNS status and ckUSDC balance
- Responsive design for mobile and desktop

#### Feature Sections

1. **AI Job Matching System**

   - Smart Email Alerts
   - Auto Cover Letters
   - Spam Protection
   - Image: `/jobs.png`

2. **Crypto Agreement Platform**

   - Smart Escrow
   - Quick Promises
   - Instant Release
   - Reputation Karma
   - Image: `/agreement.png`

3. **Automated Tasks Manager**

   - No Payment Platform Needed
   - No Contract Platform Needed
   - No Task Manager Needed
   - No Documents Platform Needed
   - Single Unified Platform
   - Image: `/all-in-on.png`

4. **Smart Calendar Integration**

   - Google Calendar Sync
   - Multiple Calendar Support
   - Two-Way Synchronization
   - Contact Management
   - Natural Language Booking
   - Image: `/calendar.png`

5. **Team Spaces with AI**

   - AI Conversation Tracking
   - Smart Topic Management
   - Integrated Task Tracking
   - GitHub Integration
   - Code-Chat Linking
   - Image: `/teamspaces.png`

6. **Advanced Cyber Security**
   - Decentralized Architecture
   - Tamper-Proof Records
   - Fraud Prevention System
   - Democratic Governance
   - Uses RunawayJellyfish component with SECRUTYSVG

#### Karma System

Two types of behavior tracking:

**Bad Behavior:**

- Repeated cancellations
- Excessive disputes
- Breaking contract terms
- **Punishments:** Trust score drops, Funds locked, Transaction cap

**Good Behavior:**

- Releasing payments
- Creating contracts
- Interacting with many users
- High transaction volume
- **Rewards:** Higher trust score, Transaction freedom, Refund old escrow

#### AI Analytics Section

- Decentralized AI Monitoring
- Action Suggestions
- Smart Suggestions
- Status: "Not Available Yet"

### Component Structure

```typescript
- HeroSection: Main hero with stats and CTA
- FeatureSection: Reusable feature display component
- OdocLandingPage: Main export component
```

### Dependencies

- Material-UI components
- React Helmet for SEO
- Custom components:
  - OdocStrecture
  - MobileTutrials
  - DeskTopTutorials
  - PlatformProgress
  - PageFooter
  - RunawayJellyfish
  - LOGOSVG, SECRUTYSVG
  - LoginButton

### Images Used

- `/jobs.png`
- `/agreement.png`
- `/all-in-on.png`
- `/calendar.png`
- `/teamspaces.png`
- `/small_logo.png` (favicon)

---

## landingPageData.tsx

### Tutorial Data

Array of tutorial objects with video URLs and descriptions:

1. **What is odoc?**

   - URL: `https://www.youtube.com/embed/3UYPuOPWa9A`
   - Description: "Contracting and project management, Open Source Blockchain Platform Automates Your freelance workflow"
   - Start time: 15 seconds

2. **Why odoc?**

   - URL: `https://www.youtube.com/embed/Sf1YE-2rYvo`
   - Description: "Unlock the Power of Freedom: Save Time, Resources, and Gain Control with Odoc"

3. **Internet identity**

   - URL: `https://www.youtube.com/embed/Lg-0q5oEenk`
   - Description: "A guide to using Internet Identity for authentication"

4. **Make friends**

   - URL: `https://www.youtube.com/embed/f0RVw6RJxos`
   - Description: "Social networking guide for Odoc"

5. **Make payments**

   - URL: `https://www.youtube.com/embed/XnOF1i1Een8`
   - Description: "Step-by-step guide for ODOC payments and documents"

6. **How trust and tokens work**
   - URL: `https://www.youtube.com/embed/aKCaXRvxYWo`
   - Description: "Revolutionizes trust in transactions using sender tokens, receiver tokens, and social tokens. Learn how these tokens create accountability, reward reliability, and foster community-driven fairness"

### ODoc Structure Elements

Array of 6 feature elements with SVG icons and positioning:

1. **AI Job Matcher** (angle: 228°)

   - Color: blue-500 to cyan-400
   - Glow: rgba(0, 212, 255, 0.8)
   - Description: "Match-based system finds opportunities instantly, or get alerted later."

2. **AI Auto-Release** (angle: 40.5°)

   - Color: yellow-500 to orange-400
   - Glow: rgba(255, 149, 0, 0.8)
   - Description: "Conditions met? Payment flows automatically"

3. **AI Analytics** (angle: 137°)

   - Color: green-500 to emerald-400
   - Glow: rgba(0, 255, 136, 0.8)
   - Description: "Data-driven suggestions for team and tasks"

4. **Karma Score** (angle: 312°)

   - Color: purple-500 to violet-400
   - Glow: rgba(184, 76, 255, 0.8)
   - Description: "Transparent behavior builds or breaks your score"

5. **SNS DAO** (angle: 0°)

   - Color: pink-500 to rose-400
   - Glow: rgba(255, 76, 139, 0.8)
   - Description: "Decentralized governance layer for collaboration"

6. **Origyn Identity Verification** (angle: 180°)
   - Color: indigo-500 to blue-400
   - Glow: rgba(76, 154, 255, 0.8)
   - Description: "Authenticate users using on-chain identity tech"

### Data Structure

```typescript
interface Tutorial {
  title: string;
  videoUrl: string;
  description: string;
  checkCondition?: (state: any) => boolean;
  startTime?: number;
}

interface Element {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element; // SVG component
  angle: number;
  color: string;
  glowColor: string;
}
```

---

---

## ServiceOverview.tsx (Three Powerful Services Section)

### Component Overview

Modern landing page section showcasing three core services with interactive cards and call-to-action buttons.

### Three Services

1. **AI Job Match**

   - Icon: `/job.png`
   - Description: "AI-powered matching connects you with opportunities that perfectly align with your skills"
   - Color: #06B6D4 (cyan)
   - User Type: `aimatch`

2. **Smart Calendar**

   - Icon: `/calendar.png`
   - Description: "Smart scheduling system coordinates interviews and meetings at optimal times"
   - Color: #3A8DFF (blue)
   - User Type: `calendar`

3. **Crypto Agreements**
   - Icon: `/contract.png`
   - Description: "Secure platform handles projects, teams, tasks, payments, and contract management"
   - Color: #38BDF8 (light blue)
   - User Type: `contracts`

### Features

#### Interactive Service Cards

- **Dimensions**: 280px width × 380px height
- **Layout**: Horizontal flex layout with arrow indicators between cards
- **Animations**:
  - Fade-in and scale-up on scroll (Framer Motion)
  - Staggered delays (0.2s per card)
  - Hover effect: translateY(-4px) with enhanced shadow
- **Styling**:
  - Rounded corners (borderRadius: 3)
  - Theme-aware shadows and borders
  - Dark mode: Enhanced shadows with border glow
  - Light mode: Subtle shadows

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

#### Arrow Indicators

- **Icon**: ArrowForward (Material-UI)
- **Size**: 40px
- **Color**: primary.main
- **Animation**: Fade-in with horizontal slide
- **Responsive**: Hidden on mobile (xs), visible on desktop (md+)

### Section Header

- **Title**: "Three Powerful Services"
- **Subtitle**: "Everything you need to find, schedule, and secure work"
- **Styling**: Centered, bold title with subtle subtitle

### Layout & Responsiveness

- **Container**: maxWidth="lg"
- **Scroll Snap**: Aligned to start for smooth scrolling
- **Flex Wrap**: Cards wrap on smaller screens
- **Gap**: 2 units between cards and arrows

### Dependencies

- Material-UI components (Box, Container, Typography, Paper)
- Material-UI icons (ArrowForward)
- Framer Motion for animations
- LoginButton component with userType routing

### Theme Integration

- Supports dark/light mode via useTheme hook
- Dynamic shadows, borders, and filters based on theme
- Icon filters: brightness adjustment in dark mode

---

## Removal Date

Archived on: October 21, 2025

## Reason for Removal

Legacy landing page components replaced with new implementation.

---

## platformProgress.tsx

### Component Overview

Displays the platform's development progress, showing completed features and upcoming features.

### Component Structure

- Uses Material-UI components (Container, Box, Typography)
- Imports roadMap data from odocRoadMap.tsx
- Displays two sections:
  1. **Completed Features** - with CheckCircle icon (blue)
  2. **Coming Soon** - with Schedule icon (gray)

### Styling

- Max width: 800px centered
- Padding: 8 units vertical
- Icons with 2 units margin-right
- Text indentation: 6 units for descriptions

### Dependencies

- Material-UI icons: CheckCircle, Schedule
- Data source: roadMap from odocRoadMap.tsx

---

## odocRoadMap.tsx

### Roadmap Data Structure

Array of feature objects with completion status, title, and description.

### Completed Features (is_done: true)

1. **AI job matcher**

   - "Talk to AI to find jobs/talents, it will alert you by email."

2. **AI sceduler/calenar** [sic]

   - "Tell your calendar about your requrent avaiablitiy like `I am aviable every day from 9 AM to 6 PM`"

3. **Programmable Payments**

   - "Custom smart contracts with time-based execution and conditional payment formulas"

4. **ckUSDC Integration**

   - "Complete ckUSDC wallet functionality for deposits, payments, and withdrawals"

5. **Enhanced Communication**

   - "Real-time notifications, rich text editing, and organized workspace management"

6. **Group Collaboration**
   - "Structured group chats with admin channels and workspace categorization"

### Upcoming Features (is_done: false)

1. **Smart Revenue Sharing**

   - "Automated payment distribution with immutable approved contracts and change management system"

2. **Advanced File Sharing**

   - "Secure file uploads with shareable short links for cross-platform compatibility"

3. **Real-time Collaboration**

   - "Live document editing with instant updates for all participants"

4. **Multi-Currency Support**

   - "Integration of USDC, USDT, and ICP wallets with external transfer capabilities"

5. **Advanced Permissions**

   - "Group-based access control for documents and data with customizable roles"

6. **Data Visualization**

   - "Customizable views including charts, calendars, and timelines with CSS editor"

7. **External Integration**

   - "google calendar and Notion synchronization for seamless data transfer and updates"

8. **Identity & Trust**

   - "Multi-factor verification combining KYC, biometrics, and community-based trust scoring"

9. **Developer Ecosystem**

   - "JavaScript plugin system for custom components, formulas, and visualizations"

10. **SNS decentralization**

    - "On platform will be controlled by SNS using voting to decide which updates to accept or reject."

11. **AI assessment**
    - "Automatically track tasks and overdo. An Automatically recognize new events from chats to schedule them on your calendar and sync it with google calendar."

### Data Structure

```typescript
interface RoadMapItem {
  is_done: boolean;
  title: string;
  content: string;
}
```

### Export

```typescript
export { roadMap };
```

---

## oDocStrecture.tsx

### Component Overview

Interactive visualization component showing the oDoc platform structure with animated connections between features.

### Key Features

- **Central Logo**: Animated oDoc logo with jellyfish animation
- **6 Feature Nodes**: Positioned in a circular layout around the center
- **Energy Pipes**: Animated energy flow connections for features 1-4
- **WiFi Connections**: Animated WiFi-style connections for features 5-6 (SNS DAO and Origyn Identity)
- **Interactive Cards**: Hover to expand cards with full descriptions
- **Responsive Design**: Adapts radius based on screen size (250px mobile, 300px desktop)

### Feature Nodes

Uses data from `odocStrecutre` array in landingPageData.tsx:

1. AI Job Matcher (angle: 228°)
2. AI Auto-Release (angle: 40.5°)
3. AI Analytics (angle: 137°)
4. Karma Score (angle: 312°)
5. SNS DAO (angle: 0°) - WiFi connection
6. Origyn Identity Verification (angle: 180°) - WiFi connection

### Visual Effects

- **Energy Flow Animation**: Gradient animation flowing through pipes
- **WiFi Pulse Animation**: Expanding circular waves for wireless connections
- **Shimmer Effect**: Subtle shimmer across cards
- **Glow Effects**: Color-coded glow based on feature type
- **Hover Expansion**: Cards expand from 80px circles to 280px detailed cards
- **Core Glow**: Central logo pulses with alternating blue/red glow

### Styling

- Dark/Light mode support via Redux state
- Glassmorphism effects (backdrop-filter blur)
- Smooth cubic-bezier transitions
- Radial gradient backgrounds
- Drop shadows and box shadows

### Animations

```css
@keyframes shineGlow - Logo glow alternating colors
@keyframes energyFlow - Energy pipe flow animation
@keyframes wifiPulse - WiFi connection pulse
@keyframes shimmer - Card shimmer effect;
```

### Dependencies

- React, useState
- Redux (useSelector)
- RunawayJellyfish component
- LOGOSVG component
- landingPageData (odocStrecutre array)

---

## promiseTutorial.tsx

### Component Overview

Progressive tutorial demonstrating the crypto agreement creation process with automated step-by-step animation.

### Tutorial Steps

1. **Create Agreement** - Initial state
2. **Select Receiver** - Choose from dummy receivers
3. **Set Amount** - Type $500
4. **Choose Status** - Select "Escrow" status
5. **Add Conditions** - Add 2 condition templates
6. **Agreement Secured** - Success overlay

### Features

#### Animated Typing Effect

- Types text character by character
- Configurable speed (default 100ms)
- Used for amount and condition fields

#### Dummy Data

**Receivers:**

- Carol Davis (Unsplash avatar)
- David Wilson (Unsplash avatar)
- Emma Brown (Unsplash avatar)

**Status Options:**

- 🤝 Promise
- 🔒 Escrow
- ✅ Released

**Condition Templates:**

1. Delivery_Date: "Product must be delivered by March 15th, 2024"
2. Quality_Standards: "Product must meet all agreed specifications and quality standards"

#### Visual Elements

- Progress stepper with 6 steps
- Animated dropdowns for selection
- Real-time typing indicators
- Success overlay with handshake icon
- Pulsing animations on active elements
- Fade-in-up animations for new items

#### State Management

```typescript
promiseData: {
  amount: string
  receiver: { name: string, avatar: string }
  status: string
  conditions: Array<{ id: string, field: string, value: string }>
}
```

### Animations

- **pulse**: Scale animation for active elements
- **fadeInUp**: Entrance animation for new elements
- Automatic progression through steps with delays
- Loops back to start after completion

### Styling

- Material-UI components
- Glassmorphism card design
- Color-coded status indicators
- Responsive layout
- Drop shadows and elevation effects

---

## socialButton.tsx

### Component Overview

Footer component with social media links and contact information.

### Social Links

1. **GitHub**: https://github.com/aliscie2/oDoc

   - Color: #24292e (dark) / #1f2328 (light)

2. **X (Twitter)**: https://x.com/odoc_ic

   - Color: #000000

3. **YouTube**: https://www.youtube.com/@odocic

   - Color: #FF0000 (dark) / #dc2626 (light)

4. **Instagram**: https://www.instagram.com/odoc_ic

   - Color: #E4405F (dark) / #db2777 (light)

5. **Discord**: https://discord.gg/uxMJHBk8
   - Color: #5865F2 (dark) / #4f46e5 (light)

### Features

- **Custom SVG Icons**: XIcon and DiscordIcon components
- **Hover Effects**: Scale up (1.1x) with rotation (12deg)
- **Dark/Light Mode**: Theme-aware colors via Redux
- **Contact Link**: Opens Twitter in new tab
- **Responsive Layout**: Flexbox with wrapping

### Layout Sections

1. **Brand/Logo**: oDoc title with tagline
2. **Social Links**: Icon buttons in a row
3. **Contact Section**: "Contact us on Twitter" link
4. **Divider**: Horizontal line
5. **Copyright**: Current year with "All rights reserved"

### Styling

- Background: #1a1a1a (dark) / #f8f9fa (light)
- Border top: 1px solid
- Padding: 6 units vertical
- Icon buttons: 48x48px circles
- Smooth transitions (0.3s ease-in-out)
- Box shadows on hover

### Dependencies

- Material-UI components (IconButton, SvgIcon, Typography, Box, Container, Divider)
- Material-UI icons (YouTube, Instagram, GitHub)
- Redux (useSelector for theme state)

### TypeScript Issues (noted in diagnostics)

- Missing type annotations for props parameters
- Unused React import
- Unknown state type in Redux selector
