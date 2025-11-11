import { faker } from "@faker-js/faker";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

/**
 * DUMINGAG INSTITUTE OF SUSTAINABLE ORGANIC AGRICULTURE
 * Realistic Mock Data Generator for TESDA Agriculture Programs
 * 
 * Features:
 * - Fixed number of courses based on a detailed curriculum
 * - Realistic variance in user behavior and performance
 * - Logical progression and timestamps for all activities
 * - Edge cases (missing data, late submissions, varied completion)
 * - Rich, local Mindanao context (Dumingag, Zamboanga del Sur)
 * - Detailed, Markdown-formatted lesson content for TipTap
 */

const DEFAULT_ADMIN_ID = "jd7bn0q8mhmtywa72v530hww3d7ts0q4";
const DEFAULT_FACULTY_ID = "jd77r0n8y3gxf3wyjvmbdw1qh57tsevc";
const DEFAULT_LEARNER_ID = "jd723cfcgw174980x695nykg7n7trdhb";

// =================================================================
// DUMINGAG INSTITUTE & REALISM CONFIGURATION
// =================================================================

const INSTITUTE_INFO = {
  name: "Dumingag Institute of Sustainable Organic Agriculture",
  shortName: "DISOA",
  location: "Dumingag, Zamboanga del Sur, Philippines",
  tagline: "Para sa sustainableng agrikultura ng Mindanao",
  focus: "Organic Agriculture and Sustainable Farming Practices",
};

// Local crops commonly grown in Dumingag and Mindanao
const LOCAL_CROPS = {
  mainCrops: ["Rice (Palay)", "Corn (Mais)", "Coconut (Niyog)", "Cassava (Kamoteng Kahoy)"],
  vegetables: ["Tomato", "Eggplant (Talong)", "Bitter Gourd (Ampalaya)", "String Beans (Sitaw)", "Okra", "Squash (Kalabasa)", "Mustard (Mustasa)", "Pechay"],
  fruits: ["Banana (Saging)", "Papaya", "Calamansi", "Mango", "Lanzones", "Durian"],
  rootCrops: ["Sweet Potato (Kamote)", "Gabi (Taro)", "Ube"],
};

const AGRI_MODULES_BY_COURSE = {
  "Introduction to Agricultural Crops Production": [
    { title: "Overview of Philippine Agriculture", description: "Learn about the agriculture sector, major crops, and industry trends" },
    { title: "Career Pathways in Agriculture", description: "Explore career opportunities and skills requirements in crop production" },
    { title: "Farm Safety and PPE", description: "Understand workplace hazards and proper use of safety equipment" }
  ],
  "Performing Nursery Operations": [
    { title: "Nursery Site Selection and Layout", description: "Criteria for selecting and preparing nursery sites" },
    { title: "Growing Media Preparation", description: "Formulating and sterilizing potting mixes" },
    { title: "Seed Sowing and Seedling Care", description: "Techniques for successful seed germination and seedling management" }
  ],
  "Planting Crops": [
    { title: "Land Preparation", description: "Soil cultivation, beds/furrow preparation, and layout" },
    { title: "Transplanting and Direct Seeding", description: "Methods and best practices for crop establishment" },
    { title: "Planting Tools and Equipment", description: "Operation and maintenance of planting implements" }
  ],
  "Caring and Maintaining Crops": [
    { title: "Fertilizer Management", description: "Application methods, rates, and timing for crop nutrients" },
    { title: "Irrigation and Water Management", description: "Irrigation systems and water-saving techniques" },
    { title: "Integrated Pest Management", description: "Identifying and managing pests, diseases, and weeds" }
  ],
  "Performing Harvest and Postharvest Operations": [
    { title: "Determining Harvest Maturity", description: "Indices and methods to determine proper harvest time" },
    { title: "Harvesting Techniques", description: "Proper harvest methods and tools for different crops" },
    { title: "Postharvest Handling and Storage", description: "Sorting, grading, packing, and storage procedures" }
  ],
  "Introduction to Organic Agriculture": [
    { title: "Organic Farming Principles", description: "Philosophy and science behind organic agriculture" },
    { title: "Organic Standards and Certification", description: "Philippine organic standards (PNS) and certification process" },
    { title: "Organic Farm Planning", description: "Conversion planning and organic farm design" }
  ],
  "Producing Organic Fertilizers": [
    { title: "Composting Methods", description: "Hot composting, cold composting, and compost troubleshooting" },
    { title: "Vermicomposting", description: "Setting up worm bins and managing African night crawlers" },
    { title: "Liquid Organic Fertilizers", description: "Fermented plant juice, fish amino acids, and application" }
  ],
  "Formulating Organic Concoctions and Extracts": [
    { title: "Indigenous Microorganisms (IMO)", description: "Collecting and multiplying beneficial microbes" },
    { title: "Botanical Pesticides", description: "Preparing plant-based pest control solutions" },
    { title: "Organic Growth Enhancers", description: "Fermented extracts for plant nutrition and vigor" }
  ],
  "Producing Organic Vegetables": [
    { title: "Organic Soil Preparation", description: "Building soil fertility using organic amendments" },
    { title: "Organic Pest and Disease Control", description: "Natural methods for crop protection" },
    { title: "Organic Crop Rotation", description: "Planning crop sequences for soil health" }
  ],
  "Raising Organic Chickens": [
    { title: "Organic Poultry Housing", description: "Designing free-range chicken houses and outdoor runs" },
    { title: "Organic Feed Formulation", description: "Preparing organic feeds using local ingredients" },
    { title: "Natural Health Management", description: "Disease prevention using organic veterinary products" }
  ],
  "Ornamental Plant Propagation": [
    { title: "Sexual Propagation", description: "Seed collection, storage, and germination" },
    { title: "Asexual Propagation", description: "Cutting, grafting, and layering techniques" },
    { title: "Nursery Management", description: "Production scheduling and nursery operations" }
  ],
  "Landscape Design and Installation": [
    { title: "Site Analysis and Planning", description: "Assessing site conditions for landscape design" },
    { title: "Landscape Construction", description: "Installing hardscapes, irrigation, and planting" },
    { title: "Landscape Maintenance", description: "Ongoing care and maintenance programs" }
  ]
};

const AGRI_LESSON_TEMPLATES = [
  // Nursery Operations
  { module: "Nursery Site Selection and Layout", lessons: [
    "Factors in Selecting Nursery Location",
    "Types of Nursery Structures",
    "Nursery Layout and Design",
    "Preparing the Nursery Area"
  ]},
  { module: "Growing Media Preparation", lessons: [
    "Components of Growing Media",
    "Media Formulation for Different Crops",
    "Sterilization Methods",
    "Filling Containers and Seed Trays"
  ]},
  { module: "Seed Sowing and Seedling Care", lessons: [
    "Seed Selection and Quality Testing",
    "Seed Treatment Methods",
    "Sowing Techniques and Depth",
    "Watering and Fertilizing Seedlings",
    "Hardening-off Procedures"
  ]},
  // Planting
  { module: "Land Preparation", lessons: [
    "Plowing and Harrowing",
    "Bed and Furrow Preparation",
    "Field Layout and Staking",
    "Organic Matter Incorporation"
  ]},
  { module: "Transplanting and Direct Seeding", lessons: [
    "Proper Transplanting Techniques",
    "Direct Seeding Methods",
    "Crop Spacing and Population",
    "Post-Planting Care"
  ]},
  // Crop Care
  { module: "Fertilizer Management", lessons: [
    "Reading Fertilizer Labels (NPK)",
    "Calculating Fertilizer Rates",
    "Application Methods and Timing",
    "Signs of Nutrient Deficiency"
  ]},
  { module: "Irrigation and Water Management", lessons: [
    "Types of Irrigation Systems",
    "Determining When to Irrigate",
    "Water-Saving Techniques",
    "Drainage Management"
  ]},
  { module: "Integrated Pest Management", lessons: [
    "Identifying Common Crop Pests",
    "Identifying Common Crop Diseases",
    "Cultural Control Methods",
    "Biological Control Methods",
    "Safe Use of Pesticides"
  ]},
  // Harvest and Postharvest
  { module: "Determining Harvest Maturity", lessons: [
    "Maturity Indices for Vegetables",
    "Maturity Indices for Fruits",
    "Tools for Maturity Testing"
  ]},
  { module: "Harvesting Techniques", lessons: [
    "Harvesting Tools and Equipment",
    "Proper Harvesting Methods",
    "Harvest Scheduling",
    "Field Handling and Transport"
  ]},
  { module: "Postharvest Handling and Storage", lessons: [
    "Sorting and Grading Standards",
    "Cleaning and Washing",
    "Packing Materials and Methods",
    "Storage Conditions and Temperature",
    "Record-Keeping for Traceability"
  ]},
  // Organic Agriculture
  { module: "Organic Farming Principles", lessons: [
    "The Four Principles of Organic Agriculture",
    "Benefits of Organic Farming",
    "Comparison: Organic vs. Conventional"
  ]},
  { module: "Composting Methods", lessons: [
    "Materials for Composting (Browns and Greens)",
    "Setting Up a Compost Pile",
    "Managing Compost Temperature and Moisture",
    "Troubleshooting Compost Problems",
    "When is Compost Ready?"
  ]},
  { module: "Vermicomposting", lessons: [
    "Biology of African Night Crawlers",
    "Building a Vermicompost Bed",
    "Feeding and Maintaining Worms",
    "Harvesting Vermicast"
  ]},
  { module: "Indigenous Microorganisms (IMO)", lessons: [
    "What are IMO and Their Benefits",
    "Collecting IMO-1 (Wild Microbes)",
    "Preparing IMO-2 (Adding Sugar)",
    "Making IMO-3 (Fermenting with Bran)",
    "Application of IMO in Farming"
  ]},
  { module: "Botanical Pesticides", lessons: [
    "Neem Extract Preparation",
    "Chili-Garlic Spray",
    "Kakawate (Madre de Cacao) Extract",
    "Tobacco Tea Solution",
    "Application and Safety"
  ]},
  { module: "Organic Soil Preparation", lessons: [
    "Soil Testing and Analysis",
    "Applying Compost and Organic Fertilizers",
    "Green Manuring and Cover Crops",
    "Mulching Techniques"
  ]},
  { module: "Organic Poultry Housing", lessons: [
    "Housing Requirements for Organic Chickens",
    "Outdoor Run and Pasture Design",
    "Nest Boxes and Roosting Areas",
    "Biosecurity in Organic Systems"
  ]},
  { module: "Organic Feed Formulation", lessons: [
    "Organic Feed Ingredients",
    "Formulating Starter, Grower, and Layer Rations",
    "Calculating Feed Requirements",
    "Feeding Schedules"
  ]},
  { module: "Natural Health Management", lessons: [
    "Preventing Diseases Naturally",
    "Organic Veterinary Products",
    "Herbal Remedies for Poultry",
    "Quarantine and Flock Management"
  ]}
];


