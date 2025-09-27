import { Hono } from "hono";
import {
  createSolanaClient,
  createTransaction,
  getSignatureFromTransaction,
  signTransactionMessageWithSigners,
} from "gill";
import { getAddMemoInstruction } from "gill/programs";
import { loadKeypairSignerFromFile } from "gill/node";
import { serve } from "@hono/node-server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Redis } from "@upstash/redis";

const app = new Hono();

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: "devnet",
});

const signer = await loadKeypairSignerFromFile("id.json");

const API_KEY = "AIzaSyDltTkLZbpFk0scOgiolgeiq8e6jE3B0z4";
const MODEL_NAME = "gemini-2.0-flash";
const genAI = new GoogleGenerativeAI(API_KEY);
const redis = new Redis({
  url: "https://precious-krill-12330.upstash.io",
  token: "ATAqAAIncDJjYzg5MDk1Y2NhZDM0NGI1YWM1MWVmYzNjNzc0MGVmNHAyMTIzMzA",
});

app.post("/zk", async (c) => {
  const transaction = createTransaction({
    version: "legacy",
    feePayer: signer,
    instructions: [
      getAddMemoInstruction({
        memo: "narcode team ke saare members ki job lag jaaye, 20 lpa+ ki",
      }),
    ],
    latestBlockhash: (await rpc.getLatestBlockhash().send()).value,
  });

  const signedTransaction = await signTransactionMessageWithSigners(
    transaction
  );

  const signature = getSignatureFromTransaction(signedTransaction);

  await sendAndConfirmTransaction(signedTransaction);

  return c.text(signature);
});

