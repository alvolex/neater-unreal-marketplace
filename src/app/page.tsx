"use client";

import { User, getAuth } from "firebase/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Home() {
  let user = useCurrentUser();

  return (
    <main>
      <h1>Home</h1>
      {user && <h2>Hello, {user.displayName}</h2>}
    </main>
  );
}
function setUser(curUser: User) {
  throw new Error("Function not implemented.");
}
