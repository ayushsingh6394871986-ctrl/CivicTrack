import { NextRequest, NextResponse } from 'next/server';

interface GeminiAnalyzeRequest {
  image: string; // Base64 data URL or raw base64
  issueType: string;
  description?: string;
}

interface GeminiAnalyzeResponse {
  detected: boolean;
  is_civic_issue: boolean;
  count: number;
  severity: number;
  confidence: number;
  issue_type: string;
  description: string;
  hazards_detected: string[];
  rejection_reason?: string | null;
  model_used?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GeminiAnalyzeRequest = await req.json();
    const { image, issueType = 'pothole', description = '' } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image payload is required for AI visual inspection' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    // ── Parse image base64 & mime type ──────────────────────────────────────
    let base64Data = image;
    let mimeType = 'image/jpeg';

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // ── Call Google Gemini Multimodal Vision API ───────────────────────────
    if (apiKey) {
      const prompt = `You are an expert AI Municipal Infrastructure & Civil Engineering Auditor for CivicTrack.
Inspect this photographic evidence thoroughly to verify whether it contains a genuine, outdoor municipal infrastructure defect.

STRICT REJECTION RULES (If ANY of these apply, you MUST return detected: false, is_civic_issue: false, count: 0, severity: 0):
- Human face, selfie, portrait, person, group of people, human body parts, hands, clothing.
- Indoor residential or office rooms (ceilings, tiled floors, bedrooms, kitchens, hallways, living rooms).
- Paper documents, notebook pages, books, ID cards, receipts, laptop/phone screens, text screenshots.
- Clean, undamaged, smooth pavements, roads, or grounds with NO civic damage.
- Household objects, furniture, toys, food, pets, indoor clutter.

STRICT ACCEPTANCE RULES (Outdoor civic defect must be clearly visible):
- "pothole": Road crater, asphalt cavity, broken bitumen, washed-out road surface depression. Count ALL distinct individual potholes clearly visible (e.g. 1, 2, 3, 4, 5, etc.).
- "garbage": Open uncollected municipal garbage heap, overflowing public dumpster.
- "streetlight": Broken, dark, smashed, or missing municipal street luminaire pole.
- "water_logging": Stagnant flood water or storm drainage water submerged on street.
- "water_leakage": Broken underground municipal water pipeline spewing onto public road.
- "exposed_wires": Dangling live 440V power cables, snapped wires, open distribution box.
- "fallen_tree": Fallen tree trunk or large bough blocking vehicle/pedestrian transit.
- "broken_footpath": Smashed, displaced, or missing pedestrian footpath pavers/curb stones.
- "manhole": Open, uncovered, cracked, or missing sewer manhole chamber.
- "dead_animal": Animal carcass needing municipal sanitation dispatch.
- "overgrown_bushes": Heavy roadside vegetation blocking pedestrian sightlines or walkways.
- "road_damage": Severe road subsidence, asphalt cave-in, sinkhole.

SEVERITY SCALE (CRITICAL: Integer strictly between 0 and 100):
- 0: Rejections / Non-defects / Faces / Clean surfaces.
- 15 - 35: Minor low-risk defect (small surface hairline crack, small litter spot).
- 36 - 65: Moderate civic hazard (standard road pothole, displaced paver, clogged gutter).
- 66 - 100: Severe / dangerous life-safety emergency (open sewer manhole, dangling live electric wires, deep high-speed road crater, massive sinkhole).
DO NOT return a 1-10 or 1-5 scale for severity. Scale is strictly 0 to 100.

Respond strictly with valid JSON conforming to this schema:
{
  "detected": boolean,
  "is_civic_issue": boolean,
  "count": number,
  "severity": number,
  "confidence": number,
  "issue_type": string,
  "description": string,
  "hazards_detected": string[],
  "rejection_reason": string | null
}`;

      const models = [
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
      ];

      for (const model of models) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                response_mime_type: 'application/json',
              },
            }),
          });

          if (res.ok) {
            const geminiResponse = await res.json();
            const rawText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const cleanedText = rawText.replace(/```json\n?|\n?```/g, '').trim();
              const parsedData: GeminiAnalyzeResponse = JSON.parse(cleanedText);

              // ── Severity calibration guardrail ──────────────────────────────
              let finalSeverity = Number(parsedData.severity) || 0;
              // If model accidentally returned 1-10 scale for a detected issue, scale to 0-100
              if (parsedData.detected && finalSeverity > 0 && finalSeverity <= 10) {
                finalSeverity = Math.min(100, Math.round(finalSeverity * 10));
              }

              // Enforce 0 severity and count for rejections
              if (!parsedData.detected || !parsedData.is_civic_issue) {
                finalSeverity = 0;
                parsedData.count = 0;
                parsedData.detected = false;
                parsedData.is_civic_issue = false;
                if (!parsedData.rejection_reason) {
                  parsedData.rejection_reason = 'Photo rejected: Image does not depict a valid municipal infrastructure defect.';
                }
              }

              const finalCount = parsedData.detected
                ? (typeof parsedData.count === 'number' && parsedData.count > 0 ? parsedData.count : 1)
                : 0;

              return NextResponse.json({
                ...parsedData,
                severity: finalSeverity,
                count: finalCount,
                confidence: parsedData.confidence ?? (parsedData.detected ? 0.94 : 0.0),
                model_used: model,
              });
            }
          }
        } catch (modelErr) {
          console.warn(`Model ${model} fetch failed:`, modelErr);
        }
      }
    }

    // ── If Gemini API is unreachable or no API key configured ───────────────
    // DO NOT invent synthetic 92% severity or fake acceptance for faces/random photos!
    return NextResponse.json({
      detected: false,
      is_civic_issue: false,
      count: 0,
      severity: 0,
      confidence: 0.0,
      issue_type: issueType,
      status: 'pending_manual_inspection',
      description: 'AI vision inspection service could not complete automated verification. Awaiting manual municipal review.',
      rejection_reason: null,
      hazards_detected: [],
      model_used: 'none',
    });
  } catch (error: any) {
    console.error('AI Gemini Analyze Route error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI image analysis', details: error?.message },
      { status: 500 }
    );
  }
}

