let IS_PROD = false;
const server = IS_PROD ?
    "something" :

    "http://localhost:3001"


export default server;