app.post("/ai", async (c) => {
  const body = await c.req.json();

  const data = await redis.get("shop");

  const { response } = await genAI
    .getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: `You're a smart chatbot for a workforce planner system for small business which will be given some questions or tasks and thier corresponding output needed: 
                    
                    The data of whole business is being stored as a single JSON file with below schema

                    /**
                     * Represents a single task assigned to a staff member on a specific day.
                     */
                    interface Task {
                      id: string;          // Unique identifier for the task (e.g., "shop-001-staff-001-2025-09-26-t1")
                      startTime: string;   // Start time of the task (e.g., "10:40")
                      endTime: string;     // End time of the task (e.g., "11:40")
                      task: string;        // Description of the task (e.g., "Team huddle")
                      status: "completed" | "not_completed"; // The completion status of the task
                      priority: "low" | "high";             // The priority level of the task
                    }

                    /**
                     * Represents a single day's worth of tasks for a staff member.
                     */
                    interface Day {
                      id: string;      // The date for this set of tasks (e.g., "2025-09-26")
                      tasks: Task[];   // An array of Task objects for that day
                    }

                    /**
                     * Represents a single staff member.
                     */
                    interface Staff {
                      id: string;          // Unique identifier for the staff member (e.g., "shop-001-staff-001")
                      name?: string;        // The full name of the staff member (optional, but good to have)
                      phoneNumber: string; // The staff member's phone number
                      role: string;        // Their job title (e.g., "Cashier")
                      status: "active" | "inactive" | "on_leave"; // Current employment status
                      startTime: string;   // The typical start time of their shift
                      endTime: string;     // The typical end time of their shift
                      skillset: string[];  // An array of skills they possess
                      salary: number;      // Their monthly or hourly salary
                      tasksCompleted: number; // A count of completed tasks, perhaps over a specific period
                      day: Day[];          // An array of Day objects, detailing their schedule and tasks
                    }

                    /**
                     * Represents a single shop or store location.
                     */
                    interface Shop {
                      id: string;          // Unique identifier for the shop (e.g., "shop-001")
                      shopName: string;    // The name of the shop
                      location?: string;   // The physical location of the shop (optional)
                      startTime: string;   // The opening time of the shop
                      endTime: string;     // The closing time of the shop
                      staffs: Staff[];     // An array of Staff objects who work at this shop
                    }

                    The Shop is the main data structure.

                    The Current JSON file is given below use that for output for questions: 

                    ${data}

                    Holidays are:

                    {
                      "country_code": "IN",
                      "country_name": "India",
                      "date": "2025-09-05",
                      "name": {
                        "en": "Milad un-Nabi/Id-e-Milad"
                      },
                      "isNational": true,
                      "isReligious": true,
                      "isLocal": false,
                      "isEstimate": false,
                      "day": {
                        "actual": "Friday",
                        "observed": "Friday"
                      },
                      "religion": "Islam",
                      "regions": []
                    },
                    {
                      "country_code": "IN",
                      "country_name": "India",
                      "date": "2025-09-05",
                      "name": {
                        "en": "Onam"
                      },
                      "isNational": false,
                      "isReligious": true,
                      "isLocal": true,
                      "isEstimate": false,
                      "day": {
                        "actual": "Friday",
                        "observed": "Friday"
                      },
                      "religion": "Hinduism",
                      "regions": [
                        "KL"
                      ]
                    },
                    {
                      "country_code": "IN",
                      "country_name": "India",
                      "date": "2025-09-22",
                      "name": {
                        "en": "First Day of Sharad Navratri"
                      },
                      "isNational": false,
                      "isReligious": true,
                      "isLocal": false,
                      "isEstimate": false,
                      "day": {
                        "actual": "Monday",
                        "observed": "Monday"
                      },
                      "religion": "Hinduism",
                      "regions": []
                    },
                    {
                      "country_code": "IN",
                      "country_name": "India",
                      "date": "2025-09-28",
                      "name": {
                        "en": "First Day of Durga Puja Festivities"
                      },
                      "isNational": false,
                      "isReligious": true,
                      "isLocal": false,
                      "isEstimate": false,
                      "day": {
                        "actual": "Sunday",
                        "observed": "Sunday"
                      },
                      "religion": "Hinduism",
                      "regions": []
                    },
                    {
                      "country_code": "IN",
                      "country_name": "India",
                      "date": "2025-09-29",
                      "name": {
                        "en": "Maha Saptami"
                      },
                      "isNational": false,
                      "isReligious": true,
                      "isLocal": true,
                      "isEstimate": false,
                      "day": {
                        "actual": "Monday",
                        "observed": "Monday"
                      },
                      "religion": "Hinduism",
                      "regions": [
                        "WB",
                        "OR",
                        "BJ",
                        "UP",
                        "MP"
                      ]
                    },
                    {
                      "country_code": "IN",
                      "country_name": "India",
                      "date": "2025-09-30",
                      "name": {
                        "en": "Maha Ashtami"
                      },
                      "isNational": false,
                      "isReligious": true,
                      "isLocal": true,
                      "isEstimate": false,
                      "day": {
                        "actual": "Tuesday",
                        "observed": "Tuesday"
                      },
                      "religion": "Hinduism",
                      "regions": [
                        "WB",
                        "OR",
                        "BJ",
                        "UP",
                        "MP"
                      ]
                    },

                    Todays date is: ${new Date().toISOString()}

                    1) Give me optimal employee for some task (or a similar type of question)
                    Input Task: The task given in the question
                    Output: check the JSON file for the input task and return the Staff[] as output strictly.

                    2) Create a schedule for todays for each staff in database and create no task if there is holiday today
                    Output: List of task in below format for each staff, use previous backlog tasks from task.status == not_completed, create new ai generated 5-8 tasks and then add give output as follows:
                    Format: [task: Task[], staff: <StaffId for the task>]

                    3) Give Todays Task Summary and other details
                    Output: Return list of tasks that are completed/uncompleted in todays date
                    Output: Task[] with a summary key containing summary of the task
                  
                    
                  For above tasks return JSON strictly directly not any kind of text content, formatted JSON must be the output!`,
    })
    .generateContent(body.prompt);

  return c.text(response.text());
});

serve(app);
