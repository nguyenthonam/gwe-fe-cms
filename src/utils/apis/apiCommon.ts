export async function fetchData(endpoint: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
