import os
import requests
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

RAPID_API_KEY = os.getenv("RAPID_API_KEY")

RAPIDAPI_HOST = "open-weather13.p.rapidapi.com"
BASE_URL = "https://open-weather13.p.rapidapi.com"


@tool
def get_weather(latitude: float, longitude: float):
    """
    Get 5-day weather forecast using latitude and longitude.
    """

    url = f"{BASE_URL}/fivedaysforcast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "lang": "EN"
    }

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPID_API_KEY
    }

    try:
        if not RAPID_API_KEY:
            return {"error": "RAPID_API_KEY missing in .env"}

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=15
        )

        response.raise_for_status()

        return response.json()

    except requests.exceptions.HTTPError:
        return {
            "error": f"HTTP {response.status_code}: {response.text}"
        }

    except requests.exceptions.Timeout:
        return {
            "error": "Weather API request timed out"
        }

    except requests.exceptions.RequestException as e:
        return {
            "error": f"Weather API request failed: {str(e)}"
        }

    except Exception as e:
        return {
            "error": f"Unexpected error: {str(e)}"
        }