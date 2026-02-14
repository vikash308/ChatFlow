let IS_PROD = false;
const server = IS_PROD ?
    "https://chatflow-backend-g214.onrender.com" :

    "http://localhost:3001"


export default server;