import { NextResponse } from 'next/server';

// This is a simple passthrough API that will help us debug
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  console.log("API route /News called with request URL:", request.url);
  
  try {
    // Forward to backend
    const backendUrl = 'https://futbolink.onrender.com/News';
    console.log("Forwarding to:", backendUrl);
    
    const response = await fetch(backendUrl);
    const data = await response.json();
    
    console.log("Backend response received, status:", response.status);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/News route:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
} 