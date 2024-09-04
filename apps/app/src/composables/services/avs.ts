export function useAVS() {
    const baseUrl = "https://api.eigenexplorer.com/"
    const testNetBaseUrl = "https://api-holesky.eigenexplorer.com/"
    const endpoints = ["version", "metrics", "avs", "operators", "stakers", "withdrawals"]
    const endpoint = "avs"
    
    async function fetchAllAVSs() {
        let take = 12
        let skip = 0
        const allRecords = []
        let totalRecords = 0
    
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    
        while (totalRecords === 0 || skip < totalRecords) {
            const url = `${baseUrl}${endpoint}?skip=${skip}&take=${take}&withTvl=true`
            const response = await fetch(url, options)
            if (!response.ok) {
                console.error(`Failed to retrieve data: ${response.status}`)
                break
            }
            const { data, meta } = await response.json()
            allRecords.push(...data)
            totalRecords = meta.total
            take = meta.take
            skip += take
        }
        console.log("allRecords", allRecords)
        return allRecords
    }

    return {
        fetchAllAVSs
    }
}