import { HttpClient } from "./httpClient.js"; // обязательно .js для Node ES module

interface User {
  id: number;
  name: string;
}

async function run() {
  const client = new HttpClient("https://jsonplaceholder.typicode.com", 2);

  try {
    // GET
    const users = await client.get<User[]>("/users");
    console.log("GET /users:", users.data);

    // POST
    const newUser = await client.post<User>("/users", { name: "John Doe" });
    console.log("POST /users:", newUser.data);

    // PUT
    const updatedUser = await client.put<User>("/users/1", { name: "Jane Doe" });
    console.log("PUT /users/1:", updatedUser.data);

    // PATCH
    const patchedUser = await client.patch<User>("/users/1", { name: "John Smith" });
    console.log("PATCH /users/1:", patchedUser.data);

  } catch (err) {
    console.error("Ошибка запроса:", err);
  }
}

run();
