#!/usr/bin/make

run:
	HOST_IP=$(shell ifconfig en0 | grep inet | grep -v inet6 | awk '{print $$2}') docker-compose -f confluent.yml up -d
	/bin/bash scripts/waitForSchemaRegistry.sh
	/bin/bash scripts/setUpSchemas.sh
	/bin/bash scripts/createTopics.sh
	HOST_IP=$(shell ifconfig en0 | grep inet | grep -v inet6 | awk '{print $$2}') docker-compose -f confluent.yml -f apps.yml up -d

kill:
	docker-compose -f confluent.yml -f apps.yml stop
	docker-compose -f confluent.yml -f apps.yml rm -f