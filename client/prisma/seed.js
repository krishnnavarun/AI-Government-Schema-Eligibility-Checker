require("dotenv").config();
const { PrismaClient } = require("../app/generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const schemesData = [
  {
    name: "PM Kisan Samman Nidhi",
    description: "An initiative by the Government of India that provides up to ₹6,000 per year in three equal installments as income support to all landholding farmers' families.",
    benefits: "₹6,000 per annum paid in 3 installments of ₹2,000 directly into bank accounts.",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    eligibility: {
      incomeLimit: 300000,
      isFarmer: true,
      isStudent: false,
      ageMin: 18,
    },
    documents: [
      "Aadhaar Card",
      "Land Ownership Documents (Pattadar Passbook)",
      "Bank Account Details",
      "Mobile Number linked with Aadhaar"
    ],
    deadline: "2026-12-31",
    officialUrl: "https://pmkisan.gov.in/",
    stateAvailability: "All"
  },
  {
    name: "Post Matric Scholarship Scheme",
    description: "Financial assistance to students belonging to Scheduled Castes, Scheduled Tribes, and OBC categories to enable them to pursue post-matric or post-secondary courses.",
    benefits: "100% tuition fee reimbursement and a monthly maintenance allowance up to ₹1,250.",
    ministry: "Ministry of Social Justice and Empowerment",
    eligibility: {
      incomeLimit: 250000,
      isStudent: true,
      casteCategory: ["SC", "ST", "OBC"],
      ageMin: 15,
      ageMax: 30
    },
    documents: [
      "Aadhaar Card",
      "Caste Certificate",
      "Income Certificate (issued by competent authority)",
      "Current College Admission Receipt",
      "Previous Class Marks Card"
    ],
    deadline: "2026-10-31",
    officialUrl: "https://scholarships.gov.in/",
    stateAvailability: "All"
  },
  {
    name: "Startup India Seed Fund Scheme",
    description: "Provides financial assistance to startups for proof of concept, prototype development, product trials, market-entry, and commercialization.",
    benefits: "Grants up to ₹20 Lakhs for prototype development/trials, and up to ₹50 Lakhs for commercialization/market-entry.",
    ministry: "Ministry of Commerce and Industry",
    eligibility: {
      incomeLimit: 50000000,
      isStudent: false,
      ageMin: 18
    },
    documents: [
      "DPIIT Recognition Certificate",
      "Detailed Project Report (DPR)",
      "Shareholding Pattern Details",
      "Company PAN and Bank Account"
    ],
    deadline: "2027-03-31",
    officialUrl: "https://www.startupindia.gov.in/",
    stateAvailability: "All"
  },
  {
    name: "Pudhumai Penn Scheme (Higher Education Assurance)",
    description: "A Tamil Nadu state initiative offering monthly financial assistance to girl students who studied in government schools and are now pursuing higher education in college.",
    benefits: "₹1,000 per month directly deposited into the student's bank account until graduation.",
    ministry: "Department of Social Welfare, Tamil Nadu",
    eligibility: {
      incomeLimit: 200000,
      isStudent: true,
      gender: "Female",
      ageMin: 17,
      ageMax: 25
    },
    documents: [
      "Government School Study Certificate (Classes 6-12)",
      "College Admission Proof / ID Card",
      "Bank Passbook (showing IFSC)",
      "Aadhaar Card"
    ],
    deadline: "2026-09-15",
    officialUrl: "https://www.pudhumaipenn.tn.gov.in/",
    stateAvailability: "Tamil Nadu"
  },
  {
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    description: "A social welfare program created by the Indian government to provide affordable housing for the urban and rural poor.",
    benefits: "Interest subsidy of up to 6.5% on home loans for first-time buyers.",
    ministry: "Ministry of Housing and Urban Affairs",
    eligibility: {
      incomeLimit: 1800000,
      ageMin: 18,
      ageMax: 70,
      isStudent: false
    },
    documents: [
      "Aadhaar Card",
      "Income Certificate",
      "Address Proof",
      "Bank Passbook"
    ],
    deadline: "2026-12-31",
    officialUrl: "https://pmaymis.gov.in/",
    stateAvailability: "All"
  },
  {
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    description: "The largest government-funded healthcare program in the world, providing cashless secondary and tertiary healthcare coverage to low-income families.",
    benefits: "Free health insurance cover up to ₹5,00,000 per family per year for secondary/tertiary hospitalizations.",
    ministry: "Ministry of Health and Family Welfare",
    eligibility: {
      incomeLimit: 250000,
      ageMin: 0,
      ageMax: 100
    },
    documents: [
      "Aadhaar Card",
      "Ration Card",
      "Income Certificate"
    ],
    deadline: "2027-03-31",
    officialUrl: "https://pmjay.gov.in/",
    stateAvailability: "All"
  },
  {
    name: "Atal Pension Yojana (APY)",
    description: "A government-backed pension scheme in India targeted primarily at the unorganized sector workers, allowing them to save for their retirement.",
    benefits: "Guaranteed minimum monthly pension between ₹1,000 and ₹5,000 after reaching age 60, based on contributions.",
    ministry: "Ministry of Finance",
    eligibility: {
      ageMin: 18,
      ageMax: 40,
      incomeLimit: 800000,
      isStudent: false
    },
    documents: [
      "Aadhaar Card",
      "Savings Bank Account Details",
      "Mobile Number"
    ],
    deadline: "2026-12-31",
    officialUrl: "https://www.npscra.nsdl.co.in/",
    stateAvailability: "All"
  },
  {
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    description: "A flagship scheme designed to provide loans up to ₹10 Lakhs to non-corporate, non-farm small and micro-enterprises to generate employment and income.",
    benefits: "Collateral-free business loans up to ₹10 Lakhs in three categories (Shishu, Kishor, Tarun).",
    ministry: "Ministry of Finance",
    eligibility: {
      ageMin: 18,
      ageMax: 65,
      isStudent: false
    },
    documents: [
      "Aadhaar Card",
      "Business Proof",
      "Identity Proof",
      "Project Report / Business Proposal"
    ],
    deadline: "2026-12-31",
    officialUrl: "https://www.mudra.org.in/",
    stateAvailability: "All"
  },
  {
    name: "Pradhan Mantri Ujjwala Yojana (PMUY)",
    description: "A welfare initiative aimed at providing clean cooking fuel (LPG connections) to women from economically disadvantaged and Below Poverty Line (BPL) households.",
    benefits: "A deposit-free LPG cylinder, regulator, safety hose, and a cash assistance of ₹1,600 per connection.",
    ministry: "Ministry of Petroleum and Natural Gas",
    eligibility: {
      ageMin: 18,
      gender: "Female",
      incomeLimit: 180000,
      isStudent: false
    },
    documents: [
      "Aadhaar Card",
      "BPL Ration Card",
      "Bank Account Details",
      "Passport Size Photograph"
    ],
    deadline: "2026-12-31",
    officialUrl: "https://www.pmuy.gov.in/",
    stateAvailability: "All"
  },
  {
    name: "National Social Assistance Programme (NSAP)",
    description: "A social security scheme that offers monthly pensions to senior citizens, widows, and disabled persons belonging to households below the poverty line.",
    benefits: "Monthly pension of ₹200 for ages 60-79, and ₹500 per month for ages 80 and above.",
    ministry: "Ministry of Rural Development",
    eligibility: {
      ageMin: 60,
      incomeLimit: 120000,
      isStudent: false
    },
    documents: [
      "Aadhaar Card",
      "Age Proof Certificate",
      "BPL Certificate",
      "Bank Account details"
    ],
    deadline: "2026-12-31",
    officialUrl: "https://nsap.nic.in/",
    stateAvailability: "All"
  }
];

async function main() {
  await prisma.application.deleteMany({});
  await prisma.savedScheme.deleteMany({});
  await prisma.scheme.deleteMany({});
  for (const scheme of schemesData) {
    await prisma.scheme.create({
      data: {
        name: scheme.name,
        description: scheme.description,
        benefits: scheme.benefits,
        ministry: scheme.ministry,
        eligibility: scheme.eligibility,
        documents: scheme.documents,
        deadline: scheme.deadline,
        officialUrl: scheme.officialUrl,
        stateAvailability: scheme.stateAvailability,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
