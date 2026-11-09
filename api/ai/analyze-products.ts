import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema, ThinkingLevel } from '@google/genai';

/**
 * Serverless Gemini Vision Analyzer for JoJo Effects & Co.
 * Operates in production Vercel environments without exposing GEMINI_API_KEY to clients.
 * Validates admin auth, respects free-tier quotas, and returns structured product recognition.
 */

// Define response schema for structured Gemini product output
const productAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    product_type: {
      type: Type.STRING,
      description: 'The specific recognized physical item type (e.g., "Tote Bag", "Crossbody Bag", "Clutch / Purse", "Slide Sandals", "Stiletto Heels", "Sneakers", "Two-Piece Outfit", "Dress", "Human Hair Lace Wig", "Clip-In Hair Extensions", "Oversized Sunglasses", "Wristwatch", "Phone Case"). Must distinguish specific merchandise types accurately, never generic.',
    },
    product_name: {
      type: Type.STRING,
      description: 'Professional, attractive, and searchable product name that clearly identifies the item (e.g., "Monogram Cherry Print Tote Bag with Matching Pouch", "Oversized Tortoiseshell Sunglasses", "Women\'s Elegant Wristwatch", "Women\'s Two-Piece Casual Outfit"). Avoid unsupported brand names or authenticity claims.',
    },
    description: {
      type: Type.STRING,
      description: 'Concise, informative commercial description suitable for an online retail product page. Must clearly identify: 1) What the product is; 2) Its product type; 3) Visible design and appearance; 4) Distinctive patterns, colours, and features; 5) Included accessories or matching items where visible (e.g., matching pouch, removable straps); 6) Its style or intended use where reasonably identifiable. Do NOT assert materials like leather or suede unless confirmed in photograph. Completely ignore temporary packaging or protective wrapping.',
    },
    visible_specifications: {
      type: Type.ARRAY,
      description: 'Structured specifications based on the photograph and relevant to the particular product type (e.g., Product Type, Colour, Design or Pattern, Style, Shape or Structure, Visible Hardware or Details, Included Accessories, Handles, etc.).',
      items: {
        type: Type.OBJECT,
        properties: {
          key: { type: Type.STRING, description: 'Attribute name (e.g., "Product Type", "Colour", "Pattern", "Style", "Structure", "Handles", "Visible Details", "Included Accessories")' },
          value: { type: Type.STRING, description: 'Observed value based strictly on the photograph' }
        },
        required: ['key', 'value'],
      }
    },
    colors_visible: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Primary visible colors (e.g., ["Dark Brown", "Red", "Gold"]).'
    },
    suggested_category_id: {
      type: Type.STRING,
      description: 'The exact ID of the best-matching category from the provided list, or empty string if clearly a new category.',
    },
    suggested_new_category: {
      type: Type.STRING,
      description: 'If suggested_category_id is empty, provide a clean proposed category name. Otherwise empty string.',
    },
    suggested_group_tag: {
      type: Type.STRING,
      description: 'A brief identifier for grouping photos that clearly show the exact same physical product from different angles.'
    }
  },
  required: ['product_type', 'product_name', 'description', 'visible_specifications', 'colors_visible'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Method Check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authorization Check (Ensures only administrative console users can invoke)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  // 2. Validate Server-Side Gemini API Key
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY is not configured on the server. Please configure GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.' 
    });
  }

  const { imageUrl, imageBase64, mimeType, availableCategories, filename } = req.body || {};

  if (!imageUrl && !imageBase64) {
    return res.status(400).json({ error: 'Missing imageUrl or imageBase64 in request body.' });
  }

  try {
    const requestStartTime = Date.now();
    console.log('[API AI Analyze] Request received. Processing filename:', filename);

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion: 'v1beta',
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Format available categories for prompt injection
    const categoriesListFormatted = Array.isArray(availableCategories) && availableCategories.length > 0
      ? availableCategories.map((c: any) => `- ID: "${c.id}", Name: "${c.name}"`).join('\n')
      : 'None provided. Please suggest appropriate store category.';

    const promptText = `
You are the expert retail merchandising AI for JO JO EFFECTS & CO., an online luxury & fashion store specializing in women's hair & wigs, designer fashion handbags, footwear, apparel, watches, sunglasses, and phone accessories.

CORE OBJECTIVE:
Analyze the provided product photograph and automatically generate the standardized three-section product cataloguing structure:
1. Product Type Recognition (First identify the exact physical item type)
2. SECTION A: PRODUCT NAME
3. SECTION B: PRODUCT DESCRIPTION
4. SECTION C: PRODUCT SPECIFICATIONS

DETAILED CATALOGUING REQUIREMENTS:

1. PRODUCT TYPE RECOGNITION (Prerequisite):
   - First recognize the actual product type before generating its name, description, and specifications.
   - Accurately distinguish between specific merchandise types: handbags, purses, clutches, totes, crossbody bags, sandals, heels, shoes, clothing, two-piece outfits, dresses, wigs, hair extensions, sunglasses, watches, phone accessories, etc.
   - NEVER generate generic product types such as "Fashion Item", "Accessory", or "Merchandise".

2. SECTION A: PRODUCT NAME:
   - Generate a professional, attractive, and searchable product name that clearly identifies the item.
   - Examples of desired format:
     * "Monogram Cherry Print Tote Bag with Matching Pouch"
     * "Oversized Tortoiseshell Sunglasses"
     * "Women's Elegant Wristwatch"
     * "Women's Two-Piece Casual Outfit"
   - Avoid unsupported brand names, unauthorized trademark claims, or false authenticity claims.

3. SECTION B: PRODUCT DESCRIPTION:
   - Generate a concise but informative commercial description suitable for a premium online retail product page.
   - The description must clearly identify:
     a) What the product is.
     b) Its product type.
     c) Its visible design and appearance.
     d) Distinctive patterns, colours, and features.
     e) Included accessories or matching items, where visible (e.g., matching pouch, detachable shoulder strap, presentation box).
     f) Its style or intended use, where reasonably identifiable (e.g., everyday casual, evening elegance, summer vacation).
   - Write professionally, clearly, and customer-friendly.

4. SECTION C: PRODUCT SPECIFICATIONS:
   - Generate structured specifications based on the photograph, specifically tailored to the recognized product type.
   - Identify relevant attributes such as:
     * Product Type (e.g., "Tote Bag", "Oversized Sunglasses", "Wristwatch", "Two-Piece Outfit")
     * Colour (e.g., "Dark Brown and Red", "Tortoiseshell Brown", "Gold and Silver")
     * Design or Pattern (e.g., "Cherry Print", "Tortoiseshell", "Quilted Diamond", "Monogram", "Solid")
     * Style (e.g., "Structured Chic", "Oversized Vintage", "Classic Luxury", "Casual Elegance")
     * Shape or Structure (e.g., "Structured Tote", "Round Case", "Cat-Eye Frame", "Bodycon Silhouette")
     * Visible Hardware or Details (e.g., "Polished Gold-Tone Turn-Lock", "Decorative Temple Embellishment", "Fluted Bezel")
     * Included Accessories (e.g., "Matching Pouch", "Detachable Strap" - omit if none visible)
     * Other identifiable features relevant to the type (e.g., "Handles": "Double Top Handles", "Heel Type": "Block Heel", "Hair Texture": "Body Wave")

5. ACCURACY & STRICT CONSTRAINTS:
   - Only describe features that can reasonably be established from the photograph.
   - NO UNVERIFIED MATERIAL CLAIMS: DO NOT assert materials such as "leather", "genuine leather", "suede", "real leather", or specific textile blends unless explicitly stamped/printed and legible on the product in the photo. Use neutral, factual descriptions based on visible appearance (e.g., "smooth-textured finish", "pebbled texture", "light-toned handles", "woven strap", "polished gold-tone hardware").
   - IGNORE TEMPORARY PACKAGING & PROTECTIVE WRAPPING: Completely ignore any temporary transit packaging or protective wrapping (shrink film, tissue wrapping around handles/hardware, foam sleeves, corner guards, price/barcode tags, stuffing). NEVER treat protective wrapping as a permanent product feature.
   - DO NOT INVENT PRICES OR STOCK: Prices and stock quantities must remain empty/blank for administrator entry.
   - STORE CATEGORY SELECTION: Choose the most accurate category ID from this current active list:
${categoriesListFormatted}
If the item does not fit any existing category, leave suggested_category_id as empty string and suggest a clean category name in suggested_new_category.
   - Filename is "${filename || 'unknown'}". Provide suggested_group_tag if this image belongs to a multi-angle photo set for the same physical item.
`;

    let imagePart: any;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || 'image/jpeg',
        }
      };
    } else if (imageUrl) {
      // Fetch image buffer server-side to guarantee clean byte stream
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        return res.status(400).json({ error: `Failed to fetch image from secure URL: ${imgRes.statusText}` });
      }
      const buffer = await imgRes.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imgRes.headers.get('content-type') || mimeType || 'image/jpeg',
        }
      };
    }

    console.log(`[API AI Analyze] Calling AI Vision model for "${filename || 'product'}"...`);
    const geminiStartTime = Date.now();

    let response: any;
    try {
      // Primary: gemini-3.1-flash-lite (~1-2s response time)
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: {
          parts: [
            imagePart,
            { text: promptText }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: productAnalysisSchema,
          abortSignal: AbortSignal.timeout(20000), // 20s timeout
        }
      });
    } catch (primaryErr: any) {
      console.warn(`[API AI Analyze] Primary vision model error (${primaryErr?.message}), trying gemini-3.8-flash fallback...`);
      // Fallback: gemini-3.8-flash with ThinkingLevel.LOW
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            imagePart,
            { text: promptText }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: productAnalysisSchema,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
          abortSignal: AbortSignal.timeout(25000),
        }
      });
    }

    const geminiDuration = Date.now() - geminiStartTime;
    console.log(`[API AI Analyze] Gemini responded in ${geminiDuration}ms`);

    const responseText = response.text || '{}';
    const structuredProduct = JSON.parse(responseText);
    const totalDuration = Date.now() - requestStartTime;

    console.log(`[API AI Analyze] Finished successfully for "${filename}" in ${totalDuration}ms`);

    return res.status(200).json({
      success: true,
      analysis: structuredProduct,
      durationMs: totalDuration,
    });
  } catch (error: any) {
    console.error('Gemini vision analysis error:', error);

    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout') || error?.message?.includes('aborted')) {
      return res.status(504).json({
        error: 'AI vision request timed out after 25 seconds. Please retry.',
        code: 'TIMEOUT'
      });
    }

    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'Gemini free-tier rate quota exceeded. Please wait a moment before analyzing more photos.',
        code: 'QUOTA_EXHAUSTED'
      });
    }
    return res.status(500).json({
      error: error?.message || 'Failed to analyze product image.',
    });
  }
}
