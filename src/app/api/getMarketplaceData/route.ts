export async function GET(request: Request) {
  let bearerToken = request.headers.get("Bearer");
  let XSRFToken = request.headers.get("XSRFToken");

  if (!bearerToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("Bearer token", bearerToken);
  console.log("XSRF token", XSRFToken);

  var myHeaders = new Headers({
    Cookie: "XSRF-TOKEN=" + XSRFToken + "; EPIC_BEARER_TOKEN=" + bearerToken,
    "User-Agent": "PostmanRuntime/7.37.3",
    "Accept": "*/*",
    "Host": "www.unrealengine.com",
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

      if (!response.ok || response.headers.get("content-type") !== "application/json; charset=utf-8") {
        console.log("Bad token")
        return {error: new Response("Bad response from server. Most likely due to an issue with the provided token.", { status: 500 })}
      }

      let data = await response.json();
      return data.data;
    } catch (error) {
      console.log("error", error);
      return {error: new Response("Error occurred on the server.", { status: 500 })};
    }
  }

  let data = await fetchData();
  
  if (data.error) {
    return new Response("Token provided did not work, go to profile page and update it.", { status: 401 });
  }

  //!! todo: see if we can do this in a better way so we dont spam the server with requests
  while(data.paging.start < data.paging.total) {
    let newData = await fetchData(data.paging.start + 100);
    data.elements = [...data.elements, ...newData.elements];
    data.paging.start = newData.paging.start;
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
