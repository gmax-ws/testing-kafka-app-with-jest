# Adaptor App
The adaptor app will take the Avro serialised messages and translate them into
a simple JSON format that contains the following attributes:
- `patientId` - The patient's unique identifier
- `action` - An integer representing the action to take (1 for create patient, 2 for transfer patient, 3 for discharge patient)
- `data` - An object that contains the payload data for the action
