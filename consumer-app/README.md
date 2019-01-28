# Consumer App
The consumer application will take the messages of the Kafka queue and return
a REST API that shows the different wards and patients in those wards.

The REST API supports the following endpoints:
- `/wards` - Lists the wards
- `/wards/{id}` - Shows the details for the ward
- `/patients` - Lists patients
- `/patients/{id}` - Shows the details for the patient

If the consumer application receives a message to create a patient it will check
if that patient exists and ignore the message if it does.
