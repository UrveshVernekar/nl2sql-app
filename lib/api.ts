export async function sendQuery(query: string) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/query`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        }
    );

    if (!res.ok) {
        throw new Error("Backend error");
    }

    return res.json();
}