// Probabilities to simulate user behavior
const PROBABILITY_COURSE_COMPLETED = 0.6;
const PROBABILITY_COURSE_DROPPED = 0.1; // The rest will be 'active'
const PROBABILITY_SUBMIT_ASSIGNMENT = 0.85;
const PROBABILITY_ASSIGNMENT_IS_GRADED = 0.9;
const PROBABILITY_IS_LATE_SUBMISSION = 0.15;
const PROBABILITY_HAS_TEACHER_FEEDBACK = 0.8;

// =================================================================
// CURRICULUM & CONTENT DATA
// =================================================================

const AGRICULTURE_CATEGORIES = {
  level1: [
    {
      name: "Organic Agriculture",
      description: "Comprehensive training in organic farming practices, natural pest management, and sustainable agriculture methods aligned with Philippine Organic Agriculture Act (RA 10068)."
    },
    {
      name: "Crop Production",
      description: "Skills development in producing major crops of Mindanao including rice, corn, vegetables, and root crops using sustainable methods."
    },
    {
      name: "Sustainable Farming Systems",
      description: "Integrated farming systems combining crops, livestock, and aquaculture for resilient and sustainable livelihoods."
    }
  ],
  level2ByParent: {
    "Organic Agriculture": [
      { 
        name: "Organic Agriculture Production NC II", 
        description: "National Certificate Level II qualification covering organic vegetable production, organic fertilizer preparation, and natural pest control methods.",
        popularity: 0.9 // High enrollment
      },
      { 
        name: "Organic Livestock Production NC II", 
        description: "Training in raising chickens, pigs, and other livestock using organic and natural methods.",
        popularity: 0.6
      }
    ],
    "Crop Production": [
      { 
        name: "Agricultural Crops Production NC II", 
        description: "Competency-based training in crop production from land preparation to postharvest handling.",
        popularity: 0.8
      },
      { 
        name: "Rice Production NC II", 
        description: "Specialized training in lowland and upland rice cultivation for Mindanao conditions.",
        popularity: 0.7
      }
    ],
    "Sustainable Farming Systems": [
      { 
        name: "Integrated Farming Systems NC III", 
        description: "Advanced training in combining multiple farm enterprises for sustainability and profitability.",
        popularity: 0.5
      }
    ]
  },
  level3ByParent: {
    "Organic Agriculture Production NC II": [
      { name: "Organic Inputs Production", description: "Making organic fertilizers, compost, and botanical pesticides" },
      { name: "Organic Crop Production", description: "Growing vegetables and crops organically" },
      { name: "Organic Certification Process", description: "Requirements and procedures for organic certification" }
    ],
    "Agricultural Crops Production NC II": [
      { name: "Nursery Operations", description: "Seedling production and nursery management" },
      { name: "Crop Care and Maintenance", description: "Fertilization, irrigation, and pest management" },
      { name: "Harvest and Postharvest", description: "Proper harvesting and postharvest handling" }
    ],
    "Rice Production NC II": [
      { name: "Rice Land Preparation", description: "Field preparation for rice cultivation" },
      { name: "Rice Crop Management", description: "Managing rice from planting to harvest" }
    ],
    "Organic Livestock Production NC II": [
      { name: "Organic Poultry Production", description: "Raising chickens organically" },
      { name: "Organic Swine Production", description: "Raising pigs using natural methods" }
    ],
    "Integrated Farming Systems NC III": [
      { name: "Farm Planning and Design", description: "Planning integrated farm systems" },
      { name: "Enterprise Integration", description: "Combining crop, livestock, and aquaculture" }
    ]
  }
};

const AGRI_COURSES = {
  "Organic Agriculture Production NC II": [
    {
      title: "Introduction to Organic Agriculture",
      description: "This module covers the fundamentals of organic farming, Philippine organic standards (PNS), and the certification process under RA 10068.",
      content: `Learn the principles and benefits of organic agriculture in the Philippine context, understand the Philippine Organic Agriculture Act (RA 10068), study organic certification requirements, and explore market opportunities for organic products in Mindanao and beyond.`,
      difficulty: "beginner",
      estimatedHours: 8,
      isPrerequisite: true
    },
    {
      title: "Producing Organic Fertilizers",
      description: "Master the production of various organic fertilizers including compost, vermicompost, bokashi, and liquid organic fertilizers using locally available materials.",
      content: `Learn to produce high-quality organic fertilizers using materials available in Dumingag area. Master composting, vermicomposting with African night crawlers, bokashi fermentation, and liquid organic fertilizers (FPJ, FAA, LAB).`,
      difficulty: "intermediate",
      estimatedHours: 20,
      isPrerequisite: false
    },
    {
      title: "Formulating Organic Concoctions and Extracts",
      description: "Learn to prepare botanical pesticides and organic growth enhancers including IMO, FPJ, FAA, OHN, and various plant extracts for pest control.",
      content: `Prepare effective organic pest control solutions using local plants and materials. Learn to make Indigenous Microorganisms (IMO), Fermented Plant Juice (FPJ), Fish Amino Acid (FAA), Oriental Herbal Nutrient (OHN), neem extract, chili-garlic spray, and kakawate extract.`,
      difficulty: "intermediate",
      estimatedHours: 24,
      isPrerequisite: false
    },
    {
      title: "Producing Organic Vegetables",
      description: "Hands-on training in growing vegetables organically from seed production to harvest and postharvest handling.",
      content: `Apply organic farming principles in vegetable production. Focus on crops commonly grown in Dumingag: tomato, eggplant, ampalaya, sitaw, okra, kalabasa, mustasa, and pechay. Learn organic seedling production, soil preparation, pest management, and record-keeping for certification.`,
      difficulty: "intermediate",
      estimatedHours: 40,
      isPrerequisite: false
    },
    {
      title: "Raising Organic Chickens",
      description: "Comprehensive training in organic poultry production for both eggs and meat, following Philippine organic standards.",
      content: `Master organic chicken production including breed selection suitable for Mindanao climate, free-range housing design, organic feed formulation using local ingredients (corn, cassava, ipil-ipil), natural health management, and processing organic chicken products.`,
      difficulty: "intermediate",
      estimatedHours: 32,
      isPrerequisite: false
    }
  ],
  "Agricultural Crops Production NC II": [
    {
      title: "Introduction to Agricultural Crops Production",
      description: "Overview of crop production industry in Mindanao, career opportunities, workplace safety, and Good Agricultural Practices (GAP).",
      content: `Introduction to crop production sector in Zamboanga Peninsula and Mindanao. Learn about major crops, farming systems, GAP standards, farm safety, and occupational health requirements.`,
      difficulty: "beginner",
      estimatedHours: 6,
      isPrerequisite: true
    },
    {
      title: "Performing Nursery Operations",
      description: "Establish and maintain seedling nurseries for vegetables and other crops using both traditional and modern methods.",
      content: `Learn seedling production for common Mindanao crops. Master site selection, growing media preparation, seed treatment, sowing techniques, seedling care, hardening-off, and nursery record-keeping.`,
      difficulty: "beginner",
      estimatedHours: 16,
      isPrerequisite: false
    },
    {
      title: "Planting Crops",
      description: "Master land preparation, transplanting, and direct seeding methods for various agricultural crops.",
      content: `Learn proper crop establishment including soil preparation for different soil types in Dumingag, layout systems, transplanting procedures, direct seeding, and operation of farm tools and equipment.`,
      difficulty: "intermediate",
      estimatedHours: 20,
      isPrerequisite: false
    },
    {
      title: "Caring and Maintaining Crops",
      description: "Perform crop care activities including fertilization, irrigation, weeding, and integrated pest management.",
      content: `Develop skills in fertilizer application, irrigation management suitable for Mindanao rainfall patterns, weeding, mulching, staking, pruning, and IPM for common pests in the region.`,
      difficulty: "intermediate",
      estimatedHours: 28,
      isPrerequisite: false
    },
    {
      title: "Performing Harvest and Postharvest Operations",
      description: "Proper harvesting techniques and postharvest handling to minimize losses and maintain quality for market.",
      content: `Master harvest maturity determination, harvesting techniques for different crops, field handling, sorting and grading, packing for local and distant markets, and storage methods suitable for tropical climate.`,
      difficulty: "intermediate",
      estimatedHours: 24,
      isPrerequisite: false
    }
  ],
  "Rice Production NC II": [
    {
      title: "Introduction to Rice Production in Mindanao",
      description: "Overview of rice production systems, varieties suitable for Mindanao, and production calendar.",
      content: `Learn about lowland and upland rice systems in Mindanao. Study rice varieties suitable for local conditions, production calendar, and market opportunities.`,
      difficulty: "beginner",
      estimatedHours: 8,
      isPrerequisite: true
    },
    {
      title: "Rice Land Preparation and Planting",
      description: "Land preparation methods and planting techniques for rice production.",
      content: `Master land preparation for rice, water management, seedling production, transplanting, and direct seeding methods suitable for Mindanao conditions.`,
      difficulty: "intermediate",
      estimatedHours: 20,
      isPrerequisite: false
    },
    {
      title: "Rice Crop Management",
      description: "Managing rice crops from establishment to harvest including fertilization, irrigation, and pest control.",
      content: `Learn rice crop management including fertilizer application, water management, weed control, pest and disease management, and harvest timing for maximum yield and quality.`,
      difficulty: "intermediate",
      estimatedHours: 32,
      isPrerequisite: false
    }
  ]
};

