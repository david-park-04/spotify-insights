# 
# Client-side Python app for Spotify Insights.
#
# Author: David Park
#

import requests
import jsons

import sys
import logging
import time

# ----------
# Web Service Get
# ----------
def web_service_get(url):
  """
  Submits a GET request to a web service at most 3 times, since 
  web services can fail to respond e.g. to heavy user or internet 
  traffic. If the web service responds with status code 200, 400 
  or 500, we consider this a valid response and return the response.
  Otherwise we try again, at most 3 times. After 3 attempts the 
  function returns with the last response.
  
  Parameters
  ----------
  url: url for calling the web service
  
  Returns
  -------
  response received from web service
  """

  try:
    retries = 0
    
    while True:
      response = requests.get(url)
        
      if response.status_code in [200, 400, 500]:
        #
        # we consider this a successful call and response
        #
        break;

      #
      # failed, try again?
      #
      retries = retries + 1
      if retries < 3:
        # try at most 3 times
        time.sleep(retries)
        continue
          
      #
      # if get here, we tried 3 times, we give up:
      #
      break

    return response

  except Exception as e:
    print("**ERROR**")
    logging.error("web_service_get() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return None

# ----------
# Login 
# ----------
def login(baseurl):
    """
    
    """
    try:
        api = "login/"
    
        url = baseurl + api
        
        res = web_service_get(url)
        
        # Not a success
        if res.status_code != 200:
            print("Failed with status code:", res.status_code)
            print("url: " + url)
            
            return
    
    except Exception as e:
        print("** ERROR **")
        logging.error("login() failed:")
        logging.error("url: " + url)
        logging.error(e)
    
# ----------
# Start
# ----------
def start():
    """
    Starting display for the application.
    
    Parameters
    ----------
    None
    
    Returns
    -------
    Command number
    """
    
    try: 
        print()
        print(">> Get started:")
        print("   0 => end")
        print("   1 => login")
        
        cmd = int(input())
        
        return cmd
        
    except Exception as e:
        print("ERROR: Invalid input")
        return -1

# ----------
# Prompt
# ----------
def prompt():
    """
    Prompts the user and returns a command number.
    
    Parameters
    ----------
    None
    
    Returns
    -------
    Command number
    """
    
    try:
        print()
        print(">> Enter a command:")
        print("   0 => end")
        print("   1 => command 1")
        print("   2 => command 2")
        print("   3 => command 3")
        
        cmd = int(input())
        
        return cmd
        
    except Exception as e:
        print("ERROR: Invalid input")
        return -1

# ----------
# Main
# ----------
print("** Welcome to Spotify Insights! **\n")

# Eliminating traceback for just error message
sys.tracebacklimit = 0

#
# Starting processing loop
#
baseurl = "http://localhost:8080/"

start_cmd = start()

while start_cmd != 0:
    
  if start_cmd == 1:
    login(baseurl)
  else:
    print("** Unknown command, try again... **")
  
  start_cmd = start()