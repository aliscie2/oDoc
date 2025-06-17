import { 
    Work,
    Business,

    SmartToy,

    Analytics,
    PersonAdd,
    Description,
    AttachMoney,
    Search,
    Handshake,
    ThumbDown,
    ThumbUp,
    Close,
    CheckCircle,
    TrendingDown,
    TrendingUp,
    LockOpen,
    AccountBalance,
    SwapHoriz,
    Refresh,
    Group,
    Assignment,
    Payment,
    Lock, Security, Architecture, VerifiedUser, GppGood, Shield, MonitorHeart, Psychology, Speed, Stars, AccessTime, Gavel, Code, AccountTree, 
    Public,
    Hub} from '@mui/icons-material';


import snsimage from '@/assets/infograph/SNS.png';
import analyticsImage from '@/assets/infograph/analytics.png';
import autoReleaseImage from '@/assets/infograph/autoRlease.png';
import jobMatcherImage from '@/assets/infograph/jobMatcher.png';
import karmaImage from '@/assets/infograph/karma.png';
import identityImage from '@/assets/infograph/identityVerfication.png';

interface Tutorial {
    title: string;
    videoUrl: string;
    description: string;
    checkCondition?: (state: any) => boolean;
    startTime?: number;
  }
  

  
  
export const securityFeatures = [
    { icon: <Security />, title: 'Tamper-proof Records', description: 'Immutable blockchain records maintain audit integrity' },
    { icon: <Architecture />, title: 'Decentralized Architecture', description: 'Distributed network eliminates single points of failure' },
    { icon: <VerifiedUser />, title: 'Verified Access', description: 'Biometric authentication and digital identity verification' },
    { icon: <GppGood />, title: 'Fraud Prevention', description: 'Smart contracts with cryptographic transaction validation' },
    { icon: <Shield />, title: 'Secure Comms', description: 'End-to-end encrypted messaging protocols' },
    { icon: <MonitorHeart />, title: 'Real-time Monitoring', description: 'AI-powered anomaly detection system' },
  ];

  export const jobMatcherFeatures = [
    {
      icon: <Psychology color="primary" />,
      title: "AI Learning",
      description: "Learns your preferences and career goals"
    },
    {
      icon: <Speed color="primary" />,
      title: "Instant Alerts",
      description: "Get notified the moment perfect matches appear"
    },
    {
      icon: <Stars color="primary" />,
      title: "Quality Matches",
      description: "Only relevant, high-quality opportunities"
    }
  ];

  export const tutorials: Tutorial[] = [
    {
      title: "What is odoc?",
      videoUrl: "https://www.youtube.com/embed/3UYPuOPWa9A",
      description:
        "Contracting and project management, Open Source Blockchain Platform Automates Your freelance workflow",
      checkCondition: (state: any) => {
        const { wallet } = state.filesState;
        return wallet?.exchanges?.length > 0;
      },
      startTime: 15,
    },
    {
      title: "Why odoc?",
      videoUrl: "https://www.youtube.com/embed/Sf1YE-2rYvo",
      description:
        "Unlock the Power of Freedom: Save Time, Resources, and Gain Control with Odoc",
      checkCondition: (state: any) => {
        const { wallet } = state.filesState;
        return wallet?.exchanges?.length > 0;
      },
    },
    {
      title: "Internet identity",
      videoUrl: "https://www.youtube.com/embed/Lg-0q5oEenk",
      description: "A guide to using Internet Identity for authentication",
      checkCondition: (state: any) => {
        const { isLoggedIn } = state.uiState;
        return isLoggedIn;
      },
    },
    {
      title: "Make friends",
      videoUrl: "https://www.youtube.com/embed/f0RVw6RJxos",
      description: "Social networking guide for Odoc",
      checkCondition: (state: any) => {
        const { isLoggedIn } = state.uiState;
        const { profile, all_friends } = state.filesState;
        return (
          isLoggedIn &&
          profile?.id &&
          all_friends.filter((f: any) => f.id !== profile?.id).length > 0
        );
      },
    },
    {
      title: "Make payments",
      videoUrl: "https://www.youtube.com/embed/XnOF1i1Een8",
      description: "Step-by-step guide for ODOC payments and documents",
      checkCondition: (state: any) => {
        const { wallet } = state.filesState;
        return wallet?.exchanges?.length > 0;
      },
    },
    {
      title: "How trust and tokens work",
      videoUrl: "https://www.youtube.com/embed/aKCaXRvxYWo",
      description:
        "Revolutionizes trust in transactions using sender tokens, receiver tokens, and social tokens. Learn how these tokens create accountability, reward reliability, and foster community-driven fairness",
      checkCondition: (state: any) => {
        const { wallet } = state.filesState;
        return wallet?.exchanges?.length > 0;
      },
    },
  ];



