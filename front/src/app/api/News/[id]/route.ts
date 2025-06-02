import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  console.log("API route /News/[id] called with id:", id);
  
  try {
    // Forward to backend
    const backendUrl = `https://futbolink.onrender.com/News/${id}`;
    console.log("Forwarding to:", backendUrl);
    
    const response = await fetch(backendUrl);
    
    // Log the status
    console.log("Backend response received, status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }
    
    // Get the data
    const data = await response.json();
    
    console.log("Data received:", data);
    
    // Instead of returning NextResponse.json, render a proper HTML response
    // This mimics what a server component would do
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>${data.title || 'Noticia'}</title>
        </head>
        <body>
          <div>
            <h1>${data.title || 'Sin título'}</h1>
            <p>${data.description || 'Sin descripción'}</p>
            <img src="${data.imageUrl || ''}" alt="${data.title || 'Noticia'}" style="max-width: 100%;" />
          </div>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/News/[id] route:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
} 