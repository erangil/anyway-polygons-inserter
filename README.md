# anyway-polygons-inserter
This node.js project is intended to insert polygons into municipalities table.

In order to run it please follow these steps:
1. Download the inserter project into your env: https://github.com/erangil/anyway-polygons-inserter
2. Download the polygons project into your env: https://github.com/erangil/israel-municipalities-polygons
3. The two folders should reside as siblings
4. open cmd shell and go into the anyway-polygons-inserter folder
5. setup the DATABASE_URL env variable to which you want to load the polygons (e.g set DATABASE_URL=postgresql://postgres:admin@localhost:5432/anyway)
6. install node.js if not installed yet - https://nodejs.org/en/download/
6. run the following command - npm install package.json (this will install all the required modules)
7. run the following command - node index.js (this will execute the script and load the polygons into your municipalities table)

Good Luck!!!
