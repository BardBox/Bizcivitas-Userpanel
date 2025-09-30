export interface MemberProfile {
  id: string;
  name: string;
  title: string;
  membershipType: 'Core Member' | 'Premium Member' | 'Basic Member';
  avatar: string;
  business: {
    name: string;
    logo: string;
    description: string;
  };
  contact: {
    location: string;
    personal: string;
    professional: string;
    email: string;
    website: string;
  };
  sections: {
    myBusiness: string;
    myInterest: string;
    mySkills: string;
    myAsk: string;
    myGives: string;
    eventsAttending: string[];
  };
  socialLinks: {
    phone?: string;
    email?: string;
    linkedin?: string;
    website?: string;
  };
  isConnected: boolean;
}

export const memberProfilesData: MemberProfile[] = [
  {
    id: 'jaimi-panchal',
    name: 'Jaimi Panchal',
    title: 'Business Development Manager',
    membershipType: 'Core Member',
    avatar: '/dashboard/avatars/jaimi.jpg',
    business: {
      name: 'Business Name',
      logo: '/dashboard/business-logos/business.png',
      description: 'Voluptiat ipsum dictum veritius purus mauris risus. Sagittis sagittis varius sit tincidunt. Augue adipiscing quis interdum id risus non ultriices dignissim ornet. Pellentesque donec pharetra magna gravida ipsum quis imperdiet. Cursulbrum quis semper duis non tortor orcu rutrum non. Pharetra massa et est et id in aliquam. Proin ipsum dictumst quis pulvinar in mauris congue risus. Congue scelerisque risus hac egestas. Pulvinar tristique mollis et congue convallis sed porta lobortis pellentesque nunc dignissim.'
    },
    contact: {
      location: 'jid hosity health, leaf, 222222',
      personal: '9034823483',
      professional: '9034823483',
      email: 'mathlxb@gmail.com',
      website: 'www.abcdefghixyz.nqfresh.com'
    },
    sections: {
      myBusiness: 'Voluptiat ipsum dictum veritius purus mauris risus. Sagittis sagittis varius sit tincidunt. Augue adipiscing quis interdum id risus non ultriices dignissim ornet. Pellentesque donec pharetra magna gravida ipsum quis imperdiet. Cursulbrum quis semper duis non tortor orcu rutrum non. Pharetra massa et est et id in aliquam. Proin ipsum dictumst quis pulvinar in mauris congue risus. Congue scelerisque risus hac egestas. Pulvinar tristique mollis et congue convallis sed porta lobortis pellentesque nunc dignissim.',
      myInterest: 'Business Development, Strategic Planning, Market Analysis, Team Leadership',
      mySkills: 'Business Strategy, Market Research, Team Management, Client Relations',
      myAsk: 'Looking for strategic partnerships and business expansion opportunities',
      myGives: 'Business development expertise, market insights, strategic consultation',
      eventsAttending: ['Business Summit 2024', 'Strategic Planning Conference', 'Market Analysis Workshop']
    },
    socialLinks: {
      phone: '+919034823483',
      email: 'mathlxb@gmail.com',
      linkedin: 'https://linkedin.com/in/jaimipanchal',
      website: 'https://www.abcdefghixyz.nqfresh.com'
    },
    isConnected: false
  },
  {
    id: '1',
    name: 'Ava Carter',
    title: 'Growth Strategist',
    membershipType: 'Core Member',
    avatar: '/dashboard/avatars/ava.jpg',
    business: {
      name: 'NovaReach Solutions',
      logo: '/dashboard/business-logos/novareach.png',
      description: 'Voluptiat ipsum dictum veritius purus mauris risus. Sagittis sagittis varius sit tincidunt. Augue adipiscing quis interdum id risus non ultriices dignissim ornet. Pellentesque donec pharetra magna gravida ipsum quis imperdiet. Cursulbrum quis semper duis non tortor orcu rutrum non. Pharetra massa et est et id in aliquam. Proin ipsum dictumst quis pulvinar in mauris congue risus. Congue scelerisque risus hac egestas. Pulvinar tristique mollis et congue convallis sed porta lobortis pellentesque nunc dignissim.'
    },
    contact: {
      location: 'Toronto, Canada',
      personal: '4161234567',
      professional: '4161234567',
      email: 'ava@novareach.com',
      website: 'www.novareach.com'
    },
    sections: {
      myBusiness: 'Marketing Tech Firm specializing in growth strategies and customer acquisition for B2B companies.',
      myInterest: 'Digital Marketing, Growth Hacking, Customer Analytics, SaaS Growth',
      mySkills: 'Growth Strategy, Digital Marketing, Data Analysis, Customer Acquisition',
      myAsk: 'Looking for partnerships with SaaS companies and mentorship in scaling businesses',
      myGives: 'Growth strategy consultation, marketing insights, customer acquisition expertise',
      eventsAttending: ['Growth Summit 2024', 'SaaS Marketing Conference', 'Digital Transformation Event']
    },
    socialLinks: {
      phone: '+14161234567',
      email: 'ava@novareach.com',
      linkedin: 'https://linkedin.com/in/avacarter',
      website: 'https://www.novareach.com'
    },
    isConnected: false
  },
  {
    id: '2',
    name: 'Ethan Patel',
    title: 'Chief Marketing Officer',
    membershipType: 'Premium Member',
    avatar: '/dashboard/avatars/ethan.jpg',
    business: {
      name: 'OrbitHive Media',
      logo: '/dashboard/business-logos/orbithive.png',
      description: 'Full-Service Ad Agency specializing in digital marketing solutions for enterprise clients. We help businesses grow through innovative marketing strategies and data-driven campaigns that deliver measurable ROI and sustainable growth.'
    },
    contact: {
      location: 'Austin, USA',
      personal: '5121234567',
      professional: '5121234567',
      email: 'ethan@orbithive.com',
      website: 'www.orbithive.com'
    },
    sections: {
      myBusiness: 'Leading digital marketing agency with focus on ROI-driven campaigns and enterprise solutions.',
      myInterest: 'Digital Marketing, AI in Advertising, Marketing Automation, Growth Hacking',
      mySkills: 'Digital Strategy, Campaign Management, Marketing Analytics, Team Leadership',
      myAsk: 'Seeking partnerships with tech companies for innovative ad solutions and AI marketing tools',
      myGives: 'Marketing strategy consultation, industry insights, networking opportunities',
      eventsAttending: ['Marketing Summit 2024', 'Digital Transformation Conference', 'AdTech Innovation Forum']
    },
    socialLinks: {
      phone: '+15121234567',
      email: 'ethan@orbithive.com',
      linkedin: 'https://linkedin.com/in/ethanpatel',
      website: 'https://www.orbithive.com'
    },
    isConnected: true
  },
  {
    id: '3',
    name: 'Lila Bennett',
    title: 'Brand Consultant',
    membershipType: 'Core Member',
    avatar: '/dashboard/avatars/lila.jpg',
    business: {
      name: 'PixelFrame Co.',
      logo: '/dashboard/business-logos/pixelframe.png',
      description: 'Creative Branding Agency focused on building memorable brand identities and visual experiences. We help businesses create authentic connections with their audiences through strategic design and storytelling.'
    },
    contact: {
      location: 'Berlin, Germany',
      personal: '+49301234567',
      professional: '+49301234567',
      email: 'lila@pixelframe.co',
      website: 'www.pixelframe.co'
    },
    sections: {
      myBusiness: 'Creative branding agency specializing in brand identity and visual storytelling for innovative companies.',
      myInterest: 'Brand Strategy, Visual Design, Creative Direction, Digital Branding',
      mySkills: 'Brand Development, Creative Strategy, Visual Identity, Design Thinking',
      myAsk: 'Looking for collaboration with tech startups and creative agencies for joint projects',
      myGives: 'Brand strategy consultation, design expertise, creative industry insights',
      eventsAttending: ['Design Conference Berlin', 'Brand Innovation Summit', 'Creative Industry Forum']
    },
    socialLinks: {
      phone: '+49301234567',
      email: 'lila@pixelframe.co',
      linkedin: 'https://linkedin.com/in/lilabennett',
      website: 'https://www.pixelframe.co'
    },
    isConnected: true
  }
];

// Helper function to get member profile by slug
export function getMemberProfile(slug: string): MemberProfile | undefined {
  return memberProfilesData.find(profile => 
    profile.id === slug || 
    profile.name.toLowerCase().replace(/\s+/g, '-') === slug
  );
}

// Generate slug from member name
export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}
