Prerequisites:

```
docker run -d -p 8888:8888 -p 8500:8500 spectolabs/hoverfly:latest
```

CURL_CA_BUNDLE=tests/res/cert.pem
REQUESTS_CA_BUNDLE=tests/res/cert.pem
NODE_EXTRA_CA_CERTS=tests/res/cert.pem
