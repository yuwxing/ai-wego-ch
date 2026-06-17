/**
 * Delete duplicate competition tasks from Supabase
 * Run: node scripts/delete-duplicate-competitions.js
 */
const https = require("https");

const SUPABASE_URL = "mzjmfyoemcsoqzoooiej.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16am1meW9lbWNzb3F6b29vaWpWIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ5MDgwMCwiZXhwIjoyMDkzMDY2ODAwfQ.BaovYmOpmOANyo6fmSPKV1FwNwLWlkVVSa7r8KsaMtM";
const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

function fetch(path) {
  return new Promise((resolve, reject) => {
    https
      .get(`https://${SUPABASE_URL}/rest/v1/${path}`, { headers }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

function deleteRow(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://${SUPABASE_URL}/rest/v1/${path}`);
    const req = https.request(
      url,
      { method: "DELETE", headers },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, data }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  console.log("Fetching competition tasks...");
  const tasks = await fetch(
    "tasks?source=eq.competition&select=id,title,created_at&order=id.asc"
  );

  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.log("No competition tasks found.");
    return;
  }

  console.log(`Found ${tasks.length} competition tasks:\n`);
  tasks.forEach((t, i) => console.log(`  ${i + 1}. ID:${t.id} - ${t.title}`));

  // Group by title
  const groups = {};
  tasks.forEach((t) => {
    if (!groups[t.title]) groups[t.title] = [];
    groups[t.title].push(t);
  });

  let totalDeleted = 0;
  for (const [title, group] of Object.entries(groups)) {
    if (group.length > 1) {
      // Keep the first one, delete the rest
      const [keep, ...dupes] = group;
      console.log(`\n"${title}" has ${group.length} entries. Keeping ID:${keep.id}`);
      for (const d of dupes) {
        console.log(`  Deleting ID:${d.id}...`);
        const result = await deleteRow(`tasks?id=eq.${d.id}`);
        console.log(`  => ${result.status} ${result.data}`);
        totalDeleted++;
      }
    }
  }

  if (totalDeleted === 0) {
    console.log("\nNo duplicates found.");
  } else {
    console.log(`\n✅ Deleted ${totalDeleted} duplicate entries.`);
  }
}

main().catch(console.error);
