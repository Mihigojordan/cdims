// --- Type Definitions ---
export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishDate: string; // ISO string
  readTime: string;
  category: string;
  image: string;
  views: number;
  likes: number;
  featured: boolean;
  tags: string[];
}

// --- Blog Data ---
export const blogs: BlogPost[] = [
  {
    id: 1,
    title: "10 Essential HR Metrics Every Leader Should Track in 2025",
    excerpt: "Discover the key performance indicators that will help you measure and improve your HR effectiveness, from employee satisfaction to retention rates.",
    author: "Sarah Johnson",
    authorRole: "HR Analytics Expert",
    publishDate: "2025-08-10",
    readTime: "8 min read",
    category: "HR Best Practices",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    views: 2450,
    likes: 89,
    featured: true,
    tags: ["Analytics", "KPIs", "Performance", "Data-Driven HR"]
  },
  {
    id: 2,
    title: "Building a Remote-First Culture: HR Strategies That Work",
    excerpt: "Learn how to create an engaging remote work environment that maintains productivity and fosters strong team connections in distributed teams.",
    author: "Michael Chen",
    authorRole: "Remote Work Specialist",
    publishDate: "2025-08-08",
    readTime: "12 min read",
    category: "Workplace Culture",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    views: 1890,
    likes: 67,
    featured: true,
    tags: ["Remote Work", "Culture", "Team Building", "Productivity"]
  },
  {
    id: 3,
    title: "Navigating Rwanda's New Employment Laws: A Complete Guide",
    excerpt: "Stay compliant with the latest updates to Rwanda's employment legislation and understand how these changes affect your HR policies and procedures.",
    author: "Grace Uwimana",
    authorRole: "Legal Compliance Officer",
    publishDate: "2025-08-06",
    readTime: "15 min read",
    category: "Compliance & Legal",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop",
    views: 3200,
    likes: 124,
    featured: false,
    tags: ["Legal", "Compliance", "Rwanda", "Employment Law"]
  },
  {
    id: 4,
    title: "Employee Engagement in the Digital Age: Tools and Techniques",
    excerpt: "Explore modern approaches to keeping your workforce engaged using digital tools, feedback systems, and innovative recognition programs.",
    author: "David Mutabazi",
    authorRole: "Employee Experience Manager",
    publishDate: "2025-08-04",
    readTime: "10 min read",
    category: "Employee Engagement",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    views: 1560,
    likes: 78,
    featured: false,
    tags: ["Engagement", "Digital Tools", "Recognition", "Feedback"]
  },
  {
    id: 5,
    title: "Payroll Automation: Reducing Errors and Saving Time",
    excerpt: "Discover how automated payroll systems can eliminate human errors, ensure compliance, and free up your HR team for strategic initiatives.",
    author: "Anne Mukamana",
    authorRole: "Payroll Systems Expert",
    publishDate: "2025-08-02",
    readTime: "7 min read",
    category: "Payroll & Benefits",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    views: 2100,
    likes: 95,
    featured: false,
    tags: ["Payroll", "Automation", "Efficiency", "Compliance"]
  },
  {
    id: 6,
    title: "The Future of HR: AI and Machine Learning Applications",
    excerpt: "Explore how artificial intelligence is revolutionizing HR processes, from recruitment screening to predictive analytics for employee retention.",
    author: "Dr. James Mukama",
    authorRole: "HR Technology Researcher",
    publishDate: "2025-07-30",
    readTime: "14 min read",
    category: "Technology & Innovation",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    views: 4200,
    likes: 156,
    featured: true,
    tags: ["AI", "Machine Learning", "Future of Work", "Innovation"]
  },
  {
    id: 7,
    title: "Effective Leadership During Organizational Change",
    excerpt: "Learn essential leadership strategies for guiding your team through transitions while maintaining morale and productivity.",
    author: "Patricia Nyirahuku",
    authorRole: "Change Management Consultant",
    publishDate: "2025-07-28",
    readTime: "11 min read",
    category: "Leadership & Management",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    views: 1780,
    likes: 82,
    featured: false,
    tags: ["Leadership", "Change Management", "Team Leadership", "Organizational Development"]
  },
  {
    id: 8,
    title: "Creating Inclusive Workplaces: Beyond Policy to Practice",
    excerpt: "Move beyond diversity policies to create truly inclusive environments where every employee can thrive and contribute their best work.",
    author: "Emmanuel Nkurunziza",
    authorRole: "Diversity & Inclusion Specialist",
    publishDate: "2025-07-26",
    readTime: "13 min read",
    category: "Workplace Culture",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop",
    views: 2890,
    likes: 134,
    featured: false,
    tags: ["Diversity", "Inclusion", "Workplace Culture", "Equity"]
  }
];

// --- Blog Categories ---
export const blogsCategories: string[] = [
  'All',
  'HR Best Practices',
  'Employee Engagement',
  'Payroll & Benefits',
  'Compliance & Legal',
  'Technology & Innovation',
  'Leadership & Management',
  'Workplace Culture'
];
