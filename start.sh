#bundle exec thin start --threaded -l -  -o 0.0.0.0 -p 49992 
bundle exec rackup -s thin  -o 0.0.0.0 -p 49992 