const DETAILED_LESSON_CONTENT: Record<string, string> = {
  // Organic Fertilizers - Composting
  "Materials for Composting (Browns and Greens)": `# Materials for Composting (Browns and Greens)

## Introduction

Successful composting requires a proper balance of carbon-rich materials (browns) and nitrogen-rich materials (greens). In this lesson, you will learn to identify and collect these materials from your farm and community in Dumingag.

## Learning Objectives

After completing this lesson, you should be able to:
- Identify carbon-rich (brown) and nitrogen-rich (green) materials
- Understand the ideal C:N ratio for composting
- Source composting materials locally in Dumingag and nearby areas
- Calculate the right proportions for effective composting

---

## Brown Materials (Carbon-Rich)

**Brown materials** provide carbon and energy for microorganisms. They are usually dry and brown in color.

### Common Brown Materials in Dumingag:

| Material | C:N Ratio | Availability | Notes |
|----------|-----------|--------------|-------|
| Rice straw (dayami) | 80:1 | Very High | Abundant after rice harvest |
| Corn stalks and cobs | 60:1 | High | Available after corn harvest |
| Coconut coir/husk | 100:1 | Very High | Readily available |
| Dried leaves | 50:1 | High | Collect regularly |
| Sawdust (aserrín) | 500:1 | Medium | Use sparingly |
| Rice hull (ipa) | 120:1 | High | Good bulking agent |

> **Pro Tip**: Chop or shred brown materials into smaller pieces (5-10 cm) for faster decomposition.

---

## Green Materials (Nitrogen-Rich)

**Green materials** provide nitrogen for microbial growth and reproduction. They are usually fresh, moist, and green.

### Common Green Materials in Dumingag:

| Material | C:N Ratio | Availability | Notes |
|----------|-----------|--------------|-------|
| Fresh grass clippings | 20:1 | High | Mow regularly |
| Animal manure (chicken) | 10:1 | Medium | Very rich in nitrogen |
| Animal manure (cow/carabao) | 25:1 | Medium | Good moisture content |
| Vegetable scraps | 15:1 | High | From kitchen and farm |
| Banana stalks/leaves | 30:1 | Very High | Chop into small pieces |
| Kakawate leaves (Madre de Cacao) | 20:1 | High | Nitrogen-fixing tree |
| Ipil-ipil leaves | 20:1 | High | Common in the area |

> **Important**: Avoid using meat, bones, dairy, or oily foods as they attract pests and smell bad.

---

## The Ideal C:N Ratio

The **ideal Carbon to Nitrogen (C:N) ratio** for composting is **25:1 to 30:1**.

### Why is C:N Ratio Important?

- **Too much carbon** (high C:N ratio like 60:1): Slow decomposition, microbes starve
- **Too much nitrogen** (low C:N ratio like 10:1): Bad smell, ammonia loss, wet pile
- **Balanced ratio** (25-30:1): Fast decomposition, no smell, good compost

### Simple Mixing Formula

For farmers without laboratory testing, use this **simple volumetric ratio**:

\`\`\`
2 parts brown materials : 1 part green materials (by volume)
\`\`\`

### Example Recipe for Dumingag Farmers:

\`\`\`
For a 1 cubic meter compost pile:

Browns (2/3 of pile):
- 8 sacks rice straw (chopped)
- 6 sacks coconut husk (chopped)
- 4 sacks dried leaves

Greens (1/3 of pile):
- 4 sacks fresh grass
- 3 sacks vegetable scraps
- 2 sacks kakawate leaves
- 1 sack chicken manure
\`\`\`

---

## Collecting Materials in Dumingag

### Where to Source Materials:

1. **Your own farm**: Crop residues, weeds, kitchen scraps
2. **Neighbors' farms**: Rice straw after harvest, corn stalks
3. **Roadsides**: Grass clippings, fallen leaves
4. **Market**: Vegetable wastes from vendors
5. **Livestock farms**: Animal manure (with permission)
6. **Coconut plantations**: Coconut husks and coir

### Best Practices:

- ✅ Collect materials regularly and stockpile
- ✅ Keep browns and greens in separate piles
- ✅ Chop materials before composting
- ✅ Mix fresh and dry materials
- ✅ Avoid diseased plant materials

---

## Practical Activity

### Material Collection Exercise

**Task**: Survey your farm and community. Make an inventory of available composting materials.

**Create a table like this**:

| Material | Type | Estimated Amount | Season Available |
|----------|------|------------------|------------------|
| Rice straw | Brown | 20 sacks | After harvest (Oct-Nov) |
| Grass | Green | 10 sacks/month | Year-round |
| ... | ... | ... | ... |

---

## Common Problems and Solutions

### Problem 1: Not enough green materials

**Solution**: 
- Plant nitrogen-fixing trees (kakawate, ipil-ipil)
- Collect fresh weeds before flowering
- Partner with vegetable vendors for scraps

### Problem 2: Too much rice straw (browns)

**Solution**:
- Add chicken manure or urea to balance
- Use some straw as mulch instead
- Store for future batches

### Problem 3: Materials too coarse

**Solution**:
- Chop using bolo or machete
- Run over with vehicle if large quantity
- Use pedal-powered chopper if available

---

## Summary

- **Brown materials** = Carbon (dry, brown)
- **Green materials** = Nitrogen (fresh, green)
- **Ideal C:N ratio** = 25:1 to 30:1
- **Simple mixing** = 2 parts browns : 1 part greens
- **Local materials** are abundant in Dumingag!

In the next lesson, we will learn how to build the compost pile using these materials.

---

## Review Questions

1. What is the ideal C:N ratio for composting?
2. Name 3 brown materials available in Dumingag.
3. Name 3 green materials available in Dumingag.
4. Why should we chop materials before composting?
5. What problems occur if we have too much nitrogen?

---

**Remember**: "Basura ng isa, yaman ng iba!" (One person's waste is another's treasure!) All these "wastes" can become black gold for your organic farm. 🌱`,

  // IMO Collection
  "Collecting IMO-1 (Wild Microbes)": `# Collecting IMO-1 (Wild Microbes)

## Introduction

**Indigenous Microorganisms (IMO)** are beneficial microbes naturally present in your local environment. IMO-1 is the first step in collecting these wild microorganisms to boost soil health and crop growth.

Sa simpleng salita: Kolektahon nato ang mga buhing mikroorganismo gikan sa lasang o kabukiran! (We'll collect living microorganisms from the forest!)

## Learning Objectives

After this lesson, you will be able to:
- Identify the best locations for collecting IMO
- Prepare materials for IMO collection
- Properly collect and handle IMO-1
- Recognize successful IMO colonization
- Troubleshoot common problems

---

## What is IMO-1?

**IMO-1** is the **first generation** of Indigenous Microorganisms collected from natural environments.

### Why Collect IMO?

✅ Free source of beneficial microbes  
✅ Adapted to local conditions in Dumingag  
✅ Improves soil health and fertility  
✅ Boosts plant immunity  
✅ Reduces need for chemical fertilizers  
✅ Sustainable and organic  

> **Scientific Fact**: One gram of forest soil contains billions of beneficial microorganisms including bacteria, fungi, actinomycetes, and yeasts!

---

## Best Collection Sites in Dumingag

### Ideal Locations:

1. **Virgin Forest Areas** ⭐⭐⭐⭐⭐
   - Undisturbed forest with thick leaf litter
   - Shaded and moist
   - Rich, dark soil underneath
   - **Best in Dumingag**: Mountain forest areas, watershed zones

2. **Bamboo Groves** ⭐⭐⭐⭐⭐
   - Abundant beneficial fungi
   - High microbial diversity
   - Always moist
   - **Common in Dumingag**: Bamboo clumps in barangays

3. **Under Old Trees** ⭐⭐⭐⭐
   - Established microbial communities
   - Good for specific crops
   - **Examples**: Under mango, balete, dao trees

4. **Near Flowing Streams** ⭐⭐⭐
   - Moist environment
   - Good fungal diversity

### ❌ Avoid These Places:

- Recently burned areas
- Heavily eroded slopes
- Areas with chemical contamination
- Near garbage dumps
- Waterlogged areas

---

## Materials Needed

### For IMO Collection Box:

| Item | Quantity | Source |
|------|----------|--------|
| Wooden box with ventilation | 1 | Make from scrap wood |
| Cooked rice (kanin) | 3-5 cups | White rice, unsalted |
| Clean white paper | 2-3 sheets | Newspaper or brown paper |
| Rubber band or string | 1 | To secure paper |
| Breathable cloth | 1 piece | Old t-shirt or mosquito net |

### Optional:
- Bamboo basket (instead of wooden box)
- Banana leaves (for wrapping)

> **Tip**: **DO NOT use plastic containers!** Microbes need air to breathe.

---

## Step-by-Step Collection Process

### Step 1: Prepare the Rice (1 day before)

\`\`\`
1. Cook rice normally (3-5 cups)
2. Let it cool to room temperature
3. DO NOT add salt, oil, or any seasoning
4. Rice should be slightly firm, not mushy
5. Use within 24 hours of cooking
\`\`\`

### Step 2: Prepare the Collection Box

\`\`\`
1. Place cooked rice in wooden box
2. Spread rice evenly, about 3-5 cm thick
3. Cover with clean white paper
4. Secure paper with rubber band
5. Wrap entire box with breathable cloth
6. Cloth should allow air but prevent insects
\`\`\`

### Step 3: Choose Collection Site

**Best time**: Early morning (5-7 AM)

Look for these indicators of good sites:
- ✅ Thick layer of decomposing leaves (talupak)
- ✅ White fungal threads visible on soil
- ✅ Rich, earthy smell
- ✅ Cool and moist ground
- ✅ Shaded area

### Step 4: Place the IMO Box

\`\`\`
1. Gently remove 5-10 cm of top leaf litter
2. Place box directly on the soil surface
3. Cover box lightly with the removed leaf litter
4. Box should be protected from direct rain
5. Make sure location is safe from animals
6. Mark the location with a stick or ribbon
\`\`\`

**Collection Period**: **5-7 days** in Dumingag climate

---

## What Happens During Collection

### Day 1-2: Colonization Begins
- Microbes start migrating to the rice
- May not see visible changes yet

### Day 3-4: Active Growth
- White, gray, or greenish mold appears
- Sweet, fermented smell develops
- This is GOOD! These are beneficial fungi

### Day 5-7: Full Colonization
- Rice completely covered with colorful mold
- Colors: white, gray, green, yellow, orange
- Strong sweet, fruity aroma
- **This is perfect IMO-1!**

---

## Harvesting IMO-1

### When to Harvest:

**Perfect Timing Indicators**:
- ✅ Rice completely covered with mold
- ✅ Sweet, pleasant fermented smell
- ✅ Firm texture (not mushy)
- ✅ Colorful appearance

### ❌ Harvest immediately if you see:
- Black mold (may indicate contamination)
- Foul, rotten smell
- Excessive moisture/mushiness
- Insect infestation

### Harvesting Procedure:

\`\`\`
1. Visit collection site on day 5-7
2. Carefully unwrap the cloth
3. Remove paper covering
4. Observe the rice - it should be beautifully molded!
5. Gently transfer everything to a clean container
6. Bring home immediately
7. Process into IMO-2 within 24 hours
\`\`\`

---

## Identifying Successful IMO-1

### Good IMO-1 Characteristics:

| Feature | Description |
|---------|-------------|
| **Color** | White, gray, greenish, yellow, orange molds |
| **Smell** | Sweet, fruity, wine-like, pleasant |
| **Texture** | Firm, dry to slightly moist |
| **Coverage** | 80-100% of rice surface covered |
| **Type** | Fuzzy, cotton-like growth |

### Signs of Contamination:

| Problem | Cause | Solution |
|---------|-------|----------|
| Black mold | Bacterial contamination | Discard, try again |
| Rotten smell | Too wet, poor ventilation | Discard, improve ventilation |
| No growth after 10 days | Too dry, poor site | Move to better location |
| Insect infestation | Box not protected | Use finer cloth, elevate box |

---

## Tips for Success in Dumingag

### 🌧️ **Rainy Season** (June-November):
- Choose locations with natural roof (thick canopy)
- Use extra covering to prevent waterlogging
- May need only 4-5 days due to high humidity
- Check daily after day 3

### ☀️ **Dry Season** (December-May):
- Choose moister locations (near streams)
- Cover box with more leaf litter
- May need 6-8 days
- Avoid very hot days

### 🌪️ **Windy Conditions**:
- Secure box with stones
- Place in protected area
- Use heavier cloth covering

---

## Common Problems and Solutions

### Problem 1: No microbial growth after 7 days

**Possible Causes**:
- Rice too dry
- Poor collection site
- Rice too hot when placed
- Not enough moisture in air

**Solutions**:
- Try different location
- Ensure rice is room temperature
- Choose shadier, moister spot
- Add very light misting to rice before placing

### Problem 2: Too much water in box

**Causes**:
- Rain got inside
- Ground too wet
- Poor ventilation

**Solutions**:
- Improve covering
- Elevate box slightly (2-3 cm)
- Ensure cloth allows air flow

### Problem 3: Animals disturbed the box

**Solutions**:
- Elevate box off ground
- Use finer mesh
- Place in less accessible location
- Check after 2-3 days

---

## Safety and Handling

### Do's ✅

- Wash hands before and after handling
- Use gloves if you have sensitive skin
- Work in clean area
- Label your collection with date and location
- Store in cool, shaded place until processing

### Don'ts ❌

- Don't taste or eat IMO-1
- Don't collect near polluted areas
- Don't use plastic containers
- Don't add water at this stage
- Don't leave in direct sunlight

---

## Practical Activity

### IMO-1 Collection Project

**Your Task**: Collect IMO-1 from 3 different sites in your area.

**Record the following**:

1. **Site Description**
   - Location (GPS if available)
   - Type of environment
   - Dominant plants
   - Soil characteristics

2. **Collection Details**
   - Date placed: ___________
   - Date harvested: ___________
   - Number of days: ___________
   - Weather conditions: ___________

3. **Results**
   - Colors observed: ___________
   - Smell description: ___________
   - Coverage percentage: ___________
   - Success rating (1-5): ___________

4. **Photos**
   - Take photos on Day 1, Day 3, Day 5, Day 7
   - Photo of collection site
   - Photo of harvested IMO-1

---

## Next Steps

Once you successfully collect IMO-1, you will proceed to **IMO-2** where you will:
- Mix IMO-1 with brown sugar
- Preserve the microorganisms
- Multiply their population
- Prepare for application

**Remember**: IMO-1 is LIVE! Process it into IMO-2 within 24 hours of harvesting.

---

## Summary

✅ IMO-1 = Wild microorganisms collected from nature  
✅ Best sites: virgin forest, bamboo groves, under old trees  
✅ Use cooked rice in ventilated wooden box  
✅ Place on forest floor for 5-7 days  
✅ Harvest when fully colonized with colorful mold  
✅ Sweet smell = good, rotten smell = bad  
✅ Process into IMO-2 within 24 hours  

---

## Review Questions

1. What does IMO stand for?
2. Why do we collect IMO from the forest and not from farm soil?
3. What type of rice should we use for IMO collection?
4. How many days does it take to collect IMO-1 in Dumingag?
5. What are the signs of successful IMO-1 colonization?
6. What should you do if the rice smells rotten?
7. Why don't we use plastic containers?

---

## Local Wisdom

*"Ang yaman sa yuta, libre lang nato!" (The riches in the soil are free for us!)*

Our ancestors knew that the forest provides everything we need. These microorganisms have been in Dumingag for thousands of years, perfectly adapted to our soil, climate, and crops. By collecting and using them, we're working WITH nature, not against it.

**Happy collecting! Padayon! (Keep going!)** 🌿🍄

---

*Next lesson: Preparing IMO-2 (Adding Sugar)*`,
};

