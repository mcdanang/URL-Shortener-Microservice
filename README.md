# URL Shortener Microservice

User Stories
1. I can POST a URL to /api/shorturl and I will receive a shortened URL in the JSON response. Example : {"original_url":"https://www.google.com","short_url":1}
2. If I pass an invalid URL that doesn't follow the valid http(s)://www.example.com(/more/routes) format, the JSON response will contain an error like {"error":"invalid url"}. HINT: to be sure that the submitted url points to a valid site you can use the function dns.lookup(host, cb) from the dns core module.
3. When I visit the shortened URL, it will redirect me to my original link.
   
Creation Example:
POST /api/shorturl - body (urlencoded) : url=https://www.google.com

Usage:
[project_url]/api/shorturl/1

Will redirect to:
https://www.google.com
