export async function handler(event) {
  try {
    const body = JSON.parse(event.body)
    const userMessage = body.question

    const response = await fetch("http://13.60.33.234:5678/webhook/recycling-assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: userMessage
      })
    })

    const data = await response.json()

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        reply: data.reply || data.output || "ما في رد"
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Error from server"
      })
    }
  }
}