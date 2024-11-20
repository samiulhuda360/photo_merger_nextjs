import { NextResponse } from "next/server";

export function middleware(req) {
  console.log("Middleware triggered");

  // Check for authorization header
  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const auth = basicAuth.split(" ")[1];
    const [username, password] = atob(auth).split(":");

    console.log("Credentials provided:", username, password);

    // Replace these credentials with your secure ones
    if (username === "samiuser" && password === "samipass123") {
      console.log("Authorized");
      return NextResponse.next(); // Allow access
    }
  }

  console.log("Unauthorized access attempt");

  // If authentication fails, prompt for login
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

// Apply middleware to all paths
export const config = {
  matcher: ["/:path*"],
};
