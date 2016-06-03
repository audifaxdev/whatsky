Requirements : Redis server

The project uses Redis with AOF enabled, once it's installed check the following :

1)Make sure to set appendonly yes in your redis configuration file

2)Make sure that the directory of the redis-server command line tool is your executable system path for node to launch redis automatically.

Installation and Use

npm i && npm start;