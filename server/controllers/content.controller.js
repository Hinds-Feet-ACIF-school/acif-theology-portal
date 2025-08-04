import { db } from '../config/firebase.config.js';
import { FieldValue } from 'firebase-admin/firestore';

const SITE_CONTENT_COLLECTION = 'siteContent'; // Re-using for consistency



// --- Home Page Content (Existing) ---
const HOME_PAGE_CONTENT_DOC_ID = 'homePage';
const ABOUT_US_PAGE_CONTENT_DOC_ID = 'aboutUsPage';
const USER_DASHBOARD_PAGE_CONTENT_DOC_ID = 'userDashboardPage'; 
const SITE_BRANDING_DOC_ID = 'siteBranding'; 



const defaultSiteBrandingContentData = {
  header: {
    siteName: "Apostolic Theology",
    // siteLogoUrl: "/assets/default-header-logo.png", // Optional: default static asset path
  },
  footer: {
    // footerLogoUrl: "/assets/default-footer-logo.png", // Optional
    footerSiteName: "Apostolic Theology",
    copyrightText: "International Apostolic Church", // "All rights reserved." and year added by frontend
    tagline: '"Study to shew thyself approved unto God..." - 2 Timothy 2:15',
  }
};

export const getSiteBrandingContent = async (req, res) => {
  console.log('[getSiteBrandingContent] Request received.');
  try {
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(SITE_BRANDING_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json({ identifier: SITE_BRANDING_DOC_ID, ...docSnap.data() });
    } else {
      console.log('[getSiteBrandingContent] Document not found, creating default.');
      await docRef.set({
        ...defaultSiteBrandingContentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newDocSnap = await docRef.get();
      res.status(200).json({ identifier: SITE_BRANDING_DOC_ID, ...newDocSnap.data() });
    }
  } catch (error) {
    console.error("Error fetching site branding content:", error);
    res.status(500).json({ message: "Error fetching site branding content", error: error.message });
  }
};

export const updateSiteBrandingContent = async (req, res) => {
  console.log('[updateSiteBrandingContent] Request received.');
  try {
    const contentData = req.body;
    const { identifier, ...saveData } = contentData;
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(SITE_BRANDING_DOC_ID);

    // Clean up empty logo URLs before saving
    if (saveData.header && saveData.header.hasOwnProperty('siteLogoUrl') && saveData.header.siteLogoUrl === "") {
        delete saveData.header.siteLogoUrl;
    }
    if (saveData.footer && saveData.footer.hasOwnProperty('footerLogoUrl') && saveData.footer.footerLogoUrl === "") {
        delete saveData.footer.footerLogoUrl;
    }
    
    await docRef.set({
      ...saveData,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const updatedDocSnap = await docRef.get();
    res.status(200).json({ identifier: SITE_BRANDING_DOC_ID, ...updatedDocSnap.data() });
  } catch (error) {
    console.error("Error updating site branding content:", error);
    res.status(500).json({ message: "Error updating site branding content", error: error.message });
  }
};



const defaultHomePageContentData = {
  // ... your existing defaultHomePageContentData
  hero: {
    title: "Apostolic & Evangelical Theology",
    subtitle: "A six-month online certificate program exploring foundational Christian doctrines and practical ministry from an Apostolic perspective.",
  },
  programHighlights: {
    title: "Program Highlights",
    description: "Our certificate program equips believers with a solid theological foundation and practical ministry skills for impactful service.",
    items: [
      { id: "ph1", text: "Six comprehensive courses over 6 months" },
      { id: "ph2", text: "Biannual intakes in January & July" },
      { id: "ph3", text: "Certificate awarded upon completion (39 ECTS)" },
      { id: "ph4", text: "Mentoring, community forums, and support" },
    ],
  },
  learningOutcomes: {
    title: "Learning Outcomes",
    description: "Upon successful completion, you will be able to:",
    items: [
      { id: "lo1", text: "Explain foundational Christian doctrines with clarity and confidence" },
      { id: "lo2", text: "Interpret Scripture using sound hermeneutical principles" },
      { id: "lo3", text: "Articulate Apostolic distinctives (Oneness, baptism, Holy Spirit)" },
      { id: "lo4", text: "Cultivate sustainable personal spiritual disciplines" },
      { id: "lo5", text: "Share the Gospel effectively and engage in thoughtful evangelism" },
      { id: "lo6", text: "Serve faithfully within the church community based on biblical models" },
    ],
  },
  cta: {
    unauthenticated: {
      title: "Begin Your Theological Journey",
      description: "Join our community of seekers and scholars. Enroll today and deepen your understanding of God's Word.",
      investmentLabel: "Investment:",
      investmentValueUSD: "$100 USD",
      investmentValueETB: "5500 ETB",
      investmentNote: "This one-time fee secures your place in the program.",
    },
    authenticated: {
      title: "Manage Your Studies",
      description: "Access your courses, progress, and community resources through your dashboard.",
    },
  },
};

export const getHomePageContent = async (req, res) => {
  try {
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(HOME_PAGE_CONTENT_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json({ identifier: HOME_PAGE_CONTENT_DOC_ID, ...docSnap.data() });
    } else {
      await docRef.set({
        ...defaultHomePageContentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newDocSnap = await docRef.get();
      res.status(200).json({ identifier: HOME_PAGE_CONTENT_DOC_ID, ...newDocSnap.data() });
    }
  } catch (error) {
    console.error("Error fetching home page content:", error);
    res.status(500).json({ message: "Error fetching home page content", error: error.message });
  }
};

export const updateHomePageContent = async (req, res) => {
  try {
    const contentData = req.body;
    // Remove identifier if it was part of the body, as it's path-based
    const { identifier, ...saveData } = contentData;
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(HOME_PAGE_CONTENT_DOC_ID);

    await docRef.set({
      ...saveData,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const updatedDocSnap = await docRef.get();
    res.status(200).json({ identifier: HOME_PAGE_CONTENT_DOC_ID, ...updatedDocSnap.data() });
  } catch (error) {
    console.error("Error updating home page content:", error);
    res.status(500).json({ message: "Error updating home page content", error: error.message });
  }
};
const FOOTER_CONTENT_DOC_ID = 'siteFooter';

const defaultFooterContentData = {
  // logoUrl: "", // You can add a default static asset URL or leave empty for upload
  siteName: "Apostolic Theology",
  copyrightText: "International Apostolic Church. All rights reserved.", // Year will be added dynamically on frontend
  tagline: '"Study to shew thyself approved unto God..." - 2 Timothy 2:15',
};

export const getFooterContent = async (req, res) => {
  try {
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(FOOTER_CONTENT_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json({ identifier: FOOTER_CONTENT_DOC_ID, ...docSnap.data() });
    } else {
      await docRef.set({
        ...defaultFooterContentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newDocSnap = await docRef.get();
      res.status(200).json({ identifier: FOOTER_CONTENT_DOC_ID, ...newDocSnap.data() });
    }
  } catch (error) {
    console.error("Error fetching footer content:", error);
    res.status(500).json({ message: "Error fetching footer content", error: error.message });
  }
};

export const updateFooterContent = async (req, res) => {
  try {
    const contentData = req.body;
    const { identifier, ...saveData } = contentData;
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(FOOTER_CONTENT_DOC_ID);

    // If logoUrl is an empty string, consider deleting it or setting to null
    if (saveData.hasOwnProperty('logoUrl') && saveData.logoUrl === "") {
        delete saveData.logoUrl; // Or saveData.logoUrl = null;
    }
    
    await docRef.set({
      ...saveData,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const updatedDocSnap = await docRef.get();
    res.status(200).json({ identifier: FOOTER_CONTENT_DOC_ID, ...updatedDocSnap.data() });
  } catch (error) {
    console.error("Error updating footer content:", error);
    res.status(500).json({ message: "Error updating footer content", error: error.message });
  }
};

// --- Program Overview Page Content (New) ---
const PROGRAM_OVERVIEW_PAGE_CONTENT_DOC_ID = 'programOverviewPage';

// This should mirror the structure in getInitialProgramOverviewData() in your Admin editor
const defaultProgramOverviewContentData = {
  hero: {
    title: "Program Overview",
    subtitle: "A comprehensive guide to our Certificate in Apostolic & Evangelical Theology.",
  },
  programStructure: {
    title: "Program Structure",
    description: "Our certificate program is structured to provide a comprehensive understanding of Apostolic and Evangelical theology through six sequential courses.",
    items: [
      { id: "ps1", title: "Duration", desc: "6 months total (6 courses, 4 weeks each)" },
      { id: "ps2", title: "Study Time", desc: "Approx. 10-12 hours per week" },
      { id: "ps3", title: "Credits", desc: "39 ECTS total (6.5 ECTS per course)" },
      { id: "ps4", title: "Delivery", desc: "100% online with video lectures, readings, and assignments" },
    ],
  },
  learningApproach: {
    title: "Learning Approach",
    description: "Our program follows a structured, sequential learning approach to ensure you build a solid foundation.",
    points: [
      { id: "la1", text: "Courses must be taken in sequence." },
      { id: "la2", text: "Weekly content unlocks progressively." },
      { id: "la3", text: "Must complete current week's materials before accessing next week." },
      { id: "la4", text: "Biannual intakes (January and July start dates)." },
      { id: "la5", text: "Cohort-based learning with peer interaction forums." },
      { id: "la6", text: "Mid-cohort entry: Complete the current cohort's remaining lessons. Finish any missed lessons during the next cohort intake (free of charge) to receive your certificate." }
    ],
    weeklyComponentsTitle: "Weekly Learning Components",
    weeklyComponents: [
      { id: "wc1", text: "Video Lectures" }, { id: "wc2", text: "Reading Materials" },
      { id: "wc3", text: "Quizzes & Assignments" }, { id: "wc4", text: "Discussion Forums" }
    ],
  },
  courseCurriculum: {
    title: "Course Curriculum",
    description: "Detailed breakdown of the six courses included in the certificate program.",
    courses: [ // Ensure this matches your admin editor's initial data
      {
        id: "foundations", title: "Foundations of the Christian Faith",
        description: "Introduces the central tenets of Christianity—God's nature, Jesus Christ's identity, the Holy Spirit's work, and salvation by grace through faith. Emphasizes both biblical understanding and personal application.",
        weeks: [
          { id: "fw1", text: "Week 1: The Nature & Attributes of God (Gen 1–2, Ps 139)"},
          { id: "fw2", text: "Week 2: The Person & Work of Jesus Christ (John 1, Col 1)"},
          { id: "fw3", text: "Week 3: The Holy Spirit & Spiritual Birth (John 3, Acts 2)"},
          { id: "fw4", text: "Week 4: Salvation & the New Life (Romans 5–6, Ephesians 2)"},
        ],
        assessments: [ { id: "fa1", text: "Short Quizzes (Weeks 1–3)"}, { id: "fa2", text: "Reflection Essay (Week 4)"} ],
        ects: 6.5,
      },
      // ... (Add other default courses as defined in your getInitialProgramOverviewData)
      {
        id: "bible", title: "The Bible: God's Word",
        description: "Explores the Bible's formation, authority, and interpretation. Equips students with methods to study and apply Scripture faithfully in personal life and ministry.",
        weeks: [ { id: "bw1", text: "Week 1: Canon & Inspiration (2 Tim 3:16, 2 Pet 1:19–21)"}, { id: "bw2", text: "Week 2: Old & New Testament Overview"}, { id: "bw3", text: "Week 3: Hermeneutics (Context, Culture)"}, { id: "bw4", text: "Week 4: Applying Scripture Today (Devotional exercise & final quiz)"}, ],
        assessments: [ { id: "ba1", text: "Weekly Reading Summaries"}, { id: "ba2", text: "Exegesis Project"}, { id: "ba3", text: "Final Quiz"} ],
        ects: 6.5,
      },
       {
        id: "apostolic", title: "Apostolic Doctrine",
        description: "Presents Oneness theology, baptism in Jesus' name, Holy Spirit baptism, and the call to holiness. Guides students in understanding and defending these Apostolic doctrines biblically and practically.",
        weeks: [ { id: "adw1", text: "Week 1: The Oneness of God (Deut 6:4, Isa 9:6)"}, { id: "adw2", text: "Week 2: Baptism in Jesus' Name (Acts 2, Acts 10, Acts 19)"}, { id: "adw3", text: "Week 3: Holy Spirit Baptism & Tongues (Acts 8, 1 Cor 14)"}, { id: "adw4", text: "Week 4: Holiness & Apostolic Identity"}, ],
        assessments: [ { id: "ada1", text: "Doctrinal Discussion Forum"}, { id: "ada2", text: "Essay: Defense of One Apostolic Doctrine"}, { id: "ada3", text: "Weekly Quizzes"} ],
        ects: 6.5,
      },
      {
        id: "spiritual", title: "Spiritual Growth & Christian Living",
        description: "Builds practical habits of prayer, fasting, Bible reading, and fellowship. Encourages holistic Christian ethics and personal sanctification.",
        weeks: [ { id: "sgw1", text: "Week 1: Prayer & Fasting (practice: 1-day group fast, journaling)"}, { id: "sgw2", text: "Week 2: Overcoming Temptation & Sin (Gal 5, Eph 6)"}, { id: "sgw3", text: "Week 3: The Fruit of the Spirit (Daily Spiritual Inventory)"}, { id: "sgw4", text: "Week 4: Building a Devotional Lifestyle (Final Self-assessment)"}, ],
        assessments: [ { id: "sga1", text: "Personal Devotion Log"}, { id: "sga2", text: "Weekly Quizzes"}, { id: "sga3", text: "Final Reflection Paper"} ],
        ects: 6.5,
      },
      {
        id: "evangelism", title: "Introduction to Evangelism",
        description: "Equips students with biblical frameworks for evangelism and outreach, including personal testimony, apologetics, and cross-cultural communication of the Gospel.",
        weeks: [ { id: "iew1", text: "Week 1: The Great Commission (Matt 28, Mark 16)"}, { id: "iew2", text: "Week 2: Personal Testimony & Witnessing (Record your testimony)"}, { id: "iew3", text: "Week 3: Basic Apologetics (Common objections & responses)"}, { id: "iew4", text: "Week 4: Evangelism Project (Submit outreach plan)"}, ],
        assessments: [ { id: "iea1", text: "Weekly Quizzes"}, { id: "iea2", text: "Personal Testimony Video/Essay"}, { id: "iea3", text: "Outreach/Apologetics Plan"} ],
        ects: 6.5,
      },
      {
        id: "church", title: "Church Life & Service",
        description: "Covers the role of the Church, spiritual gifts, and biblical models of service. Encourages unity, humility, and accountability in ministry.",
        weeks: [ { id: "clw1", text: "Week 1: The Church in Scripture (Acts 2, Eph 4)"}, { id: "clw2", text: "Week 2: Spiritual Gifts & Ministry Roles (gift assessment test)"}, { id: "clw3", text: "Week 3: Servant Leadership & Unity (John 13, 1 Cor 12)"}, { id: "clw4", text: "Week 4: Practical Service Project"}, ],
        assessments: [ { id: "cla1", text: "Spiritual Gift Survey"}, { id: "cla2", text: "Leadership Case Study"}, { id: "cla3", text: "Final \"Service Plan\" Project"} ],
        ects: 6.5,
      },
    ],
  },
  certification: {
    title: "Certification",
    description: "Upon successful completion of all program requirements.",
    mockup: {
      titlePrefix: "Certificate in",
      mainTitle: "Apostolic & Evangelical Theology",
      awardedBy: "Awarded by the International Apostolic Church",
      credits: "39 ECTS Credits",
    },
    whatYoullReceiveTitle: "What You'll Receive",
    details: [
      { id: "cd1", text: "Digital certificate suitable for printing (with unique ID)" },
      { id: "cd2", text: "Official transcript detailing courses and grades" },
      { id: "cd3", text: "Recognition of completion from the Apostolic Church International" },
      { id: "cd4", text: "Solid foundation for ministry roles or further theological studies" },
    ],
    quote: '"Study to show yourself approved unto God..." – 2 Timothy 2:15',
  },
  cta: {
    title: "Ready to Begin Your Theological Journey?",
    description: "Join our next cohort and deepen your understanding of Apostolic and Evangelical theology.",
    investmentLabel: "Investment:",
    investmentValue: "$100 Enrollment Fee",
    investmentNote: "A one-time fee to secure your place and begin this transformative program.",
  },
};

export const getProgramOverviewContent = async (req, res) => {
  try {
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(PROGRAM_OVERVIEW_PAGE_CONTENT_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json({ identifier: PROGRAM_OVERVIEW_PAGE_CONTENT_DOC_ID, ...docSnap.data() });
    } else {
      // If it doesn't exist, create it with default data
      await docRef.set({
        ...defaultProgramOverviewContentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newDocSnap = await docRef.get();
      res.status(200).json({ identifier: PROGRAM_OVERVIEW_PAGE_CONTENT_DOC_ID, ...newDocSnap.data() });
    }
  } catch (error) {
    console.error("Error fetching program overview content:", error);
    res.status(500).json({ message: "Error fetching program overview content", error: error.message });
  }
};

export const updateProgramOverviewContent = async (req, res) => {
  try {
    const contentData = req.body;
    const { identifier, ...saveData } = contentData; // Remove identifier if sent in body
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(PROGRAM_OVERVIEW_PAGE_CONTENT_DOC_ID);

    // Ensure courses, and their weeks/assessments arrays exist before saving to prevent errors
    // if they were somehow removed/nulled on the client.
    // This is a basic safeguard; more robust validation would be even better.
    if (saveData.courseCurriculum && saveData.courseCurriculum.courses) {
      saveData.courseCurriculum.courses = saveData.courseCurriculum.courses.map(course => ({
        ...course,
        weeks: course.weeks || [],
        assessments: course.assessments || [],
      }));
    }


    await docRef.set({
      ...saveData, // Save the actual content fields
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }); // Merge true is important to not overwrite createdAt or other fields

    const updatedDocSnap = await docRef.get();
    res.status(200).json({ identifier: PROGRAM_OVERVIEW_PAGE_CONTENT_DOC_ID, ...updatedDocSnap.data() });
  } catch (error) {
    console.error("Error updating program overview content:", error);
    res.status(500).json({ message: "Error updating program overview content", error: error.message });
  }
};

const defaultAboutUsPageContentData = {
  
  hero: {
    logoUrl: "",
    title: "About Our Program",
    subtitle: "Equipping believers for faithful understanding and service through theological education rooted in Apostolic and Evangelical traditions.",
  },
  missionVision: {
    missionTitle: "Our Mission",
    missionDescription: "To provide accessible, comprehensive, and spiritually enriching theological education that grounds students in the core doctrines of the Christian faith, emphasizes Apostolic distinctives, and equips them for effective ministry and personal growth within the context of the global Apostolic movement and the broader Evangelical world.",
    visionTitle: "Our Vision",
    visionDescription: "To be a leading online resource for theological training, fostering a global community of knowledgeable, passionate, and servant-hearted believers who faithfully interpret Scripture, articulate sound doctrine, live transformed lives, and effectively share the Gospel of Jesus Christ.",
  },
  coreValues: {
    title: "Our Core Values",
    items: [
      { id: "cv1", title: "Biblical Fidelity", desc: "Upholding the Bible as the inspired, infallible Word of God." },
      { id: "cv2", title: "Apostolic Foundation", desc: "Emphasizing the doctrines and practices taught by the Apostles." },
      { id: "cv3", title: "Doctrinal Clarity", desc: "Striving for accurate understanding and articulation of core Christian beliefs." },
      { id: "cv4", title: "Academic Rigor", desc: "Commitment to sound scholarship and critical thinking within a faith context." },
      { id: "cv5", title: "Community & Fellowship", desc: "Fostering interaction and support among students and instructors." },
      { id: "cv6", title: "Practical Application", desc: "Connecting theological knowledge to everyday life, ministry, and service." },
    ],
  },
 
};

export const getAboutUsPageContent = async (req, res) => {
  try {
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(ABOUT_US_PAGE_CONTENT_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json({ identifier: ABOUT_US_PAGE_CONTENT_DOC_ID, ...docSnap.data() });
    } else {
      await docRef.set({
        ...defaultAboutUsPageContentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newDocSnap = await docRef.get();
      res.status(200).json({ identifier: ABOUT_US_PAGE_CONTENT_DOC_ID, ...newDocSnap.data() });
    }
  } catch (error) {
    console.error("Error fetching About Us page content:", error);
    res.status(500).json({ message: "Error fetching About Us page content", error: error.message });
  }
};

export const updateAboutUsPageContent = async (req, res) => {
  try {
    const contentData = req.body;
    const { identifier, ...saveData } = contentData;
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(ABOUT_US_PAGE_CONTENT_DOC_ID);

    await docRef.set({
      ...saveData,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const updatedDocSnap = await docRef.get();
    res.status(200).json({ identifier: ABOUT_US_PAGE_CONTENT_DOC_ID, ...updatedDocSnap.data() });
  } catch (error) {
    console.error("Error updating About Us page content:", error);
    res.status(500).json({ message: "Error updating About Us page content", error: error.message });
  }
};

// --- Contact Us Page Content (New) ---
const CONTACT_US_PAGE_CONTENT_DOC_ID = 'contactUsPage';

const defaultContactUsPageContentData = {
  hero: {
    title: "Contact Us",
    subtitle: "We'd love to hear from you! Reach out with any questions or inquiries.",
  },
  getInTouch: {
    title: "Get in Touch",
    emailInfo: {
      id: "mainEmail", // Static ID for this single email entry
      type: "Email",   // Type for potential icon mapping
      value: "info@apostolictheology.org", // Default email
      description: "For general inquiries and admissions",
    },
  },
  sendMessage: {
    title: "Send Us a Message",
  },
};

export const getContactUsPageContent = async (req, res) => {
  try {
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(CONTACT_US_PAGE_CONTENT_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json({ identifier: CONTACT_US_PAGE_CONTENT_DOC_ID, ...docSnap.data() });
    } else {
      await docRef.set({
        ...defaultContactUsPageContentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newDocSnap = await docRef.get();
      res.status(200).json({ identifier: CONTACT_US_PAGE_CONTENT_DOC_ID, ...newDocSnap.data() });
    }
  } catch (error) {
    console.error("Error fetching Contact Us page content:", error);
    res.status(500).json({ message: "Error fetching Contact Us page content", error: error.message });
  }
};

export const updateContactUsPageContent = async (req, res) => {
  try {
    const contentData = req.body;
    const { identifier, ...saveData } = contentData;
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(CONTACT_US_PAGE_CONTENT_DOC_ID);

    await docRef.set({
      ...saveData,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const updatedDocSnap = await docRef.get();
    res.status(200).json({ identifier: CONTACT_US_PAGE_CONTENT_DOC_ID, ...updatedDocSnap.data() });
  } catch (error) {
    console.error("Error updating Contact Us page content:", error);
    res.status(500).json({ message: "Error updating Contact Us page content", error: error.message });
  }
};

const defaultUserDashboardPageContentData = {
  guidanceSection: {
    title: "Get Started Smoothly!",
    description: "New to the platform or need a quick tour? Our guide video will walk you through everything.",
    buttonText: "Watch Platform Guide",
    // videoUrl: "YOUR_DEFAULT_GUIDANCE_VIDEO_URL_HERE", 
  },
  // announcements: [], // Initialize as empty if you plan to make them editable
};

export const getUserDashboardPageContent = async (req, res) => {
  try {
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(USER_DASHBOARD_PAGE_CONTENT_DOC_ID);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json({ identifier: USER_DASHBOARD_PAGE_CONTENT_DOC_ID, ...docSnap.data() });
    } else {
      await docRef.set({
        ...defaultUserDashboardPageContentData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      const newDocSnap = await docRef.get();
      res.status(200).json({ identifier: USER_DASHBOARD_PAGE_CONTENT_DOC_ID, ...newDocSnap.data() });
    }
  } catch (error) {
    console.error("Error fetching User Dashboard page content:", error);
    res.status(500).json({ message: "Error fetching User Dashboard page content", error: error.message });
  }
};

export const updateUserDashboardPageContent = async (req, res) => {
  try {
    const contentData = req.body;
    const { identifier, ...saveData } = contentData;
    const docRef = db.collection(SITE_CONTENT_COLLECTION).doc(USER_DASHBOARD_PAGE_CONTENT_DOC_ID);

    await docRef.set({
      ...saveData,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const updatedDocSnap = await docRef.get();
    res.status(200).json({ identifier: USER_DASHBOARD_PAGE_CONTENT_DOC_ID, ...updatedDocSnap.data() });
  } catch (error) {
    console.error("Error updating User Dashboard page content:", error);
    res.status(500).json({ message: "Error updating User Dashboard page content", error: error.message });
  }
};