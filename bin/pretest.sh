#!/bin/bash

echo "Checking if Hoverfly is running..."

if !(curl ${HOVERFLY_ADMIN_URL:-http://127.0.0.1:8888} > /dev/null 2>&1); then
  echo "Hoverfly is not running. Cannot run tests without it."
  echo "For local environment start it with:"
  echo
  echo "   docker run --name hoverfly -d -p 8888:8888 -p 8500:8500 spectolabs/hoverfly:latest"
  echo
  exit 1
fi

echo "Checking if Hoverfly is running... OK"
