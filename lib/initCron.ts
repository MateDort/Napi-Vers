// Initialize cron job on module load (server-side only)
if (typeof window === "undefined") {
  import("./cron").then(({ startCronJob }) => {
    startCronJob();
  });
}

