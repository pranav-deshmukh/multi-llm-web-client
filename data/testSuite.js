// data/testSuite.js
export const testSuite = {
  calculator: [
    {
      id: "calc_001",
      prompt: "What is 234 multiplied by 567?",
      expectedTools: ["multiply"],
      expectedArgs: { a: 234, b: 567 },
      expectedResult: 132678,
      tolerance: 0.001,
      difficulty: "easy",
      category: "arithmetic",
    },
    {
      id: "calc_002",
      prompt: "Calculate the square root of 144",
      expectedTools: ["sqrt"],
      expectedArgs: { value: 144 },
      expectedResult: 12,
      tolerance: 0.001,
      difficulty: "easy",
      category: "basic_functions",
    },
    {
      id: "calc_003",
      prompt: "What is 15% of 200?",
      expectedTools: ["multiply", "divide"],
      expectedArgs: [
        { a: 15, b: 200 },
        { a: "result", b: 100 },
      ],
      expectedResult: 30,
      tolerance: 0.01,
      difficulty: "medium",
      category: "percentage",
    },
    {
      id: "calc_004",
      prompt: "Calculate (45 * 23) - (67 / 2.5)",
      expectedTools: ["multiply", "divide", "subtract"],
      expectedResult: 1008.2,
      tolerance: 0.1,
      difficulty: "medium",
      category: "complex",
    },
    {
      id: "calc_005",
      prompt: "Find the sum of 123, 456, and 789",
      expectedTools: ["add"],
      expectedArgs: { numbers: [123, 456, 789] },
      expectedResult: 1368,
      tolerance: 0.001,
      difficulty: "easy",
      category: "arithmetic",
    },
    {
      id: "calc_006",
      prompt: "What is 2 raised to the power of 10?",
      expectedTools: ["power"],
      expectedArgs: { base: 2, exponent: 10 },
      expectedResult: 1024,
      tolerance: 0.001,
      difficulty: "easy",
      category: "exponents",
    },
    {
      id: "calc_007",
      prompt: "Calculate the average of 50, 60, 70, 80, 90",
      expectedTools: ["add", "divide"],
      expectedResult: 70,
      tolerance: 0.001,
      difficulty: "medium",
      category: "statistics",
    },
    {
      id: "calc_008",
      prompt: "What is the remainder when 100 is divided by 7?",
      expectedTools: ["modulo"],
      expectedArgs: { a: 100, b: 7 },
      expectedResult: 2,
      tolerance: 0,
      difficulty: "easy",
      category: "arithmetic",
    },
    {
      id: "calc_009",
      prompt: "Calculate the factorial of 5",
      expectedTools: ["factorial"],
      expectedArgs: { n: 5 },
      expectedResult: 120,
      tolerance: 0,
      difficulty: "medium",
      category: "factorials",
    },
    {
      id: "calc_010",
      prompt: "Find the absolute value of -42",
      expectedTools: ["abs"],
      expectedArgs: { value: -42 },
      expectedResult: 42,
      tolerance: 0,
      difficulty: "easy",
      category: "basic_functions",
    },
  ],

  google_scholar: [
    {
      id: "scholar_001",
      prompt: "Search for papers on transformer architecture",
      expectedTools: ["search_google_scholar_key_words"],
      expectedArgs: { query: "transformer architecture" },
      expectedResultType: "paper_list",
      minResults: 3,
      mustContainKeywords: ["transformer", "attention"],
      difficulty: "easy",
      category: "keyword_search",
    },
    {
      id: "scholar_002",
      prompt: "Find papers by Yann LeCun",
      expectedTools: ["search_google_scholar_key_words"],
      expectedArgs: { query: "Yann LeCun" },
      expectedResultType: "paper_list",
      minResults: 3,
      mustContainKeywords: ["LeCun"],
      difficulty: "easy",
      category: "author_search",
    },
    {
      id: "scholar_003",
      prompt: "Search for papers on reinforcement learning published in 2023",
      expectedTools: ["search_google_scholar_advanced"],
      expectedArgs: {
        query: "reinforcement learning",
        year_range: [2023, 2023],
      },
      expectedResultType: "paper_list",
      minResults: 3,
      difficulty: "medium",
      category: "filtered_search",
    },
    {
      id: "scholar_004",
      prompt: "Find recent papers on neural networks",
      expectedTools: ["search_google_scholar_key_words"],
      expectedArgs: { query: "neural networks" },
      expectedResultType: "paper_list",
      minResults: 3,
      difficulty: "easy",
      category: "keyword_search",
    },
    {
      id: "scholar_005",
      prompt:
        "Search for papers on deep learning published between 2020 and 2022",
      expectedTools: ["search_google_scholar_advanced"],
      expectedArgs: { query: "deep learning", year_range: [2020, 2022] },
      expectedResultType: "paper_list",
      minResults: 3,
      difficulty: "medium",
      category: "filtered_search",
    },
    {
      id: "scholar_006",
      prompt: "Find papers by Geoffrey Hinton on backpropagation",
      expectedTools: ["search_google_scholar_advanced"],
      expectedArgs: { query: "backpropagation", author: "Geoffrey Hinton" },
      expectedResultType: "paper_list",
      minResults: 2,
      difficulty: "hard",
      category: "author_topic_search",
    },
    {
      id: "scholar_007",
      prompt: "Search for papers on computer vision",
      expectedTools: ["search_google_scholar_key_words"],
      expectedArgs: { query: "computer vision" },
      expectedResultType: "paper_list",
      minResults: 3,
      difficulty: "easy",
      category: "keyword_search",
    },
    {
      id: "scholar_008",
      prompt: "Find papers on natural language processing from 2024",
      expectedTools: ["search_google_scholar_advanced"],
      expectedArgs: {
        query: "natural language processing",
        year_range: [2024, 2024],
      },
      expectedResultType: "paper_list",
      minResults: 2,
      difficulty: "medium",
      category: "filtered_search",
    },
    {
      id: "scholar_009",
      prompt: "Search for papers on GANs (generative adversarial networks)",
      expectedTools: ["search_google_scholar_key_words"],
      expectedArgs: { query: "generative adversarial networks" },
      expectedResultType: "paper_list",
      minResults: 3,
      difficulty: "easy",
      category: "keyword_search",
    },
    {
      id: "scholar_010",
      prompt: "Find papers by Yoshua Bengio published after 2015",
      expectedTools: ["search_google_scholar_advanced"],
      expectedArgs: { query: "Yoshua Bengio", year_range: [2015, 2025] },
      expectedResultType: "paper_list",
      minResults: 3,
      difficulty: "medium",
      category: "author_search",
    },
  ],

  mongodb: [
    {
      id: "mongo_001",
      prompt: "List all collections in the database named mcp",
      expectedTools: ["list_collections"],
      expectedArgs: {},
      expectedResultType: "array",
      minResults: 1,
      difficulty: "easy",
      category: "schema_inspection",
    },
    {
      id: "mongo_002",
      prompt: "Find all documents in the evaluations collection",
      expectedTools: ["find_documents"],
      expectedArgs: { collection: "users", filter: {} },
      expectedResultType: "array",
      difficulty: "easy",
      category: "basic_query",
    },
    {
      id: "mongo_003",
      prompt:
        "Find models with modelid gemini-2.5-flash in evaluations collection",
      expectedTools: ["find_documents"],
      expectedArgs: { collection: "users", filter: { age: { $gt: 25 } } },
      expectedResultType: "array",
      difficulty: "medium",
      category: "filtered_query",
    },
    {
      id: "mongo_004",
      prompt: "Count the number of documents in the evaluations collection",
      expectedTools: ["count_documents"],
      expectedArgs: { collection: "products" },
      expectedResultType: "number",
      difficulty: "easy",
      category: "aggregation",
    },
    {
      id: "mongo_005",
      prompt:
        "What is number of documents with mcpServerId as calculator in evaluations collection",
      expectedTools: ["find_documents"],
      expectedArgs: {
        collection: "users",
        filter: { email: { $regex: "gmail.com" } },
      },
      expectedResultType: "array",
      difficulty: "medium",
      category: "pattern_matching",
    },
    {
      id: "mongo_006",
      prompt: "Get the first 5 documents from the evaluations collection",
      expectedTools: ["find_documents"],
      expectedArgs: { collection: "orders", limit: 5 },
      expectedResultType: "array",
      difficulty: "medium",
      category: "limited_query",
    },
    {
      id: "mongo_007",
      prompt:
        "Find model performance with overall avgTCPA less than 0.75 in evaluations collection",
      expectedTools: ["find_documents"],
      expectedArgs: { collection: "products", filter: { price: { $lt: 100 } } },
      expectedResultType: "array",
      difficulty: "medium",
      category: "filtered_query",
    },
    {
      id: "mongo_008",
      prompt: "Show me the structure of the modelperformances collection",
      expectedTools: ["find_documents"],
      expectedArgs: { collection: "customers", limit: 1 },
      expectedResultType: "array",
      difficulty: "easy",
      category: "schema_inspection",
    },
  ],

  github: [
    {
      id: "github_001",
      prompt: "Search for repositories about machine learning",
      expectedTools: ["search_repositories"],
      expectedArgs: { query: "machine learning" },
      expectedResultType: "repository_list",
      minResults: 3,
      difficulty: "easy",
      category: "repo_search",
    },
    {
      id: "github_002",
      prompt: "Get information about the tensorflow repository",
      expectedTools: ["get_repository"],
      expectedArgs: { owner: "tensorflow", repo: "tensorflow" },
      expectedResultType: "repository_info",
      difficulty: "easy",
      category: "repo_info",
    },
    {
      id: "github_003",
      prompt: "List issues in the facebook/react repository",
      expectedTools: ["list_issues"],
      expectedArgs: { owner: "facebook", repo: "react" },
      expectedResultType: "issue_list",
      difficulty: "medium",
      category: "issue_tracking",
    },
    {
      id: "github_004",
      prompt: "Find open pull requests in the pytorch repository",
      expectedTools: ["list_pull_requests"],
      expectedArgs: { owner: "pytorch", repo: "pytorch", state: "open" },
      expectedResultType: "pr_list",
      difficulty: "medium",
      category: "pr_tracking",
    },
    {
      id: "github_005",
      prompt: "Get the README file from the nodejs/node repository",
      expectedTools: ["get_file_contents"],
      expectedArgs: { owner: "nodejs", repo: "node", path: "README.md" },
      expectedResultType: "file_content",
      difficulty: "medium",
      category: "file_access",
    },
  ],
  blender: [
    {
      id: "blender_001",
      prompt: "Check if Blender is connected and responsive",
      expectedTools: ["test-blender-connection"],
      expectedArgs: {},
      expectedResultType: "connection_status",
      difficulty: "easy",
      category: "connection",
    },
    {
      id: "blender_002",
      prompt: "Create a default cube in Blender",
      expectedTools: ["send-code-to-blender"],
      expectedArgs: {
        code: "import bpy\nbpy.ops.mesh.primitive_cube_add(location=(0,0,0))",
      },
      expectedResultType: "code_execution_result",
      difficulty: "easy",
      category: "object_creation",
    },
    {
      id: "blender_003",
      prompt: "Move the existing cube to coordinates (2, 1, 0.5)",
      expectedTools: ["send-code-to-blender"],
      expectedArgs: {
        code: "import bpy\nobj = bpy.context.active_object\nobj.location = (2,1,0.5)",
      },
      expectedResultType: "code_execution_result",
      difficulty: "medium",
      category: "transformation",
    },
    {
      id: "blender_004",
      prompt: "Fetch the current scene and list all objects",
      expectedTools: ["fetch-scene-from-blender"],
      expectedArgs: {},
      expectedResultType: "scene_data",
      difficulty: "medium",
      category: "scene_fetch",
    },
    {
      id: "blender_005",
      prompt:
        "Test the full pipeline: check connection, add a sphere, then fetch the updated scene",
      expectedTools: [
        "test-blender-connection",
        "send-code-to-blender",
        "fetch-scene-from-blender",
      ],
      expectedArgs: {
        step1: {},
        step2: {
          code: "import bpy\nbpy.ops.mesh.primitive_uv_sphere_add(location=(0,0,1))",
        },
        step3: {},
      },
      expectedResultType: "scene_update_validation",
      difficulty: "medium",
      category: "integration",
    },
    {
      id: "blender_006",
      prompt: "Assign a red material to the cube",
      expectedTools: ["send-code-to-blender"],
      expectedArgs: {
        code: `
import bpy
mat = bpy.data.materials.new(name="RedMaterial")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (1,0,0,1)
cube = bpy.data.objects.get("Cube")
cube.data.materials.append(mat)
`,
      },
      expectedResultType: "material_assignment",
      difficulty: "medium",
      category: "materials",
    },
    {
      id: "blender_007",
      prompt:
        "Rotate the cube 90 degrees on the Z-axis and verify it using scene data",
      expectedTools: ["send-code-to-blender", "fetch-scene-from-blender"],
      expectedArgs: {
        step1: {
          code: "import bpy\ncube = bpy.data.objects['Cube']\ncube.rotation_euler[2] = 1.5708",
        },
        step2: {},
      },
      expectedResultType: "transformation_verification",
      difficulty: "hard",
      category: "rotation_validation",
    },
    {
      id: "blender_008",
      prompt: "Create a simple animation that moves the cube up and down",
      expectedTools: ["send-code-to-blender"],
      expectedArgs: {
        code: `
import bpy
cube = bpy.data.objects['Cube']
cube.location = (0,0,0)
cube.keyframe_insert(data_path="location", frame=1)
cube.location = (0,0,2)
cube.keyframe_insert(data_path="location", frame=50)
`,
      },
      expectedResultType: "animation_sequence",
      difficulty: "hard",
      category: "animation",
    },
  ],
};

// Helper function to get all test IDs
export function getAllTestIds() {
  return Object.values(testSuite)
    .flat()
    .map((test) => test.id);
}

// Helper function to get test by ID
export function getTestById(testId) {
  for (const mcpTests of Object.values(testSuite)) {
    const test = mcpTests.find((t) => t.id === testId);
    if (test) return test;
  }
  return null;
}

// Helper function to get tests by MCP
export function getTestsByMcp(mcpId) {
  return testSuite[mcpId] || [];
}
