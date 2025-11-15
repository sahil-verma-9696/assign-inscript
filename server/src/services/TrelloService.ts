/******************************************************************************
                                Constants
******************************************************************************/

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all boards
 */
async function getAllBoards({ token }: { token: string }) {

  const requestUrl = new URL("https://api.trello.com/1/members/me/boards");

  // eslint-disable-next-line n/no-process-env
  requestUrl.searchParams.set("key", process.env.TRELLO_API_KEY!);
  requestUrl.searchParams.set("token", token);
  
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const responce = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return responce.json();
}

/**
 * Webhook
 */
async function webhook(){

};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAllBoards,
} as const;
