import os
import requests

from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

HOST = "tripadvisor-api.p.rapidapi.com"

URL = f"https://{HOST}/api/v1/location/search"


@tool
def get_restaurant_location(city: str):
    """
    Dynamically search a city on Tripadvisor
    and return its location information.
    """

    if not city or len(city.strip()) < 2:
        return {
            "success": False,
            "error": "City name is required."
        }

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
    "query": city.strip()
   }

    try:

        response = requests.get(
            URL,
            headers=headers,
            params=params,
            timeout=30
        )

        print("📍 LOCATION STATUS:", response.status_code)
        print("📍 LOCATION RESPONSE:", response.text)

        if response.status_code != 200:

            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }

        data = response.json()

        return {
            "success": True,
            "city": city,
            "data": data
        }

    except requests.exceptions.Timeout:

        return {
            "success": False,
            "error": "Location API request timed out."
        }

    except requests.exceptions.RequestException as e:

        return {
            "success": False,
            "error": f"Location API request failed: {str(e)}"
        }

    except Exception as e:

        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }

