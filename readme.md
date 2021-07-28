# Yellow API

This is API for get covid statistics data in US or get weather data according to keyword.
You can see postman collection the detail

Follow these steps to run this app

1. Clone this repo
2. Install node
3. $ npm install ## install dependencies package
4. $ ./init-redis.sh ## if you dont have docker, download it fist. Then use this command to startd redis for searching and store cache
5. $ npm run load ## to load name of 40s thousand of cities (for search cities text purpose)
6. $ npm start
7. Try to hit the API (see postman collection for the detail)
