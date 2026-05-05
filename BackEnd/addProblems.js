const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./src/models/problem');
const User = require('./src/models/user');

const problems = [
  {
    title: "Reverse Integer",
    description: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.",
    difficulty: "medium",
    tags: "array",
    visibleTestCases: [
      { input: "123", output: "321", explanation: "123 reversed is 321" },
      { input: "-123", output: "-321", explanation: "-123 reversed is -321" }
    ],
    hiddenTestCases: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" },
      { input: "0", output: "0" },
      { input: "1534236469", output: "0" }
    ],
    startCode: [
      {
        language: "C++",
        initialCode: "#include <iostream>\n#include <climits>\nusing namespace std;\n\nclass Solution {\npublic:\n    int reverse(int x) {\n        // Write your code here\n        \n    }\n};\n\nint main() {\n    int x;\n    if (cin >> x) {\n        Solution sol;\n        cout << sol.reverse(x);\n    }\n    return 0;\n}"
      },
      {
        language: "Java",
        initialCode: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int x = sc.nextInt();\n            System.out.print(new Solution().reverse(x));\n        }\n    }\n}\n\nclass Solution {\n    public int reverse(int x) {\n        // Write your code here\n        \n    }\n}"
      },
      {
        language: "JavaScript",
        initialCode: "const fs = require(\"fs\");\n\nfunction reverse(x) {\n    // Write your code here\n    \n}\n\n// Driver Code\nconst input = fs.readFileSync(0, \"utf8\").trim();\nif (input !== \"\") {\n    const x = parseInt(input);\n    process.stdout.write(reverse(x).toString());\n}"
      }
    ],
    referenceSolution: [
      {
        language: "C++",
        completeCode: "#include <iostream>\n#include <climits>\nusing namespace std;\n\nclass Solution {\npublic:\n    int reverse(int x) {\n        int rev = 0;\n        while (x != 0) {\n            int pop = x % 10;\n            x /= 10;\n            if (rev > INT_MAX/10 || (rev == INT_MAX / 10 && pop > 7)) return 0;\n            if (rev < INT_MIN/10 || (rev == INT_MIN / 10 && pop < -8)) return 0;\n            rev = rev * 10 + pop;\n        }\n        return rev;\n    }\n};\n\nint main() {\n    int x;\n    if (cin >> x) {\n        Solution sol;\n        cout << sol.reverse(x);\n    }\n    return 0;\n}"
      },
      {
        language: "Java",
        completeCode: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int x = sc.nextInt();\n            System.out.print(new Solution().reverse(x));\n        }\n    }\n}\n\nclass Solution {\n    public int reverse(int x) {\n        int rev = 0;\n        while (x != 0) {\n            int pop = x % 10;\n            x /= 10;\n            if (rev > Integer.MAX_VALUE/10 || (rev == Integer.MAX_VALUE / 10 && pop > 7)) return 0;\n            if (rev < Integer.MIN_VALUE/10 || (rev == Integer.MIN_VALUE / 10 && pop < -8)) return 0;\n            rev = rev * 10 + pop;\n        }\n        return rev;\n    }\n}"
      },
      {
        language: "JavaScript",
        completeCode: "const fs = require(\"fs\");\n\nfunction reverse(x) {\n    const limit = Math.pow(2, 31);\n    const sign = x < 0 ? -1 : 1;\n    const res = parseInt(Math.abs(x).toString().split('').reverse().join('')) * sign;\n    if (res > limit - 1 || res < -limit) return 0;\n    return res;\n}\n\n// Driver Code\nconst input = fs.readFileSync(0, \"utf8\").trim();\nif (input !== \"\") {\n    const x = parseInt(input);\n    process.stdout.write(reverse(x).toString());\n}"
      }
    ]
  },
  {
    title: "Longest Valid Parentheses",
    description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    difficulty: "hard",
    tags: "dp",
    visibleTestCases: [
      { input: "\"(()\"", output: "2", explanation: "The longest valid parentheses substring is '()'" },
      { input: "\")()())\"", output: "4", explanation: "The longest valid parentheses substring is '()()'" }
    ],
    hiddenTestCases: [
      { input: "\"(()\"", output: "2" },
      { input: "\")()())\"", output: "4" },
      { input: "\"\"", output: "0" },
      { input: "\"()(()\"", output: "2" },
      { input: "\"()()\"", output: "4" }
    ],
    startCode: [
      {
        language: "C++",
        initialCode: "#include <iostream>\n#include <string>\n#include <vector>\n#include <stack>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestValidParentheses(string s) {\n        // Write your code here\n        \n    }\n};\n\nint main() {\n    string s;\n    if (cin >> s) {\n        if (s.front() == '\"' && s.back() == '\"') s = s.substr(1, s.length() - 2);\n        Solution sol;\n        cout << sol.longestValidParentheses(s);\n    } else {\n        cout << 0;\n    }\n    return 0;\n}"
      },
      {
        language: "Java",
        initialCode: "import java.util.Scanner;\nimport java.util.Stack;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            if (s.startsWith(\"\\\"\") && s.endsWith(\"\\\"\")) s = s.substring(1, s.length() - 1);\n            System.out.print(new Solution().longestValidParentheses(s));\n        } else {\n            System.out.print(0);\n        }\n    }\n}\n\nclass Solution {\n    public int longestValidParentheses(String s) {\n        // Write your code here\n        \n    }\n}"
      },
      {
        language: "JavaScript",
        initialCode: "const fs = require(\"fs\");\n\nfunction longestValidParentheses(s) {\n    // Write your code here\n    \n}\n\n// Driver Code\nlet input = fs.readFileSync(0, \"utf8\").trim();\nif (input) {\n    if (input.startsWith('\"') && input.endsWith('\"')) input = input.substring(1, input.length - 1);\n    process.stdout.write(longestValidParentheses(input).toString());\n} else {\n    process.stdout.write(\"0\");\n}"
      }
    ],
    referenceSolution: [
      {
        language: "C++",
        completeCode: "#include <iostream>\n#include <string>\n#include <vector>\n#include <stack>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestValidParentheses(string s) {\n        int maxans = 0;\n        stack<int> st;\n        st.push(-1);\n        for (int i = 0; i < s.length(); i++) {\n            if (s[i] == '(') {\n                st.push(i);\n            } else {\n                st.pop();\n                if (st.empty()) {\n                    st.push(i);\n                } else {\n                    maxans = max(maxans, i - st.top());\n                }\n            }\n        }\n        return maxans;\n    }\n};\n\nint main() {\n    string s;\n    if (cin >> s) {\n        if (s.front() == '\"' && s.back() == '\"') s = s.substr(1, s.length() - 2);\n        Solution sol;\n        cout << sol.longestValidParentheses(s);\n    } else {\n        cout << 0;\n    }\n    return 0;\n}"
      },
      {
        language: "Java",
        completeCode: "import java.util.Scanner;\nimport java.util.Stack;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            if (s.startsWith(\"\\\"\") && s.endsWith(\"\\\"\")) s = s.substring(1, s.length() - 1);\n            System.out.print(new Solution().longestValidParentheses(s));\n        } else {\n            System.out.print(0);\n        }\n    }\n}\n\nclass Solution {\n    public int longestValidParentheses(String s) {\n        int maxans = 0;\n        Stack<Integer> stack = new Stack<>();\n        stack.push(-1);\n        for (int i = 0; i < s.length(); i++) {\n            if (s.charAt(i) == '(') {\n                stack.push(i);\n            } else {\n                stack.pop();\n                if (stack.empty()) {\n                    stack.push(i);\n                } else {\n                    maxans = Math.max(maxans, i - stack.peek());\n                }\n            }\n        }\n        return maxans;\n    }\n}"
      },
      {
        language: "JavaScript",
        completeCode: "const fs = require(\"fs\");\n\nfunction longestValidParentheses(s) {\n    let maxans = 0;\n    let stack = [-1];\n    for (let i = 0; i < s.length; i++) {\n        if (s[i] === '(') {\n            stack.push(i);\n        } else {\n            stack.pop();\n            if (stack.length === 0) {\n                stack.push(i);\n            } else {\n                maxans = Math.max(maxans, i - stack[stack.length - 1]);\n            }\n        }\n    }\n    return maxans;\n}\n\n// Driver Code\nlet input = fs.readFileSync(0, \"utf8\").trim();\nif (input) {\n    if (input.startsWith('\"') && input.endsWith('\"')) input = input.substring(1, input.length - 1);\n    process.stdout.write(longestValidParentheses(input).toString());\n} else {\n    process.stdout.write(\"0\");\n}"
      }
    ]
  }
];

mongoose.connect(process.env.DB_CONNECT_STRING)
  .then(async () => {
    console.log('Connected to DB');
    const admin = await mongoose.model('user').findOne({ role: 'admin' });
    const problemCreator = admin ? admin._id : null;

    for (const p of problems) {
      const existing = await Problem.findOne({ title: p.title });
      if (existing) {
        console.log('Problem ' + p.title + ' already exists, skipping...');
        continue;
      }
      await Problem.create({ ...p, problemCreator });
      console.log('Problem ' + p.title + ' created!');
    }
    mongoose.disconnect();
  })
  .catch(err => console.error('Connection error:', err));
