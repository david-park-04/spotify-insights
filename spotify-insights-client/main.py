# 
# main.py 
#
# Client-side Python app for Spotify Insights.
#
# Author: David Park
#

import requests
import jsons

import sys
import logging
import webbrowser

# ----------
# Login 
# ----------
def login(baseurl):
    """
    Login necessary for application to gain authorization
    to user's Spotify.
    
    Parameters
    ----------
    baseurl: baseurl for web service
    
    Returns
    -------
    Nothing
    """
    
    try:
        api = "/login"
    
        url = baseurl + api
        
        res = requests.get(url)
        
        # Not a success
        if res.status_code != 200:
            print("Failed with status code:", res.status_code)
            print("url: " + url)
            
            return
        
        # 
        # Telling user to navigate to the authorization URL 
        #
        print()
        print("Navigate to the following URL to grant necessary permissions: \n")
        print(res.url)
        print()
        
        print("Authorize before proceeding...")
        print()
        
    except Exception as e:
        print("** ERROR **")
        logging.error("login() failed:")
        logging.error("url: " + url)
        logging.error(e)
        
# ----------
# Genre
# ----------
def genre(baseurl):
    """
    Find the frequencies of genres for your top tracks.
    
    Parameters
    ----------
    baseurl: baseurl for web service
    
    Returns 
    -------
    Nothing
    """
    
    try:
        
        api = "/genre"
        
        url = baseurl + api
        
        res = requests.get(url)
        
        # Not a success
        if res.status_code != 200:
            print("Failed with status code:", res.status_code)
            print("url: " + url)
            
            return
        
        # Success, get response and print out frequencies
        body = res.json()
        
        genre_frequencies = body["data"]
        for genre, frequency in genre_frequencies.items():
            print(f"{genre}: {frequency}")
    
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
        print("   1 => calculate genres of top tracks")
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
# Initial prompt
#
baseurl = "http://localhost:8080"

start_cmd = start()

if start_cmd == 0:
    print("** Ending application... **")
elif start_cmd == 1:
    login(baseurl)
else:
    print("** Unknown command, try again... **")

#
# Main processing loop
#
cmd = prompt()

while cmd != 0:
    #
    if cmd == 1:
        genre(baseurl)
    elif cmd == 2:
        pass
    elif cmd == 3:
        pass
    else:
        print("** Unknown command, try again... **")
  
    cmd = prompt()

#
# Done
#
print()
print('** Done **')