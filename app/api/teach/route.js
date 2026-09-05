export async function POST(request) {
  try {
    const { system, user } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Server is missing GROQ_API_KEY. Add it to .env.local and restart the dev server." }, { status: 500 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return Response.json({ error: `Groq API error ${groqRes.status}: ${errText.slice(0, 300)}` }, { status: 502 });
    }

    const data = await groqRes.json();
    let raw = data.choices?.[0]?.message?.content || "";
    raw = raw.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return Response.json({ error: "Model did not return valid JSON: " + raw.slice(0, 300) }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: err.message || "Unknown server error" }, { status: 500 });
  }
}
