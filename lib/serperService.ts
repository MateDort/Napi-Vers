import axios from "axios";

export interface HungarianEvent {
  title: string;
  snippet: string;
  link?: string;
  date?: string; // ISO date string if the event explicitly mentions today's date
}

export async function checkHungarianEvents(): Promise<HungarianEvent[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn("SERPER_API_KEY not set, using fallback");
    return getFallbackEvents();
  }

  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Search for Hungarian literary events, birthdays, anniversaries
    const queries = [
      `magyar költő születésnap ${month} ${day}`,
      `magyar író születésnap ${month} ${day}`,
      `magyar irodalom esemény ${month} ${day}`,
      `hungarian poet birthday ${month} ${day}`,
      `hungarian author birthday ${month} ${day}`,
    ];

    const allEvents: HungarianEvent[] = [];

    for (const query of queries) {
      try {
        const response = await axios.post(
          "https://google.serper.dev/search",
          {
            q: query,
            gl: "hu",
            hl: "hu",
            num: 5,
          },
          {
            headers: {
              "X-API-KEY": apiKey,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.organic) {
          const events = response.data.organic.map((item: any) => {
            const eventText = `${item.title || ""} ${item.snippet || ""}`.toLowerCase();
            // Check if the event mentions today's date
            const monthDayPattern = new RegExp(`\\b${month}\\s*[./]\\s*${day}\\b|\\b${day}\\s*[./]\\s*${month}\\b`, 'i');
            const monthNames = ["január", "február", "március", "április", "május", "június", 
                                "július", "augusztus", "szeptember", "október", "november", "december"];
            const monthName = monthNames[month - 1];
            const hasDate = monthDayPattern.test(eventText) || 
                           eventText.includes(`${day}. ${monthName}`) ||
                           eventText.includes(`${monthName} ${day}`);
            const mentionsToday = eventText.includes(' ma ') || eventText.includes(' mai ') || 
                                 eventText.startsWith('ma ') || eventText.startsWith('mai ');
            
            return {
              title: item.title || "",
              snippet: item.snippet || "",
              link: item.link,
              date: hasDate || mentionsToday ? `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : undefined,
            };
          });
          allEvents.push(...events);
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
      }
    }

    // Remove duplicates and return
    const uniqueEvents = Array.from(
      new Map(allEvents.map((e) => [e.title, e])).values()
    );

    return uniqueEvents.length > 0 ? uniqueEvents : getFallbackEvents();
  } catch (error) {
    console.error("Error checking Hungarian events:", error);
    return getFallbackEvents();
  }
}

function getFallbackEvents(): HungarianEvent[] {
  // Fallback events if API fails
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return [
    {
      title: `Magyar irodalom napja - ${month}. ${day}.`,
      snippet: `Ma fontos nap a magyar irodalom történetében.`,
    },
  ];
}

