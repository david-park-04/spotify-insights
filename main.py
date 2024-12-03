# 
# Client-side Python app for Spotify Insights.
#
# Author: David Park
#

import requests
import jsons

import sys

# ----------
# Login 
# ----------
def login(baseurl):
    pass

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