interface BenefitData {
    id: string;
    title: string;
    description: string;
    expandedContent: string;
    icon: React.ReactNode;
    priority: {
      developer: number;
      business: number;
      general: number;
    };
    color: string;
    stats?: string;
  }

  
  export const benefitsData: BenefitData[] = [
    {
      id: 'save-time',
      title: 'Save Time & Money',
      description: 'Replace 3+ apps with one.\nNo more PayPal, Upwork, Jira — ODoc handles it all.',
      expandedContent: 'Cut operational costs by 60% and reduce tool switching by 80%. Single subscription replaces multiple SaaS tools, streamlining your entire workflow and boosting productivity.',
      icon: <AccessTime />,
      priority: { developer: 3, business: 1, general: 2 },
      color: '#4CAF50',
      stats: '60% cost reduction'
    },
    {
      id: 'blockchain',
      title: 'Built on Blockchain',
      description: 'Privacy that doesn\'t change overnight.\nTransparent, secure, and censorship-resistant.',
      expandedContent: 'Immutable smart contracts ensure your agreements can\'t be altered. Full transparency with on-chain verification and decentralized architecture for ultimate security.',
      icon: <Security />,
      priority: { developer: 1, business: 4, general: 3 },
      color: '#2196F3',
      stats: '256-bit encryption'
    },
    {
      id: 'control',
      title: 'You\'re in Control',
      description: 'Vote on features and updates.\nNo more forced changes — you decide.',
      expandedContent: 'DAO governance model means community decides platform direction. Your voice matters in every update and feature decision through democratic voting.',
      icon: <Gavel />,
      priority: { developer: 2, business: 5, general: 4 },
      color: '#FF9800',
      stats: '10K+ active voters'
    },
    {
      id: 'ai-assistant',
      title: 'Smart AI Assistant',
      description: 'Get instant insights.\nLet AI analyze data and guide your decisions.',
      expandedContent: 'ML-powered analytics provide actionable insights. Predictive models help optimize your workflow efficiency and decision-making process with real-time guidance.',
      icon: <Psychology />,
      priority: { developer: 4, business: 2, general: 1 },
      color: '#9C27B0',
      stats: '95% accuracy rate'
    },
    {
      id: 'open-source',
      title: 'Open Source',
      description: 'See the code. Trust the platform.\nYou know exactly where your data goes.',
      expandedContent: 'Full code transparency on GitHub. Community-driven development with regular security audits and open contribution model for maximum trust.',
      icon: <Code />,
      priority: { developer: 1, business: 6, general: 5 },
      color: '#607D8B',
      stats: '50K+ GitHub stars'
    },
    {
      id: 'workflow',
      title: 'All-in-One Workflow',
      description: 'Payments, hiring, tasks, and contracts — unified.\nNo switching. Everything in one place.',
      expandedContent: 'Seamless integration across all business functions. Single dashboard for complete project lifecycle management and team coordination without context switching.',
      icon: <AccountTree />,
      priority: { developer: 5, business: 3, general: 2 },
      color: '#E91E63',
      stats: '5 tools in 1'
    }
  ];
  
  // Karama Should be in one compnent 

  export const badBehaviors = [
    { icon: <Refresh fontSize="small" />, text: 'Repeated cancellations' },
    { icon: <Gavel fontSize="small" />, text: 'Excessive disputes' },
    { icon: <Close fontSize="small" />, text: 'Breaking contract terms' }
  ];

  export const goodBehaviors = [
    { icon: <Payment fontSize="small" />, text: 'Releasing payments' },
    { icon: <Assignment fontSize="small" />, text: 'Creating contracts' },
    { icon: <Group fontSize="small" />, text: 'Interacting with many users' },
    { icon: <TrendingUp fontSize="small" />, text: 'High transaction volume' }
  ];

  export const punishments = [
    { icon: <TrendingDown fontSize="small" />, text: 'Trust score drops' },
    { icon: <AccountBalance fontSize="small" />, text: 'Funds staked' },
    { icon: <Lock fontSize="small" />, text: 'Transaction cap' }
  ];

  export const rewards = [
    { icon: <TrendingUp fontSize="small" />, text: 'Higher trust score' },
    { icon: <LockOpen fontSize="small" />, text: 'Transaction freedom' },
    { icon: <SwapHoriz fontSize="small" />, text: 'Refund old escrow' }
  ];
// how to get started for both 

