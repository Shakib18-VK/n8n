import os
import requests

from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

HOST = "youtube138.p.rapidapi.com"
URL = f"https://{HOST}/search/"


@tool
def search_youtube(query: str):
    """
    Search YouTube videos using YouTube138 RapidAPI.

    Example:
    search_youtube("Java DSA tutorial")
    """

    api_key = os.getenv("RAPID_API_KEY")

    if not api_key:
        return {
            "success": False,
            "error": "RAPID_API_KEY is missing in .env"
        }

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": api_key
    }

    params = {
        "q": query,
        "hl": "en",
        "gl": "US"
    }

    try:
        response = requests.get(
            URL,
            headers=headers,
            params=params,
            timeout=30
        )

        print("🎥 YOUTUBE STATUS:", response.status_code)
        print("🎥 YOUTUBE RESPONSE:", response.text)

        if response.status_code != 200:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }

        data = response.json()

        return {
            "success": True,
            "data": data
        }

    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": str(e)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }