import express from "express";
import cors from "cors";

const app = express();
//Here app is variable that is storing the express function which is used to create an express application.
// here we are creating express server and storing it in app variable.
//here are declaring constant app variable and this will not be change we cannot resaign the value of app variable.

app.use(cors());
//app the constant variable has stored the express application and we are using cors middleware to allow cross origin requests.
//cors is a middleware function which valid the incoming request and allow cross origin requests.
//cross origin requests are requests that are made from a different domain than the one that served the web page.
//different domain means different protocol, different host or different port.
//different domain examples are :
//1. http://localhost:3000 and http://localhost:5000 are different domains because they have different ports.
//2. http://localhost:3000 and https://localhost:3000 are different domains because they have different protocols.
//3. http://localhost:3000 and http://example.com are different domains because they have different hosts.

//so here the cors allows the frontend application running on a different domain
//  to make requests to the backend server running on a different domain.
//example of backend server running on a different domain is :
//1. frontend application running on http://localhost:3000 and backend server running on http://localhost:5000
//2. frontend application running on https://example.com and backend server running on https://api.example.com  
// so the above example shows that cors help to allows cross origin requests from frontend application to backend server.

//so how does it help to protect the backend server from malicious requests ?
//cors helps to protect the backend server from malicious requests by validating the incoming request and 
// allowing only the requests from the allowed origins.
//if the incoming request is from an origin that is not allowed then cors will block the request and
//  send a response with status code 403 Forbidden.
//this way cors helps to protect the backend server from malicious requests.
// example of malicious requests are :
//1. a request from a different domain that is not allowed by the backend server.
//2. a request from a different domain that is trying to access the backend server's resources without proper authentication.
//3. a request from a different domain that is trying to perform an action on the backend server's resources without proper authorization.  

//can you give example of above cases ? 
//here are some examples of the above cases :
//1. a request from a different domain that is not allowed by the backend server.
//example :
//frontend application running on http://localhost:3000 and backend server running on http://localhost:5000
//if the backend server is not allowing requests from http://localhost:3000 then the request will be blocked by cors and 
//  the response will be sent with status code 403 Forbidden.
//then in this code where we have defined that backend server is allowing requests from http://localhost:3000 ?
//we have not defined that backend server is allowing requests from http://localhost:3000 in this code.
//by default cors allows requests from all origins.
//if by default cors allows requests from all origins then how does it protect the backend server from malicious requests ?
//for example if we defined that backend server is allowing requests from http://localhost:3000 then the request from http://localhost:4000 will be blocked by cors and the response will be sent with status code 403 Forbidden.
//anything request come beside 3000 are treated as malicious request and blocked by cors and the response will be sent with status code 403 Forbidden.



app.use(express.json());
// this 
//here app has hold the express application and 
// we are using express.json() middleware to parse incoming requests with JSON payloads.
//the expres.json is bult in function of express
//the use is method is the method of express to use the function
//app hold the express application and then we use use method to use the express json and that express json help to parse the request



//express.json() is a middleware that parses incoming requests with JSON payloads and is based on body-parser.
//here we are using express.json() middleware to parse incoming requests with JSON payloads.

app.get("/", (req, res) => {
  res.send("Hello World!");
});
//here we are creating a get request to the root route and sending a response "Hello World!".

const PORT = process.env.PORT || 5000;
//here we are declaring a constant PORT variable and assigning it the value of process.env.PORT or 5000.
//process.env.PORT is an environment variable that is set by the hosting provider and is used to specify the port on which the server should listen.
//if process.env.PORT is not set then we are using 5000 as the default port.

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
//here we are making the server listen to the specified port and logging a message to the console when the server is running.           

