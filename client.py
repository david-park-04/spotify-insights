# 
# Client-side Python app for Spotify Insights.
#
# Author: David Park
#

import requests
import jsons

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

