import { question, keyInSelect } from "readline-sync";
import { Client } from "pg";

runApp();

async function runApp() {
  const client = new Client({ database: "omdb" });
  console.log("\nWelcome to search-movies-cli!");
  await client.connect();
  try {
    await mainMenuPrompt(client);
  } catch (e) {
    console.error("\noops - something went wrong");
  } finally {
    console.log("\nQuitting...");
    client.end();
  }
}

async function mainMenuPrompt(client: Client) {
  while (true) {
    const options = ["Search Movie Name", "Say hello"];
    const result = keyInSelect(options, "what do do?") + 1;
    switch (result) {
      case 1:
        await searchMoviePrompt(client);
        break;
      case 2:
        console.log("\nHELLO THERE FRIEND");
        break;
      case 0:
        return;
    }
  }
}

async function searchMoviePrompt(client: Client) {
  while (true) {
    const searchString = question("\nSearch for a movie ('q' to quit): ");
    if (searchString.toLowerCase() === "q") {
      break;
    }
    console.table(await getMovies(client, searchString));
  }
}

async function getMovies(client: Client, searchString: string) {
  const query = `SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count 
                 FROM movies
                 WHERE LOWER(name) LIKE LOWER($1)
                 ORDER BY
                   CASE
                     WHEN date IS NULL THEN 1
                     ELSE 0
                 END, date DESC
                 LIMIT 10`;
  const values = [`%${searchString}%`];
  return (await client.query(query, values)).rows;
}
