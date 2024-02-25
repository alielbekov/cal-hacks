// Variables
const baseUrl = "https://api.twelvelabs.io/v1.2"
const apiKey = "tlk_2810X7B2K4PJY424A695F0TJJZKM"
const data = {
  "prompt": "I want you to give me a detailed description of the house/room shown in the video",
  "video_id": "6528b54a43e8c47e4eb47e80"
}


async function main(){

    const response = await fetch(baseUrl + "/generate", {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    const json = await response.json()
    console.log(json);

}
main();

