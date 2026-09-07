import os
import requests

from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

HOST = "google-map-places-new-v2.p.rapidapi.com"
URL = f"https://{HOST}/v1/places:searchText"


@tool
def search_restaurants(query: str):
    """
    Search restaurants using Google Maps Places API.
    """

    api_key = os.getenv("RAPID_API_KEY")

    if not api_key:
        return {
            "success": False,
            "error": "RAPID_API_KEY is missing in .env"
        }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "*",
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": api_key
    }

    body = {
        "textQuery": query,
        "languageCode": "en",
        "maxResultCount": 20
    }

    try:
        response = requests.post(
            URL,
            headers=headers,
            json=body,
            timeout=30
        )

        print("🍽️ RESTAURANT STATUS:", response.status_code)
        print("🍽️ RESTAURANT RESPONSE:", response.text)

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