export interface StepData {
    label: string;
    description: string;
    icon: React.ReactElement;
  }
  

  export const freelancerSteps: StepData[] = [
    {
      label: 'Sign Up',
      description: 'Create your account and get verified',
      icon: <PersonAdd />,
    },
    {
      label: 'Upload CV',
      description: 'Show your CV to our AI Job matcher to find perfect jobs',
      icon: <Description />,
    },
    {
      label: 'Create Contract',
      description: 'Generate new document and contract for your project',
      icon: <Handshake />,
    },
  ];

  export const businessSteps: StepData[] = [
    {
      label: 'Sign Up',
      description: 'Create your business account',
      icon: <PersonAdd />,
    },
    {
      label: 'Make Deposit',
      description: 'Secure your funds in blockchain escrow',
      icon: <AttachMoney />,
    },
    {
      label: 'AI Matching',
      description: 'Tell our AI your requirements to find top freelancers',
      icon: <Search />,
    },
    {
      label: 'Create Contract',
      description: 'Finalize contract with your chosen freelancer',
      icon: <Handshake />,
    },
  ];


  //Intro
  export const introFeatures = [
    {
      icon: <Speed sx={{ color: '#3b82f6', fontSize: 32 }} />,
      title: "Save Time",
      description: "Streamline contracts, tasks, and payments in one platform"
    },
    {
      icon: <AccountBalance sx={{ color: '#10b981', fontSize: 32 }} />,
      title: "No Middlemen", 
      description: "Direct crypto payments, zero commissions"
    },
    {
      icon: <Security sx={{ color: '#8b5cf6', fontSize: 32 }} />,
      title: "Blockchain Security",
      description: "Enterprise-level protection with encryption"
    }
  ];

  export const trustIndicators = [
    {
      icon: <TrendingUp sx={{ fontSize: 18 }} />,
      label: "Crypto-Native",
      color: "rgba(16, 185, 129, 0.1)"
    },
    {
      icon: <Code sx={{ fontSize: 18 }} />,
      label: "Open Source",
      color: "rgba(59, 130, 246, 0.1)",
      link: "https://github.com/aliscie2/oDoc"
    },
    {
      icon: <Hub sx={{ fontSize: 18 }} />,
      label: "Decentralized",
      color: "rgba(147, 51, 234, 0.1)"
    },
    {
      icon: <Public sx={{ fontSize: 18 }} />,
      label: "Global",
      color: "rgba(239, 68, 68, 0.1)"
    }
  ];

  // odoc strecutre  



  export const odocStrecutre: Element[] = [
    {
      id: 1,
      title: "AI Job Matcher",
      description: "Match-based system finds opportunities instantly, or get alerted later.",
      icon: <img src={jobMatcherImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))' }} />,
      angle: 228,
      color: "from-blue-500 to-cyan-400",
      glowColor: "rgba(0, 212, 255, 0.8)"
    },
    {
      id: 2,
      title: "AI Auto-Release",
      description: "Conditions met? Payment flows automatically",
      icon: <img src={autoReleaseImage} width="60px" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 149, 0, 0.8))' }} />,
      angle: 40.5,
      color: "from-yellow-500 to-orange-400",
      glowColor: "rgba(255, 149, 0, 0.8)"
    },
    {
      id: 3,
      title: "AI Analytics",
      description: "Data-driven suggestions for team and tasks",
      icon: <img src={analyticsImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))' }} />,
      angle: 143,
      color: "from-green-500 to-emerald-400",
      glowColor: "rgba(0, 255, 136, 0.8)"
    },
    {
      id: 4,
      title: "Trust/Karma Score",
      description: "Transparent behavior builds or breaks your score",
      icon: <img src={karmaImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(184, 76, 255, 0.8))' }} />,
      angle: 312,
      color: "from-purple-500 to-violet-400",
      glowColor: "rgba(184, 76, 255, 0.8)"
    },
    {
      id: 5,
      title: "SNS DAO",
      description: "Decentralized governance layer for collaboration",
      icon: <img src={snsimage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 76, 139, 0.8))' }} />,
      angle: 0,
      color: "from-pink-500 to-rose-400",
      glowColor: "rgba(255, 76, 139, 0.8)"
    },
    {
      id: 6,
      title: "Origyn Identity Verification",
      description: "Authenticate users using on-chain identity tech",
      icon: <img src={identityImage} width="50px" style={{ filter: 'drop-shadow(0 0 8px rgba(76, 154, 255, 0.8))' }} />,
      angle: 180,
      color: "from-indigo-500 to-blue-400",
      glowColor: "rgba(76, 154, 255, 0.8)"
    }
  ];