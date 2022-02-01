## Web Frontend
#### fictionio-front
Contain Frontend Web which is implemented by React , Redux-Saga

## Backend Service
There are 3 projects which are implemented by Typescript for deploying on google cloud function and using Google Cloud Firestore as a database.

#### fictionio-serverless-authen
On the authentication, it is using OAuth and JWT for authentication between frontend and backend service.
#### fictionio-serverless-novel
This module managed the content and versioning for each story.
#### fictionio-serverless-payment
This project is controlling the payment function which is connected to Omise Payment gateway and handling subscription status.
