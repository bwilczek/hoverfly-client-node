# Overview

This repository contains a `node` client library for [Hoverfly Proxy REST API](https://docs.hoverfly.io/en/latest/pages/reference/api/api.html#).

Hoverfly is an HTTP Proxy service designed to support E2E testing of multi-service applications. It can:
* serve pre-recorded responses for communication with external services
* record communication with external services
* simulate delays and outages in communication
* and [much more](https://docs.hoverfly.io/en/latest/pages/keyconcepts/keyconcepts.html)

In order to make the application under test benefit from `Hoverfly` it has to be configured to route
its HTTP requests through the proxy. In most cases setting up environment variables (`http_proxy`, `https_proxy`, `no_proxy`) is sufficient,
but some HTTP clients may require additional setup. `Hoverfly` exposes the proxy service on port 8500.

Once the application under test is configured to use the `Hoverfly` proxy on port 8500 the test code can control the proxy behavior
using the REST interface exposed on port 8888. This is where this library comes in.

# Usage

## Setup

Installation of the node package is standard:

```shell
# with npm
npm install -D @bwilczek/hoverfly-client

# with yarn
yarn add --dev @bwilczek/hoverfly-client
```

`Hoverfly` can be started locally using `docker`:

```
docker run --name hoverfly -d -p 8888:8888 -p 8500:8500 spectolabs/hoverfly:latest
```

### SSL Certificate

`Hoverfly` comes bundled with an SSL certificate that is required to proxy traffic to secure websites.
However, as it is a testing tool, this certificate is self signed, and needs to be explicitly marked as trusted.
A copy of Hoverfly's `pem` file can be found in `tests/res/cert.pem`.

Marking it as trusted can vary depending on the OS or HTTP client. Here are some examples:

* System setting in `debian` family: `cp tests/res/cert.pem /usr/local/share/ca-certificates/hoverfly.crt && update-ca-certificates`
* Python's `requests` package: `REQUESTS_CA_BUNDLE=tests/res/cert.pem`
* Node's extra CA setting: `NODE_EXTRA_CA_CERTS=tests/res/cert.pem`
* Curl's extra CA setting: `CURL_CA_BUNDLE=tests/res/cert.pem` (it should respect system settings though)
* Others may vary and depend on the package

## Sample workflow

Let's use `curl` to demonstrate how to use and control `Hoverfly` proxy.

### Capturing an example request to `httpbingo.org`.

```typescript
import { Client } from "@bwilczek/hoverfly-client"

const client = new Client("http://127.0.0.1:8888")
await client.setMode({mode: 'capture'})
```

`Hoverfly` proxy will be capturing the request/response pairs and storing them internally as a [Simulation](https://docs.hoverfly.io/en/latest/pages/keyconcepts/simulations/simulations.html).

Now let's perform the request:

```shell
export http_proxy=http://127.0.0.1:8500
export https_proxy=http://127.0.0.1:8500
export no_proxy=127.0.0.1,localhost
export CURL_CA_BUNDLE=tests/res/cert.pem # if cert is not added to system store

curl https://httpbingo.org/status/418  # displays "I'm a teapot!"
```

At this stage Hoverfly has the request-response pair recorded and stored in process memory.

This pair can now be stored for further use:

```shell
curl http://127.0.0.1:8888/api/v2/simulation > teapot.json
```
or alternatively
```typescript
import { saveSimulationToFile } from "@bwilczek/hoverfly-client"

const sim = await client.getSimulation()
saveSimulationToFile(sim, 'teapot.json')
```

### Serving prepared responses

In order to make `Hoverfly` serve a specific response proper Simulation object needs to be uploaded.
There are two ways to craft a simulation:

#### Edit the JSON file

Open the `teapot.json` file created in the previous step in any text editor. Format it, introduce the changes, and save.
For this example let's change the response body from `I'm a teapot!` to `I used to be a teapot!`.

After the file is saved uploading it to `Hoverfly` can be achieved with:

```typescript
import { buildSimulationFromFile } from "@bwilczek/hoverfly-client"

const sim = buildSimulationFromFile('teapot.json')
await client.uploadSimulation(sim)
```

#### Craft Simulation programmatically

```typescript
import { buildSimulation, ResponseData, RequestMatcher } from "@bwilczek/hoverfly-client"

const response: ResponseData = {
  status: 200,
  body: 'I used to be a teapot!',
  encodedBody: false,
  templated: false
}

const request: RequestMatcher = {
  path: [{ matcher: 'exact', value: '/status/418' }],
  destination: [{ matcher: 'exact', value: 'httpbingo.org' }],
}

const pair = { request: request, response: response }

const sim = buildSimulation([pair])
await client.uploadSimulation(sim)
```

Now, in order to make `Hoverfly` serve the responses from the uploaded simulation
its operation mode needs to be changed from `capture` to `simulate`:

```typescript
await client.setMode({mode: 'simulate'})
```

A this stage `curl` will receive the forged response from `Hoverfly`, and no traffic to external service will take a place.

```shell
export http_proxy=http://127.0.0.1:8500
export https_proxy=http://127.0.0.1:8500
export no_proxy=127.0.0.1,localhost
export CURL_CA_BUNDLE=tests/res/cert.pem # if cert is not added to system store

curl https://httpbingo.org/status/418  # displays "I used to be a teapot!"
```

## Managing Simulations

In more complex test suites there will be multiple request/response pairs
that will be activated, modified or deactivated during the test suite execution.
Here's how to deal with such use cases.

```typescript
import { buildSimulationFromFile, Client } from "@bwilczek/hoverfly-client"

const client = new Client("http://127.0.0.1:8888")

// upload a set of request/response pairs that should be always active
await client.uploadSimulation(buildSimulationFromFile('always_active_stubs.json'))

// add request/response pair that will simulate specific condition
await client.uploadSimulation(buildSimulationFromFile('google_auth_failure.json'))

// remove that pair
await client.removeSimulation(buildSimulationFromFile('google_auth_failure.json'))

// or just upload the default set again, overwriting the current state
await client.uploadSimulation(buildSimulationFromFile('always_active_stubs.json'))
```

There are also two support functions that could be useful when crafting simulation instances manually:

* `mergeSimulations(left: Simulation, right: Simulation): Simulation`
* `subtractSimulations(left: Simulation, right: Simulation): Simulation`

## Inspecting processed requests

One of typical assertions in an E2E/integration test suite is something like:

*Assert that some service has been requested with given parameters*

Hoverfly provides tooling for such assertions through the concept of `Journal`. Example:

```typescript
// Testing communication with external payment provider

// pre-requisite: make sure that the communication with the real system has been recorded before
// then saved as `simulations/payments.json` and modified if required

// prepare Hoverfly for the expected communication with payment provider
await client.uploadSimulation(buildSimulationFromFile('simulations/payments.json'))
// without this simulation being loaded any request to payment provider will result in an exception
// that's how Hoverfly works in `simulate` mode, and that's what we want in E2E test

// do some actions in the UI, that will make the app under test perform a request to payment provider
await browser.submitPaymentButton.click()

// assert that the backend really performed a request to the payment provider
const paymentsJournal = await client.searchJournal({request: {destination: [{matcher: "exact", value: "payment.provider"}]}})
expect(paymentsJournal.journal.length).toBe(1)
```

## Supported REST endpoints

[Hoverfly Proxy REST API](https://docs.hoverfly.io/en/latest/pages/reference/api/api.html#) exposes more than 40 endpoints.
This library, at this stage, supports the following subset, represented as methods of `Client` class:

* `GET /api/v2/hoverfly/mode` : `getMode(): Promise<ModePayload>`
* `PUT /api/v2/hoverfly/mode` : `setMode(payload: SetModePayload): Promise<ModePayload>`
* `GET /api/v2/hoverfly/middleware` : `getMiddleware(): Promise<MiddlewarePayload>`
* `PUT /api/v2/hoverfly/middleware` : `setMiddleware(payload: MiddlewarePayload): Promise<MiddlewarePayload>`
* `purgeMiddleware(): Promise<MiddlewarePayload>` - sets current middleware to an empty object
* `DELETE /api/v2/journal` - `purgeJournal(): Promise<Journal>`
* `GET /api/v2/journal` - `getJournal(): Promise<Journal>`
* `POST /api/v2/journal` - `searchJournal(payload: JournalSearchPayload): Promise<Journal>`
* `DELETE /api/v2/simulation` - `purgeSimulation(): Promise<Simulation>`
* `GET /api/v2/simulation` - `getSimulation(): Promise<Simulation>`
* `PUT /api/v2/simulation` - `uploadSimulation(payload: Simulation): Promise<Simulation>`

## Development status

This library is in its early development stage.
It lacks more thorough test coverage and not all endpoints are covered.

The current functionality is enough for most of E2E/integration testing use cases.
It will extended gradually over time.

Feel free to contribute with PRs and report any ideas or bugs are GH issues.
