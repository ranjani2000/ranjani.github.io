export async function citydata() {
  let response = await fetch("./data/data.json");
  let json = await response.json();
  return json;
}
