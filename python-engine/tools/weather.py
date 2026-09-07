import os
import requests

from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()


@tool()
def get_weather(
    latitude: float,
    longitude: float,
    lang: str = "EN"
):
    """
    Get 5-day weather forecast using OpenWeather RapidAPI.

    latitude:
        Latitude of the location.

    longitude:
        Longitude of the location.

    lang:
        Language code. Default is EN.
    """

    api_key = os.getenv("RAPID_API_KEY")

    if not api_key:
        return {
            "success": False,
            "error": "RAPID_API_KEY is missing in .env"
        }

    url = (
        "https://open-weather13.p.rapidapi.com/"
        "fivedaysforcast"
    )

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-host": "open-weather13.p.rapidapi.com",
        "x-rapidapi-key": api_key
    }

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "lang": lang
    }

    try:

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=30
        )

        print("🌤️ WEATHER API STATUS:", response.status_code)

        if response.status_code != 200:
            return {
                "success": False,
                "error": "Weather API failed",
                "status_code": response.status_code,
                "details": response.text
            }

        data = response.json()

        print("🌤️ WEATHER RESULT:", data)

        return {
            "success": True,
            "latitude": latitude,
            "longitude": longitude,
            "forecast": data
        }

    except requests.exceptions.Timeout:

        return {
            "success": False,
            "error": "Weather API request timed out."
        }

    except requests.exceptions.RequestException as e:

        return {
            "success": False,
            "error": f"Weather API request failed: {str(e)}"
        }

    except Exception as e:

        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }