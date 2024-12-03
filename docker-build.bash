#!/bin/bash
#
# Linux/Mac BASH script to build Docker container
docker rmi spotify-insights-client
docker build -t spotify-insights-client .