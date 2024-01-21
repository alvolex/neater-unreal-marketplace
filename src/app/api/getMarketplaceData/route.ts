export async function GET(request: Request) {
  var myHeaders = new Headers({
    Cookie: "EPIC_BEARER_TOKEN="+ process.env.EPIC_BEARER_TOKEN + ";",
  });

  var requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  async function fetchData(start = 0) {
    try {
      const response = await fetch(
        `https://www.unrealengine.com/marketplace/api/assets/vault?lang=en-US&start=${start}&count=100`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();
      return data.data;
    } catch (error) {
      console.log("error", error);
      return new Response("Error occurred", { status: 500 });
    }
  }

  let data = await fetchData();
  while(data.paging.start < data.paging.total) {
    let newData = await fetchData(data.paging.start + 100);
    data.elements = data.elements.concat(newData);
    data.paging.start = newData.paging.start;
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