// =================================================================
// REALISTIC HELPER FUNCTIONS
// =================================================================

/**
 * Generates a more realistic, normally-distributed score.
 * @param competency A value between 0.4 (low) and 1.0 (high) representing student skill.
 * @returns A score, typically clustering around the mean (84).
 */
const generateRealisticScore = (competency: number): number => {
  const baseScore = 65 + (Math.random() + Math.random()) * 20;
  const finalScore = baseScore * (0.8 + competency * 0.4);
  return Math.max(50, Math.min(100, Math.round(finalScore)));
};

/**
 * Generates enhanced, contextual lesson content with realistic markdown.
 */
function generateEnhancedLessonContent(
  lessonTitle: string, 
  moduleTitle: string, 
  courseTitle: string,
  difficulty: string = "intermediate"
): string {
  if (DETAILED_LESSON_CONTENT[lessonTitle]) {
    return DETAILED_LESSON_CONTENT[lessonTitle];
  }

  const localCrop = faker.helpers.arrayElement([
    ...LOCAL_CROPS.vegetables,
    ...LOCAL_CROPS.mainCrops,
    ...LOCAL_CROPS.fruits
  ]);

  const difficultyInfo = {
    beginner: { time: "1-2 hours", level: "Basic", icon: "🌱" },
    intermediate: { time: "2-4 hours", level: "Intermediate", icon: "🌿" },
    advanced: { time: "4-6 hours", level: "Advanced", icon: "🌳" }
  };

  const info = difficultyInfo[difficulty as keyof typeof difficultyInfo] || difficultyInfo.intermediate;

  return `# ${lessonTitle}

> **Course**: ${courseTitle}  
> **Module**: ${moduleTitle}  
> **Difficulty**: ${info.icon} ${info.level}  
> **Estimated Time**: ${info.time}

---

## Introduction

Welcome to this lesson on **${lessonTitle}**. This is an essential competency in ${moduleTitle.toLowerCase()} for farmers in Dumingag and throughout Mindanao.

Kini nga leksyon importante kaayo para sa atong sustainable agriculture practices. (This lesson is very important for our sustainable agriculture practices.)

---

## Learning Objectives

After completing this lesson, you should be able to:

- ✅ Understand the principles and importance of ${lessonTitle.toLowerCase()}
- ✅ Demonstrate proper procedures and techniques
- ✅ Apply knowledge to local crops such as ${localCrop}
- ✅ Follow safety standards and quality requirements
- ✅ Perform the competency with minimal supervision

---

## Overview

${lessonTitle} is a critical skill in agricultural production, especially for farmers in Zamboanga del Sur. Following proper procedures ensures quality results, safety, and efficiency in your work.

### Why This Matters in Dumingag

The techniques you'll learn here are specifically adapted for:
- 🌧️ Mindanao climate conditions (wet and dry seasons)
- 🌾 Local crops commonly grown in the area
- 👨‍🌾 Small to medium-scale farming operations
- 🌱 Organic and sustainable farming practices
- 📊 Market requirements for local and regional buyers

---

## Key Concepts

### 1. Understanding the Basics

${lessonTitle} involves several important steps that must be performed in the correct order. Each step contributes to the overall success of the operation.

**Important terms** (Bisaya translation in parentheses):
- Quality standards (mga sukod sa kalidad)
- Safety procedures (mga paagi sa seguridad)  
- Best practices (labing maayong pamaagi)
- Documentation (pagrekord)

### 2. Local Context

In Dumingag, farmers typically apply these techniques to crops such as:

| Crop | Season | Special Considerations |
|------|--------|----------------------|
| ${LOCAL_CROPS.vegetables[0]} | Year-round | High market demand |
| ${LOCAL_CROPS.vegetables[1]} | Dry season | Requires good drainage |
| ${LOCAL_CROPS.mainCrops[0]} | Wet season | Water management critical |
| ${LOCAL_CROPS.mainCrops[1]} | Year-round | Suitable for upland areas |

### 3. Quality Standards

All procedures must meet **Good Agricultural Practices (GAP)** standards:

- ✅ Proper timing and scheduling
- ✅ Correct measurements and ratios
- ✅ Safety and sanitation
- ✅ Documentation and record-keeping
- ✅ Environmental protection

> **Remember**: For organic certification, you must follow Philippine National Standards (PNS) for organic agriculture and maintain proper records!

---

## Step-by-Step Procedures

### Preparation Phase

Before starting any agricultural operation:

1. **Gather Materials and Tools**
   - List all required items
   - Check condition and cleanliness
   - Prepare workspace

2. **Check Weather and Conditions**
   - Avoid working during heavy rain
   - Consider temperature and humidity
   - Plan around your work schedule

3. **Review Safety Procedures**
   - Wear appropriate PPE
   - Have first aid kit nearby
   - Know emergency procedures

### Implementation Phase

\`\`\`
Step 1: [First major step]
→ Check prerequisites
→ Perform the action
→ Verify quality

Step 2: [Second major step]
→ Follow proper technique
→ Maintain safety standards
→ Document progress

Step 3: [Final steps]
→ Complete the procedure
→ Clean up workspace
→ Record results
\`\`\`

### Post-Operation

- 🔍 Inspect results for quality
- 📝 Complete required documentation
- 🧹 Clean and maintain tools
- 📊 Record observations for future reference

---

## Common Challenges in Dumingag

### Challenge 1: Weather Variability

**Problem**: Sudden rain or extended dry periods

**Solutions**:
- Monitor weather forecasts
- Have contingency plans
- Adjust timing of operations
- Use protective structures when needed

### Challenge 2: Resource Availability

**Problem**: Limited access to certain materials

**Solutions**:
- Use locally available alternatives
- Plan and stockpile materials in advance
- Cooperate with other farmers for bulk buying
- Improvise with indigenous materials

### Challenge 3: Market Requirements

**Problem**: Meeting quality standards for buyers

**Solutions**:
- Follow GAP guidelines strictly
- Maintain detailed records
- Implement quality control checks
- Get training on market standards

---

## Safety Considerations

### Personal Protective Equipment (PPE)

Always use appropriate PPE for agricultural work:

| Activity | Required PPE |
|----------|--------------|
| General farm work | Hat, boots, long sleeves |
| Handling organic fertilizers | Gloves, mask |
| Using tools | Gloves, safety shoes |
| Pesticide application | Full protective suit, mask, gloves |

### Emergency Procedures

**In case of injury**:
1. Stop work immediately
2. Administer first aid
3. Seek medical attention if needed
4. Report incident to supervisor
5. Document the incident

**Emergency Contacts**:
- Dumingag Rural Health Unit: [Contact number]
- DISOA Clinic: [Contact number]
- Barangay Health Worker: [Contact number]

---

## Practical Application

### Field Exercise

Practice ${lessonTitle.toLowerCase()} with these crops commonly grown in Dumingag:

**Option A: ${localCrop}**
- Follow the procedures learned
- Document your observations
- Note any challenges encountered

**Option B: Choose your own crop**
- Apply the same principles
- Adapt techniques as needed
- Compare results with classmates

### Assessment Criteria

You will be evaluated on:
- ✅ Correct sequence of procedures (30%)
- ✅ Safety compliance (25%)
- ✅ Quality of results (25%)
- ✅ Efficiency and time management (10%)
- ✅ Proper documentation (10%)

---

## Record Keeping

Maintain a **farm activity log** for every operation:

\`\`\`
Date: ______________
Activity: ${lessonTitle}
Crop: ______________
Area/Plot: ______________

Materials used:
- ___________________________
- ___________________________

Procedure followed:
1. _________________________
2. _________________________
3. _________________________

Observations:
_____________________________
_____________________________

Problems encountered:
_____________________________

Solutions applied:
_____________________________

Weather: ___________________
Time spent: ________________
Signature: _________________
\`\`\`

> **For organic certification**: These records are REQUIRED! Keep them for at least 3 years.

---

## Resources and Support

### Where to Get Help

1. **DISOA Faculty and Staff**
   - Schedule consultation hours
   - Request farm visits
   - Join farmer discussion groups

2. **DA-Zamboanga Peninsula**
   - Extension services
   - Technical assistance
   - Training programs

3. **Fellow Farmers**
   - Farmers' associations
   - Cooperative members
   - Community learning groups

4. **Online Resources**
   - TESDA elearning platform
   - DA-ATI Knowledge resources
   - DISOA learning portal

---

## Summary

Key takeaways from this lesson:

✅ ${lessonTitle} is essential for successful ${moduleTitle.toLowerCase()}  
✅ Follow procedures step-by-step for best results  
✅ Adapt techniques to local conditions in Dumingag  
✅ Maintain safety standards at all times  
✅ Keep detailed records for certification and improvement  
✅ Seek help when needed from DISOA and fellow farmers  

---

## Review Questions

Test your understanding:

1. What are the main steps in ${lessonTitle.toLowerCase()}?
2. Why is it important to follow proper procedures?
3. What safety equipment is required for this activity?
4. How do weather conditions affect this operation?
5. What records should you maintain?
6. What are the quality standards to follow?
7. Where can you get help if you encounter problems?

---

## Next Steps

Continue your learning journey:

1. **Practice** the procedures learned
2. **Complete** the practical assignment
3. **Review** the step-by-step guides provided
4. **Watch** demonstration videos (if available)
5. **Prepare** for the competency assessment

---

## Local Wisdom

*"Ang kabukiran, dili lang negosyo - kini atong kinabuhi ug kaugmaon."*  
*(The farm is not just business - it's our life and future.)*

The techniques you're learning today build on generations of farming wisdom in Mindanao, enhanced with modern sustainable practices. Every skill you master brings you closer to becoming a successful organic farmer!

**Padayon mga kauban! Kaya nato ni!** (Keep going, companions! We can do this!) 💪🌾

---

*Module: ${moduleTitle}*  
*DISOA - Dumingag Institute of Sustainable Organic Agriculture*  
*Para sa sustainableng agrikultura ng Mindanao*
`;
}

