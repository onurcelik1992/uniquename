import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./styles.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const app = clerkPublishableKey ? (
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <App clerkEnabled />
  </ClerkProvider>
) : (
  <App clerkEnabled={false} />
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {app}
  </React.StrictMode>
);
