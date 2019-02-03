#!/usr/bin/env bash
until $(curl --output /dev/null --silent --head --fail http://$HOST_IP:8081) ; do
    echo "Still waiting for Schema Registry to become available";
    sleep 5;
done;