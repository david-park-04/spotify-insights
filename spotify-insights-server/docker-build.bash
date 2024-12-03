#!/bin/bash
#
# Linux/Mac BASH script to build docker container
#
docker rmi spotify-insights-server
docker build -t spotify-insights-server .