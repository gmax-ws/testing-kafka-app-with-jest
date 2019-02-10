# Producer App
The producer app will serve as the API gateway being used by ward manager to
manage the patients on their ward.

The app has three endpoints:
- `/admit` which will publish a message to create a patient (takes object of: `name`, `nhsNumber`, `admittingWard`, `admissionDate`)
- `/discharge` which will publish a message to discharge a patient (takes object of: `nhsNumber`, `dischargeDate`)
- `/transfer` which will publish a message to transfer a patient between wards (takes object of: `nhsNumber`, `fromWard`, `toWard`, `transferDate`)

The messages being published will be serialised using Avro, a binary serialisation library.

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
kafka-avro-console-consumer --value-deserializer io.confluent.kafka.serializers.KafkaAvroDeserializer --key-deserializer org.apache.kafka.common.serialization.StringDeserializer --formatter io.confluent.kafka.formatter.AvroMessageFormatter --property print.key=true --property schema.registry.url=http://localhost:8081 --topic patient --bootstrap-server localhost:9092

```

## Publishing schemas
You can publish the schemas for the messages using the following commands:

### Patient-value Schema
```
curl -X POST \
  http://localhost:8081/subjects/patient-value/versions \
  -H 'Accept: application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 7d35a842-5cb8-4bc4-9768-09d3788490b1' \
  -H 'cache-control: no-cache' \
  -d '{
	"schema": "{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"PatientAdministation\",\"doc\":\"Avro Schema for patient administation\",\"fields\":[{\"name\":\"body\",\"type\":[{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"Admit\",\"doc\":\"Avro Schema for patient admission messages\",\"fields\":[{\"name\":\"nhsNumber\",\"type\":\"string\",\"doc\":\"NHS Number for the Patient\"},{\"name\":\"name\",\"type\":\"string\",\"doc\":\"Name of the Patient\"},{\"name\":\"admittingWard\",\"type\":\"string\",\"doc\":\"Code for the Ward the Patient is being admitted to\"},{\"name\":\"admissionDate\",\"type\":\"string\",\"doc\":\"Unix Epoch timestamp in ms at which the Patient was Admitted\"}]},{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"Discharge\",\"doc\":\"Avro Schema for patient discharge messages\",\"fields\":[{\"name\":\"nhsNumber\",\"type\":\"string\",\"doc\":\"NHS Number for the Patient\"},{\"name\":\"dischargeDate\",\"type\":\"string\",\"doc\":\"Unix Epoch timestamp in ms at which the Patient was Discharged\"}]},{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"Transfer\",\"doc\":\"Avro Schema for patient transfer messages\",\"fields\":[{\"name\":\"nhsNumber\",\"type\":\"string\",\"doc\":\"NHS Number for the Patient\"},{\"name\":\"fromWard\",\"type\":\"string\",\"doc\":\"Code for the Ward the Patient is being transferred from\"},{\"name\":\"toWard\",\"type\":\"string\",\"doc\":\"Code for the Ward the Patient is being transferred to\"},{\"name\":\"transferDate\",\"type\":\"string\",\"doc\":\"Unix Epoch timestamp in ms at which the Patient was Transferred\"}]}]}]}"
}'
```

### Patient-key Schema
```
curl -X POST \
  http://localhost:8081/subjects/patient-key/versions \
  -H 'Accept: application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 19c0ee1d-e5bb-4f82-b3ba-69e86cc0a80f' \
  -H 'cache-control: no-cache' \
  -d '{
	"schema": "\"string\""
}'
```

You'll need to add the schema to the schema registry before producing messages.
