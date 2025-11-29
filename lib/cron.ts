import cron from "node-cron";
import { getOrGenerateTodayPoem } from "./dailyPoemGenerator";

// Run at midnight every day (00:00)
export function startCronJob() {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily poem generation at midnight...");
    try {
      await getOrGenerateTodayPoem();
      console.log("Daily poem generated successfully");
    } catch (error) {
      console.error("Error generating daily poem:", error);
    }
  });

  console.log("Cron job scheduled: Daily poem generation at midnight");
}

