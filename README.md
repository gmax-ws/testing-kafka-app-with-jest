# testing-kafka-app-with-jest
Example set of applications using Kafka and Avro and a set of end-to-end tests in Jest.

This was built as a demo for my blog post about [Testing Kafka queues with Jest on my Medium](https://medium.com/@colinwren/testing-a-apache-kafka-based-application-with-jest-avro-kafka-and-node-kafka-5dfa50389121).

If you find this project useful please leave a comment or 'Clap' on the blog post. Any PRs or Issues are gratefully accepted, this is a demo project so there may be use cases or bugs I've not covered.

## Set up
Before running the stack and tests you'll need to build the docker images for the different apps. You can do this with the following commands:

```bash
cd producer-app
docker build -t kafka-test/producer .
cd ../adapter-app
docker build -t kafka-test/adapter .
cd ../consumer-app
docker build -t kafka-test/consumer .
```

Once the images are build you can then use the following commands; `make run` & `make kill` to bring the stack up and down.

To bring the stack up the Makefile will:
- Bring up ZooKeeper, Kafka and the Avro Schema Registry
- Poll the Schema Registry until the REST interface is available
- Send the `patient` schema to the Schema Registry so it's ready to be used by the apps
- Create the `patient` and `patientAdministration` topics on the ZooKeeper & Kafka ready to be used by the apps
- Bring up the producer, adapter and consumer apps

## Running the tests
To run the tests, go into the `tests` directory and run `npm install` and then `npm test`. There will be a 10 second delay at the start of each test
suite, this is to give the Kafka consumers time to connect to the queues.

## Further info
There are README files in each app folder which go into detail about how each app works.
