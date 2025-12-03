import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting identity verification...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch enrollments with images
    const { data: enrollments, error: dbError } = await supabase
      .from("enrollments")
      .select("id, local_id, first_name, last_name, type, image_front, image_left, image_right")
      .not("image_front", "is", null);

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to fetch enrollments");
    }

    if (!enrollments || enrollments.length === 0) {
      console.log("No enrollments with images found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { match: false, confidence: 0, message: "No enrollments in database" } 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${enrollments.length} enrollments with images`);

    // Helper to ensure proper data URL format
    const ensureDataUrl = (img: string): string => {
      if (img.startsWith('data:image/')) {
        return img;
      }
      // Assume JPEG if no prefix
      return `data:image/jpeg;base64,${img}`;
    };

    // Use AI to compare faces
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the content for AI comparison
    const imageContents: any[] = [
      {
        type: "text",
        text: `You are a face recognition system. I will show you a captured face image first, followed by enrollment images from a database. 
        
Your task is to determine if the captured face matches any of the enrollment faces.

IMPORTANT: Compare facial features like face shape, eyes, nose, mouth, and overall structure. Ignore lighting differences and image quality.

For each enrollment, I'll provide the enrollment ID and the person's name.

After analyzing all images, respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{"match": true/false, "confidence": 0.0-1.0, "matchedId": "enrollment_local_id or null", "matchedName": "person name or null"}

If you find a match with confidence above 0.7, set match to true. Otherwise set match to false.

Here is the captured face to verify:`
      },
      {
        type: "image_url",
        image_url: { url: ensureDataUrl(imageBase64) }
      },
      {
        type: "text",
        text: "\n\nNow here are the enrollment images to compare against:\n"
      }
    ];

    // Add enrollment images (limit to first 10 to avoid token limits)
    const enrollmentsToCheck = enrollments.slice(0, 10);
    
    for (const enrollment of enrollmentsToCheck) {
      if (enrollment.image_front) {
        imageContents.push({
          type: "text",
          text: `\n--- Enrollment ID: ${enrollment.local_id}, Name: ${enrollment.first_name} ${enrollment.last_name} ---`
        });
        imageContents.push({
          type: "image_url",
          image_url: { url: ensureDataUrl(enrollment.image_front) }
        });
      }
    }

    imageContents.push({
      type: "text",
      text: "\n\nNow analyze and respond with the JSON result only."
    });

    console.log("Sending to AI for face comparison...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: imageContents
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted, please add funds" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI comparison failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    console.log("AI response:", aiContent);

    // Parse AI response
    let result = { match: false, confidence: 0, matchedId: null, matchedName: null };
    
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return no match if parsing fails
    }

    console.log("Verification result:", result);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          match: result.match,
          confidence: result.confidence,
          matchedId: result.matchedId,
          matchedName: result.matchedName
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
