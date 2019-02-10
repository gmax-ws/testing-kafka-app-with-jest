# Adapter App
The adapter app will take the Avro serialised messages and translate them into
a simple JSON format that contains the following attributes:
- `patientId` - The patient's unique identifier
- `action` - An integer representing the action to take (1 for create patient visit, 2 for transfer patient, 3 for end patient visit)
- `data` - An object that contains the payload data for the action

## Mapping
The adpater will map the following messages to a set of messages it sends out:
- `admit` will create 2 messages; a create patient visit message and a transfer from `null` ward to the ward the patient is admitted to
- `discharge` will create 2 messages; a message to end the patient visit and a transfer to `null` ward
- `transfer` will create 1 message; a transfer with the wards indicated in the original message

## Installation Notes
If you're on a Mac you may experience issues when running `npm install`. This is
most likely to do with `node-rdkafka` wanting to build `librdkafka` on installation.

A work around for this is:
- run `brew install librdkafka` before running `npm install`
- pass the `BUILD_LIBRDKAFKA=0` environment variable into the `npm install` (e.g. `BUILD_LIBRDKAFKA=0 npm install`)

## Running Notes
Currently if the schema registry isn't available on the server starting up the service will crash. Just restart the docker container / service

## Checking messages posted to Kafka
You can check the messages being posted to Kafka with the following command.
```
kafka-console-consumer --topic patientAdministration --bootstrap-server localhost:9092
```
