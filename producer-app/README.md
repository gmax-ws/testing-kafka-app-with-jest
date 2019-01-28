# Producer App
The producer app will serve as the API gateway being used by ward manager to
manage the patients on their ward.

The app has three endpoints:
- `/admit` which will publish a message to create a patient and a message to transfer the patient to the admitting ward
- `/discharge` which will publish a message to discharge a patient
- `/transfer` which will publish a message to transfer a patient between wards

The messages being published will be serialised using Avro, a binary serialisation library.

## Installation Notes
If you're on a Mac you may experience issues when running `npm install`. This is
most likely to do with `node-rdkafka` wanting to build `librdkafka` on installation.

A work around for this is:
- run `brew install librdkafka` before running `npm install`
- pass the `BUILD_LIBRDKAFKA=0` environment variable into the `npm install` (e.g. `BUILD_LIBRDKAFKA=0 npm install`)
