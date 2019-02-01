#!/usr/bin/make

run:
	HOST_IP=$(shell ifconfig en0 | grep inet | grep -v inet6 | awk '{print $$2}') docker-compose -f docker-compose.yml up -d

kill:
	docker-compose -f docker-compose.yml stop
	docker-compose -f docker-compose.yml rm -f