import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the news ID from the URL
    const id = params.id;
    
    // Return an empty news object with a proper structure
    return NextResponse.json({
      id,
      title: "News article",
      subtitle: "This is a placeholder news item",
      content: "Content is not available at this time.",
      date: new Date().toISOString(),
      imgUrl: "",
      author: "System"
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news item" },
      { status: 500 }
    );
  }
} 