// =================================================================
// MAIN MOCK DATA GENERATOR
// =================================================================

export const createFake = internalMutation({
  args: {
    seed: v.optional(v.number()),
    adminId: v.optional(v.string()),
    facultyId: v.optional(v.string()),
    learnerId: v.optional(v.string()),
    
    quizzesPerCourse: v.optional(v.number()),
    questionsPerQuiz: v.optional(v.number()),
    assignmentsPerCourse: v.optional(v.number()),
    guidesPerLesson: v.optional(v.number()),
  },
  returns: v.object({
    categories: v.object({ level1: v.number(), level2: v.number(), level3: v.number() }),
    courses: v.number(),
    modules: v.number(),
    lessons: v.number(),
    guides: v.number(),
    guideSteps: v.number(),
    quizzes: v.number(),
    quizQuestions: v.number(),
    assignments: v.number(),
    enrollments: v.number(),
    lessonProgress: v.number(),
    guideProgress: v.number(),
    quizAttempts: v.number(),
    assignmentSubmissions: v.number(),
    announcements: v.number(),
    feedback: v.number(),
    coursePerformance: v.number(),
  }),
  handler: async (ctx, args) => {
    const seed = args.seed ?? Date.now();
    faker.seed(seed);

    const ADMIN_ID = args.adminId ?? DEFAULT_ADMIN_ID;
    const FACULTY_ID = args.facultyId ?? DEFAULT_FACULTY_ID;
    const LEARNER_ID = args.learnerId ?? DEFAULT_LEARNER_ID;

    const quizzesPerCourse = args.quizzesPerCourse ?? 2;
    const questionsPerQuiz = args.questionsPerQuiz ?? 8;
    const assignmentsPerCourse = args.assignmentsPerCourse ?? 2;
    const guidesPerLesson = args.guidesPerLesson ?? 1;

    // --- Counters ---
    let level1 = 0, level2 = 0, level3 = 0;
    let coursesCt = 0, modulesCt = 0, lessonsCt = 0;
    let guidesCt = 0, guideStepsCt = 0;
    let quizzesCt = 0, quizQuestionsCt = 0;
    let assignmentsCt = 0;
    let enrollmentsCt = 0;
    let lessonProgressCt = 0, guideProgressCt = 0;
    let quizAttemptsCt = 0, assignmentSubsCt = 0;
    let announcementsCt = 0, feedbackCt = 0;
    let coursePerfCt = 0;

    const now = () => Date.now();
    
    // Realistic timestamp helpers
    const daysAgo = (days: number) => now() - (days * 86400000) - faker.number.int({ min: 0, max: 86400000 });
    const monthsAgo = (months: number) => daysAgo(months * 30);

    // --- Data Stores ---
    const catL1Map = new Map<string, Id<"categories">>();
    const catL2Map = new Map<string, { id: Id<"categories">, popularity: number }>();
    const courseIds: Id<"courses">[] = [];
    const courseIdsByTitle = new Map<string, { id: Id<"courses">, difficulty: string, estimatedHours: number }>();
    const lessonIdsByCourse = new Map<Id<"courses">, Id<"lessons">[]>();
    const moduleIdsByCourse = new Map<Id<"courses">, Id<"modules">[]>();
    const quizIdsByCourse = new Map<Id<"courses">, Id<"quizzes">[]>();
    const assignmentIdsByCourse = new Map<Id<"courses">, Id<"assignments">[]>();
    const guideByLesson = new Map<Id<"lessons">, Id<"lessonAttachments">[]>();

    // =================================================================
    // 1. CREATE STATIC STRUCTURE (Categories, Courses, Modules, Lessons)
    // =================================================================

    // Level 1 Categories
    for (const l1Data of AGRICULTURE_CATEGORIES.level1) {
      const id = await ctx.db.insert("categories", {
        name: l1Data.name,
        description: l1Data.description,
        parentId: undefined,
        level: 1,
        order: level1,
        createdAt: monthsAgo(12),
      });
      catL1Map.set(l1Data.name, id);
      level1++;
    }

    // Level 2 Categories
    for (const [parentName, l2Array] of Object.entries(AGRICULTURE_CATEGORIES.level2ByParent)) {
      const parentId = catL1Map.get(parentName);
      if (!parentId) continue;
      for (let i = 0; i < l2Array.length; i++) {
        const l2Data = l2Array[i];
        const id = await ctx.db.insert("categories", {
          name: l2Data.name,
          description: l2Data.description,
          parentId,
          level: 2,
          order: i,
          createdAt: monthsAgo(10),
        });
        catL2Map.set(l2Data.name, { id, popularity: l2Data.popularity || 0.5 });
        level2++;
      }
    }

    // Level 3 Categories
    for (const [parentName, l3Array] of Object.entries(AGRICULTURE_CATEGORIES.level3ByParent)) {
      const parentData = catL2Map.get(parentName);
      if (!parentData) continue;
      for (let i = 0; i < l3Array.length; i++) {
        const l3Data = l3Array[i];
        await ctx.db.insert("categories", {
          name: l3Data.name,
          description: l3Data.description,
          parentId: parentData.id,
          level: 3,
          order: i,
          createdAt: monthsAgo(9),
        });
        level3++;
      }
    }

    // Courses
    for (const [qualificationName, coursesArray] of Object.entries(AGRI_COURSES)) {
      const categoryData = catL2Map.get(qualificationName);
      if (!categoryData) continue;
      for (let idx = 0; idx < coursesArray.length; idx++) {
        const courseData = coursesArray[idx];
        const creationDate = monthsAgo(6 - idx);
        
        const courseId = await ctx.db.insert("courses", {
          title: courseData.title,
          description: courseData.description,
          content: courseData.content,
          categoryId: categoryData.id,
          teacherId: FACULTY_ID,
          coverImageId: undefined,
          status: "published",
          enrollmentCode: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
          isEnrollmentOpen: true,
          gradingConfig: { passingScore: 75, gradingMethod: "numerical" },
          createdAt: creationDate,
          updatedAt: creationDate,
          createdBy: ADMIN_ID,
        });
        
        courseIds.push(courseId);
        courseIdsByTitle.set(courseData.title, {
          id: courseId,
          difficulty: courseData.difficulty || "intermediate",
          estimatedHours: courseData.estimatedHours || 20
        });
        coursesCt++;

        await ctx.db.insert("announcements", {
          courseId,
          authorId: FACULTY_ID,
          title: `Maayong pag-abot sa ${courseData.title}`,
          content: `Welcome to ${courseData.title}! This competency-based training will help you master important skills in ${qualificationName}. Maintain at least 75% in all assessments. Para sa organic agriculture ng Dumingag! 🌱`,
          isPinned: true,
          createdAt: creationDate,
          updatedAt: creationDate,
        });
        announcementsCt++;
      }
    }

    // Global Announcement
    await ctx.db.insert("announcements", {
      courseId: undefined,
      authorId: ADMIN_ID,
      title: `Maayo nga pag-abot sa ${INSTITUTE_INFO.name}!`,
      content: `Welcome to DISOA's e-learning platform! We offer TESDA-accredited training in organic agriculture and sustainable farming. Join our community of farmers and agricultural practitioners in Mindanao. ${INSTITUTE_INFO.tagline}`,
      isPinned: true,
      createdAt: monthsAgo(12),
      updatedAt: monthsAgo(12),
    });
    announcementsCt++;

    // Modules, Lessons, Guides, Quizzes, Assignments (Structure Creation)
    const AGRI_MODULES_BY_COURSE_TYPED: Record<string, { title: string; description: string }[]> = AGRI_MODULES_BY_COURSE;
    for (const [courseTitle, courseData] of courseIdsByTitle.entries()) {
      const modulesData = AGRI_MODULES_BY_COURSE_TYPED[courseTitle];
      if (!modulesData) continue;

      const modules: Id<"modules">[] = [];
      const allLessons: Id<"lessons">[] = [];
      const quizzes: Id<"quizzes">[] = [];
      const assignments: Id<"assignments">[] = [];

      for (let m = 0; m < modulesData.length; m++) {
        const modData = modulesData[m];
        const moduleCreated = monthsAgo(5 - m);
        
        const moduleId = await ctx.db.insert("modules", {
          courseId: courseData.id,
          title: modData.title,
          description: modData.description,
          content: `# ${modData.title}\n\n${modData.description}\n\nThis module contains practical lessons designed to develop your competency. Study each lesson carefully.`,
          order: m,
          status: "approved",
          createdAt: moduleCreated,
          updatedAt: moduleCreated,
          createdBy: FACULTY_ID,
        });
        modules.push(moduleId);
        modulesCt++;

        const lessonTemplate = AGRI_LESSON_TEMPLATES.find(t => t.module === modData.title);
        const lessonTitles = lessonTemplate?.lessons || ["Introduction", "Procedures", "Practice Activity"];

        for (let l = 0; l < lessonTitles.length; l++) {
          const lessonTitle = lessonTitles[l];
          const lessonCreated = monthsAgo(5 - m) + (l * 86400000);
          
          const lessonId = await ctx.db.insert("lessons", {
            moduleId,
            title: lessonTitle,
            description: `Learn about ${lessonTitle.toLowerCase()} with step-by-step instructions adapted for Dumingag farmers.`,
            content: generateEnhancedLessonContent(lessonTitle, modData.title, courseTitle, courseData.difficulty),
            order: l,
            status: "approved",
            createdAt: lessonCreated,
            updatedAt: lessonCreated,
            createdBy: FACULTY_ID,
          });
          allLessons.push(lessonId);
          lessonsCt++;

          const guides: Id<"lessonAttachments">[] = [];
          if (faker.datatype.boolean({ probability: 0.7 })) {
            for (let g = 0; g < guidesPerLesson; g++) {
              const guideId = await ctx.db.insert("lessonAttachments", {
                type: "guide",
                lessonId,
                order: g,
                title: faker.helpers.arrayElement(["Step-by-Step Procedure", "Practical Field Guide"]),
                description: "Follow this guide to practice the competency in your farm.",
                introduction: "This guide will walk you through the practical application. Prepare your materials before beginning.",
                conclusion: "Maayo! (Good!) Practice these steps until you can perform them confidently. Remember: Safety first, quality always!",
              } as any);
              guides.push(guideId);
              guidesCt++;

              const numSteps = faker.number.int({ min: 3, max: 10 });
              for (let s = 1; s <= numSteps; s++) {
                await ctx.db.insert("guideSteps", {
                  guideId,
                  stepNumber: s,
                  title: `Step ${s}: ${faker.lorem.words(3)}`,
                  content: `${faker.lorem.sentence()}`,
                  imageId: undefined,
                  createdAt: daysAgo(30),
                });
                guideStepsCt++;
              }
            }
          }
          if (guides.length > 0) {
            guideByLesson.set(lessonId, guides);
          }
        }
      }
      moduleIdsByCourse.set(courseData.id, modules);
      lessonIdsByCourse.set(courseData.id, allLessons);

      const REALISTIC_QUIZ_QUESTIONS = [
        { question: "What does GAP stand for?", options: ["Good Agricultural Practices", "General Agriculture Program", "Graded Agriculture Product", "Growing and Planting"], correct: 0, explanation: "GAP ensures food safety, environmental protection, and worker welfare." },
        { question: "Which agency oversees TESDA training?", options: ["CHED", "DepEd", "TESDA", "DA"], correct: 2, explanation: "TESDA is the Technical Education and Skills Development Authority." },
        { question: "Philippine law for organic agriculture?", options: ["RA 8435", "RA 10068", "RA 7607", "RA 9003"], correct: 1, explanation: "RA 10068 is the Organic Agriculture Act of 2010." },
        { question: "Ideal C:N ratio for composting?", options: ["10:1", "30:1", "50:1", "100:1"], correct: 1, explanation: "25:1 to 30:1 is ideal for composting." },
        { question: "What does IMO stand for?", options: ["Improved Manure Operation", "Indigenous Microorganisms", "Integrated Mulch Organic", "International Market Org"], correct: 1, explanation: "IMO are beneficial local microorganisms." },
        { question: "Major crop in Dumingag?", options: ["Wheat", "Rice", "Barley", "Oats"], correct: 1, explanation: "Rice (palay) is a staple crop in Dumingag." },
        { question: "Best time to transplant seedlings?", options: ["Early morning", "Noon", "Late afternoon", "Midnight"], correct: 2, explanation: "Late afternoon reduces water stress." },
        { question: "Recommended rice spacing?", options: ["10x10 cm", "20x20 cm", "30x30 cm", "40x40 cm"], correct: 1, explanation: "20x20 cm is standard for rice." },
      ];

      for (let q = 0; q < quizzesPerCourse; q++) {
        const quizId = await ctx.db.insert("quizzes", {
          courseId: courseData.id,
          title: faker.helpers.arrayElement(["Pre-Assessment", "Module Quiz", "Final Assessment"]),
          description: "Test your understanding of the concepts.",
          instructions: "Read each question carefully. You need 75% to pass.",
          linkedToModuleId: faker.helpers.arrayElement(modules),
          allowMultipleAttempts: true, maxAttempts: 3, timeLimitMinutes: 30,
          gradingMethod: "highest", passingScore: 75, status: "published",
          createdAt: daysAgo(20), updatedAt: daysAgo(20), createdBy: FACULTY_ID,
          showCorrectAnswers: true, shuffleQuestions: true,
        });
        quizzes.push(quizId);
        quizzesCt++;

        const selectedQuestions = faker.helpers.arrayElements(REALISTIC_QUIZ_QUESTIONS, questionsPerQuiz);
        for (let i = 0; i < selectedQuestions.length; i++) {
          const qData = selectedQuestions[i];
          await ctx.db.insert("quizQuestions", {
            quizId, order: i + 1, type: "multiple-choice",
            questionText: qData.question, options: qData.options, correctIndex: qData.correct,
            points: 1, explanation: qData.explanation,
          });
          quizQuestionsCt++;
        }
      }
      quizIdsByCourse.set(courseData.id, quizzes);

      const REALISTIC_ASSIGNMENTS = [
        { title: "Farm Safety Plan", description: "Create a safety plan for your farm", instructions: "Include hazards, PPE, and emergency procedures." },
        { title: "Composting Project Documentation", description: "Document your composting process", instructions: "Record materials, C:N ratio, temperature, and final product." },
        { title: "Crop Production Plan", description: "Develop a production plan for one crop", instructions: "Include land prep, planting calendar, and budget." },
        { title: "Market Survey Report", description: "Survey organic products in local markets", instructions: "Visit 3 markets. Record products, prices, and demand." },
        { title: "IMO Collection Report", description: "Collect and document IMO-1", instructions: "Collect from 3 sites. Document with photos." },
      ];

      const numAssignments = faker.number.int({ min: assignmentsPerCourse - 1, max: assignmentsPerCourse });
      const selectedAssignments = faker.helpers.arrayElements(REALISTIC_ASSIGNMENTS, Math.min(numAssignments, REALISTIC_ASSIGNMENTS.length));

      for (let a = 0; a < selectedAssignments.length; a++) {
        const topic = selectedAssignments[a];
        const assignmentId = await ctx.db.insert("assignments", {
          courseId: courseData.id,
          title: topic.title,
          description: topic.description,
          instructions: topic.instructions + "\n\nSubmit as PDF or Word document.",
          linkedToModuleId: faker.helpers.arrayElement(modules),
          submissionType: "file",
          allowedFileTypes: ["application/pdf", "application/msword", "image/jpeg"],
          maxFileSize: 10 * 1024 * 1024,
          allowMultipleAttempts: true, maxAttempts: 2,
          dueDate: now() + (faker.number.int({ min: 7, max: 21 }) * 86400000),
          allowLateSubmissions: true, lateSubmissionPenalty: 10, maxPoints: 100,
          status: "published",
          createdAt: daysAgo(25), updatedAt: daysAgo(25), createdBy: FACULTY_ID,
        });
        assignments.push(assignmentId);
        assignmentsCt++;
      }
      assignmentIdsByCourse.set(courseData.id, assignments);
    }

    // =================================================================
    // 2. SIMULATE LEARNER PROGRESS
    // =================================================================

    for (const courseId of courseIds) {
      const courseDoc = await ctx.db.get(courseId);
      if (!courseDoc) continue;

      const enrolledAt = daysAgo(faker.number.int({ min: 30, max: 60 }));
      
      const rand = Math.random();
      let enrollmentStatus: "active" | "completed" | "dropped" = "active";
      if (rand < PROBABILITY_COURSE_COMPLETED) {
        enrollmentStatus = "completed";
      } else if (rand < PROBABILITY_COURSE_COMPLETED + PROBABILITY_COURSE_DROPPED) {
        enrollmentStatus = "dropped";
      }
      
      const completedAt = enrollmentStatus === "completed" ? daysAgo(faker.number.int({ min: 1, max: 29 })) : undefined;

      await ctx.db.insert("enrollments", {
        userId: LEARNER_ID, courseId,
        status: enrollmentStatus,
        enrolledAt, completedAt,
      });
      enrollmentsCt++;

      const lessons = lessonIdsByCourse.get(courseId) ?? [];
      const quizzes = quizIdsByCourse.get(courseId) ?? [];
      const assignments = assignmentIdsByCourse.get(courseId) ?? [];
      
      const learnerCompetency = faker.number.float({ min: 0.5, max: 1.0 });

      // --- Lesson Progress ---
      let lessonsCompletedCount = 0;
      for (const lessonId of lessons) {
        let completed = false;
        if (enrollmentStatus === 'completed') {
            completed = true;
        } else if (enrollmentStatus === 'active') {
            completed = faker.datatype.boolean({ probability: learnerCompetency * 0.8 });
        } else {
            completed = faker.datatype.boolean({ probability: 0.2 });
        }
        if (completed) lessonsCompletedCount++;

        const lastViewedAt = faker.date.between({ from: enrolledAt, to: Date.now() }).getTime();
        await ctx.db.insert("lessonProgress", {
          userId: LEARNER_ID, lessonId, completed,
          completedAt: completed ? faker.date.between({ from: enrolledAt, to: completedAt ?? lastViewedAt }).getTime() : undefined,
          lastViewedAt,
        });
        lessonProgressCt++;

        // Guide Progress
        const guides = guideByLesson.get(lessonId) ?? [];
        for (const guideId of guides) {
          const totalSteps = faker.number.int({ min: 4, max: 10 });
          const completedCount = completed ? totalSteps : faker.number.int({ min: 0, max: Math.floor(totalSteps * learnerCompetency) });
          const completedStepsArr = Array.from({ length: completedCount }, (_, i) => i + 1);
          const isComplete = completedCount === totalSteps;

          await ctx.db.insert("guideProgress", {
            userId: LEARNER_ID, guideId,
            completedSteps: completedStepsArr, totalSteps,
            lastViewedStep: completedStepsArr[completedStepsArr.length - 1] ?? 1,
            completed: isComplete,
            completedAt: isComplete ? faker.date.between({ from: enrolledAt, to: Date.now() }).getTime() : undefined,
          });
          guideProgressCt++;
        }
      }
      
      // --- Quiz Attempts ---
      let totalQuizScore = 0;
      let completedQuizzes = 0;
      for (const quizId of quizzes) {
        if (Math.random() > (learnerCompetency * 0.9)) continue;

        const score = generateRealisticScore(learnerCompetency);
        const percentage = Math.round(score / questionsPerQuiz * 10); // Simple percentage
        totalQuizScore += percentage;
        completedQuizzes++;
        
        const startedAt = faker.date.between({ from: enrolledAt, to: Date.now() }).getTime();
        await ctx.db.insert("quizAttempts", {
          userId: LEARNER_ID, quizId,
          attemptNumber: 1,
          answers: [],
          score: Math.round(score / 10), maxScore: questionsPerQuiz,
          percentage: percentage,
          passed: percentage >= 75,
          startedAt,
          submittedAt: faker.date.soon({ days: 1, refDate: startedAt }).getTime(),
          timeSpentSeconds: faker.number.int({ min: 300, max: 1500 }),
        });
        quizAttemptsCt++;
      }
      const averageQuizScore = completedQuizzes > 0 ? totalQuizScore / completedQuizzes : 0;

      // --- Assignment Submissions ---
      let totalAssignmentScore = 0;
      let completedAssignments = 0;
      for (const assignmentId of assignments) {
        if (!faker.datatype.boolean({ probability: PROBABILITY_SUBMIT_ASSIGNMENT })) continue;

        const submittedAt = faker.date.between({ from: enrolledAt, to: Date.now() }).getTime();
        const isGraded = faker.datatype.boolean({ probability: PROBABILITY_ASSIGNMENT_IS_GRADED });
        const grade = isGraded ? generateRealisticScore(learnerCompetency) : undefined;
        
        if (isGraded && grade) {
          totalAssignmentScore += grade;
          completedAssignments++;
        }

        await ctx.db.insert("assignmentSubmissions", {
          userId: LEARNER_ID, assignmentId,
          attemptNumber: 1,
          submissionType: "text",
          textContent: `Submission for assignment. ${faker.lorem.paragraphs(2)}`,
          status: isGraded ? "graded" : "submitted",
          submittedAt,
          grade,
          teacherFeedback: isGraded && faker.datatype.boolean({ probability: PROBABILITY_HAS_TEACHER_FEEDBACK })
            ? faker.helpers.arrayElement(["Excellent work!", "Good submission, please review safety procedures.", "Well done!"])
            : undefined,
          gradedAt: isGraded ? faker.date.soon({ days: 14, refDate: submittedAt }).getTime() : undefined,
          gradedBy: isGraded ? FACULTY_ID : undefined,
          isLate: faker.datatype.boolean({ probability: PROBABILITY_IS_LATE_SUBMISSION }),
          createdAt: submittedAt,
        });
        assignmentSubsCt++;
      }
      const averageAssignmentScore = completedAssignments > 0 ? totalAssignmentScore / completedAssignments : 0;

      // --- Learner Feedback ---
      const realisticFeedback = [
        "Pwede ba magdugang ug Binisaya nga translation? (Can we add Bisaya translation?)",
        "Request for downloadable materials - hinay ang internet. (Internet is slow)",
        "More videos please, especially for composting.",
        "Can we have a field trip to a successful organic farm in Dumingag?",
        "Suggest adding more examples using local crops like cassava.",
      ];
      if (faker.datatype.boolean({ probability: 0.4 })) {
        await ctx.db.insert("learnerFeedback", {
          userId: LEARNER_ID,
          targetType: "course",
          targetId: courseId as string,
          feedbackType: faker.helpers.arrayElement(["suggestion", "incorrect_info", "other"]),
          message: faker.helpers.arrayElement(realisticFeedback),
          status: faker.helpers.arrayElement(["open", "open", "resolved"]),
          createdAt: faker.date.between({ from: enrolledAt, to: Date.now() }).getTime(),
        });
        feedbackCt++;
      }

      // --- Course Performance Snapshot ---
      const overallScore = (averageQuizScore * 0.4) + (averageAssignmentScore * 0.4) + (lessonsCompletedCount / lessons.length * 100 * 0.2);
      
      await ctx.db.insert("coursePerformance", {
        userId: LEARNER_ID, courseId,
        totalLessons: lessons.length,
        completedLessons: lessonsCompletedCount,
        totalQuizzes: quizzes.length,
        completedQuizzes: completedQuizzes,
        averageQuizScore,
        totalAssignments: assignments.length,
        completedAssignments: completedAssignments,
        averageAssignmentScore,
        overallScore,
        isComplete: enrollmentStatus === 'completed',
        lastUpdated: now(),
      });
      coursePerfCt++;
    }

    return {
      categories: { level1, level2, level3 },
      courses: coursesCt,
      modules: modulesCt,
      lessons: lessonsCt,
      guides: guidesCt,
      guideSteps: guideStepsCt,
      quizzes: quizzesCt,
      quizQuestions: quizQuestionsCt,
      assignments: assignmentsCt,
      enrollments: enrollmentsCt,
      lessonProgress: lessonProgressCt,
      guideProgress: guideProgressCt,
      quizAttempts: quizAttemptsCt,
      assignmentSubmissions: assignmentSubsCt,
      announcements: announcementsCt,
      feedback: feedbackCt,
      coursePerformance: coursePerfCt,
    };
  },
});