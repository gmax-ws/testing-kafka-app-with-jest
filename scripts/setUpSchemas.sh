#!/usr/bin/env bash
# Set up the patient value schema
curl -X POST \
  http://localhost:8081/subjects/patient-value/versions \
  -H 'Accept: application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 7d35a842-5cb8-4bc4-9768-09d3788490b1' \
  -H 'cache-control: no-cache' \
  -d '{
	"schema": "{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"PatientAdministation\",\"doc\":\"Avro Schema for patient administation\",\"fields\":[{\"name\":\"body\",\"type\":[{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"Admit\",\"doc\":\"Avro Schema for patient admission messages\",\"fields\":[{\"name\":\"nhsNumber\",\"type\":\"string\",\"doc\":\"NHS Number for the Patient\"},{\"name\":\"name\",\"type\":\"string\",\"doc\":\"Name of the Patient\"},{\"name\":\"admittingWard\",\"type\":\"string\",\"doc\":\"Code for the Ward the Patient is being admitted to\"},{\"name\":\"admissionDate\",\"type\":\"string\",\"doc\":\"Unix Epoch timestamp in ms at which the Patient was Admitted\"}]},{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"Discharge\",\"doc\":\"Avro Schema for patient discharge messages\",\"fields\":[{\"name\":\"nhsNumber\",\"type\":\"string\",\"doc\":\"NHS Number for the Patient\"},{\"name\":\"dischargeDate\",\"type\":\"string\",\"doc\":\"Unix Epoch timestamp in ms at which the Patient was Discharged\"}]},{\"type\":\"record\",\"namespace\":\"com.colinwren\",\"name\":\"Transfer\",\"doc\":\"Avro Schema for patient transfer messages\",\"fields\":[{\"name\":\"nhsNumber\",\"type\":\"string\",\"doc\":\"NHS Number for the Patient\"},{\"name\":\"fromWard\",\"type\":\"string\",\"doc\":\"Code for the Ward the Patient is being transferred from\"},{\"name\":\"toWard\",\"type\":\"string\",\"doc\":\"Code for the Ward the Patient is being transferred to\"},{\"name\":\"transferDate\",\"type\":\"string\",\"doc\":\"Unix Epoch timestamp in ms at which the Patient was Transferred\"}]}]}]}"
}'

# Set up the patient key schema
curl -X POST \
  http://localhost:8081/subjects/patient-key/versions \
  -H 'Accept: application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 19c0ee1d-e5bb-4f82-b3ba-69e86cc0a80f' \
  -H 'cache-control: no-cache' \
  -d '{
	"schema": "\"string\""
}'
