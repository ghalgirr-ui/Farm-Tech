# Backend tests

Run the backend integration tests from this directory:

```sh
npm test
```

The suite uses Node.js's built-in test runner and `fetch` to exercise the Express API without
additional test dependencies. MongoDB must be running locally. Tests use only the
`farmtech_test` database; they do not fall back to the development URI in `.env`, and they
remove only test users and the products and orders associated with those users.

By default, the suite connects to `mongodb://127.0.0.1:27017/farmtech_test`. To use another
MongoDB test instance, set `FARMTECH_TEST_MONGO_URI` to a URI whose database name is exactly
`farmtech_test`. The test process refuses to connect if the database name differs.

The HTTP test server binds to IPv6 loopback (`::1`) and asks the operating system to select an
available port by default. To use a specific local port, set `FARMTECH_TEST_PORT` to an integer
from `1` to `65535`; the test server will report a startup error if that port is unavailable.
Setting it to `0` restores automatic port selection.
